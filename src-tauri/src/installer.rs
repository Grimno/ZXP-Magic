use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use zip::ZipArchive;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtensionInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub host_list: Vec<HostApp>,
    pub cep_version: String,
    pub install_path: Option<String>,
    pub icon_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostApp {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstallResult {
    pub success: bool,
    pub message: String,
    pub extension: Option<ExtensionInfo>,
}

/// Returns the primary (user-level) CEP extensions folder — used as install target
pub fn get_extensions_folder() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA")
            .unwrap_or_else(|_| std::env::var("USERPROFILE")
                .map(|p| format!("{}\\AppData\\Roaming", p))
                .unwrap_or_else(|_| "C:\\Users\\Default\\AppData\\Roaming".to_string()));
        PathBuf::from(appdata)
            .join("Adobe")
            .join("CEP")
            .join("extensions")
    }
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_else(|_| "~".to_string());
        PathBuf::from(home)
            .join("Library")
            .join("Application Support")
            .join("Adobe")
            .join("CEP")
            .join("extensions")
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        PathBuf::from("/tmp/cep_extensions")
    }
}

/// Returns all CEP extension folders to scan (user-level + system-level)
fn get_all_extension_folders() -> Vec<PathBuf> {
    let mut folders = vec![get_extensions_folder()];

    #[cfg(target_os = "windows")]
    {
        // System-level: C:\Program Files (x86)\Common Files\Adobe\CEP\extensions
        let sys_x86 = PathBuf::from("C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions");
        if sys_x86.exists() {
            folders.push(sys_x86);
        }
        // System-level: C:\Program Files\Common Files\Adobe\CEP\extensions
        let sys = PathBuf::from("C:\\Program Files\\Common Files\\Adobe\\CEP\\extensions");
        if sys.exists() && !folders.contains(&sys) {
            folders.push(sys);
        }
    }
    #[cfg(target_os = "macos")]
    {
        // System-level: /Library/Application Support/Adobe/CEP/extensions
        let sys = PathBuf::from("/Library/Application Support/Adobe/CEP/extensions");
        if sys.exists() {
            folders.push(sys);
        }
    }

    folders
}

/// Parse manifest.xml from a ZXP (zip) file
pub fn get_extension_info_from_zxp(path: &str) -> Result<ExtensionInfo, String> {
    let file = fs::File::open(path).map_err(|e| format!("Cannot open file: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("Not a valid ZXP: {}", e))?;

    // Find CSXS/manifest.xml inside the ZXP
    let manifest_xml = {
        let mut found = None;
        for i in 0..archive.len() {
            if let Ok(entry) = archive.by_index(i) {
                let name = entry.name().to_lowercase();
                if name.ends_with("manifest.xml") {
                    found = Some(i);
                    break;
                }
            }
        }
        let idx = found.ok_or("manifest.xml not found in ZXP")?;
        let mut entry = archive.by_index(idx).map_err(|e| e.to_string())?;
        let mut content = String::new();
        entry.read_to_string(&mut content).map_err(|e| e.to_string())?;
        content
    };

    parse_manifest_xml(&manifest_xml, None)
}

/// Returns true if the extension ID looks like an Adobe built-in (not user-installed)
fn is_adobe_builtin(id: &str) -> bool {
    // All of Adobe's own internal extensions use the com.adobe. namespace.
    // Users never install extensions under this namespace themselves.
    id.to_lowercase().starts_with("com.adobe.")
}

/// Scan all CEP extension folders and return all installed extensions
pub fn list_extensions() -> Vec<ExtensionInfo> {
    let mut result: Vec<ExtensionInfo> = Vec::new();
    let mut seen_ids: std::collections::HashSet<String> = std::collections::HashSet::new();

    for extensions_dir in get_all_extension_folders() {
        if !extensions_dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&extensions_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if !path.is_dir() {
                    continue;
                }

                let manifest_path = path.join("CSXS").join("manifest.xml");
                if !manifest_path.exists() {
                    continue;
                }

                if let Ok(content) = fs::read_to_string(&manifest_path) {
                    if let Ok(mut info) = parse_manifest_xml(&content, Some(&path)) {
                        // Skip Adobe built-in extensions from system folders
                        let is_user_folder = extensions_dir == get_extensions_folder();
                        if !is_user_folder && is_adobe_builtin(&info.id) {
                            continue;
                        }

                        // Skip duplicates (same extension in multiple folders)
                        if seen_ids.contains(&info.id) {
                            continue;
                        }
                        seen_ids.insert(info.id.clone());

                        // Look for extension icon (manifest icon takes priority)
                        if info.icon_path.is_none() {
                            // Fallback: scan common icon filenames in extension root
                            for icon_name in &["icon.png", "Icon.png", "icon.svg", "logo.png", "icon.jpg"] {
                                let icon = path.join(icon_name);
                                if icon.exists() {
                                    info.icon_path = Some(icon.to_string_lossy().to_string());
                                    break;
                                }
                            }
                        }
                        // Also check CSXS/ folder for icons
                        if info.icon_path.is_none() {
                            let csxs_dir = path.join("CSXS");
                            for icon_name in &["icon.png", "Icon.png", "icon.svg"] {
                                let icon = csxs_dir.join(icon_name);
                                if icon.exists() {
                                    info.icon_path = Some(icon.to_string_lossy().to_string());
                                    break;
                                }
                            }
                        }
                        info.install_path = Some(path.to_string_lossy().to_string());
                        result.push(info);
                    }
                }
            }
        }
    }

    result.sort_by(|a, b| a.name.cmp(&b.name));
    result
}

/// Install a ZXP file into the extensions folder
pub fn install_extension(path: &str) -> InstallResult {
    // First, read extension info
    let info = match get_extension_info_from_zxp(path) {
        Ok(i) => i,
        Err(e) => {
            return InstallResult {
                success: false,
                message: format!("Invalid ZXP file: {}", e),
                extension: None,
            };
        }
    };

    let extensions_dir = get_extensions_folder();
    let target_dir = extensions_dir.join(&info.id);

    // Remove existing installation if present
    if target_dir.exists() {
        if let Err(e) = fs::remove_dir_all(&target_dir) {
            return InstallResult {
                success: false,
                message: format!("Cannot remove existing installation: {}", e),
                extension: None,
            };
        }
    }

    // Create target directory
    if let Err(e) = fs::create_dir_all(&target_dir) {
        return InstallResult {
            success: false,
            message: format!("Cannot create extension directory: {}", e),
            extension: None,
        };
    }

    // Extract ZXP contents
    let file = match fs::File::open(path) {
        Ok(f) => f,
        Err(e) => {
            return InstallResult {
                success: false,
                message: format!("Cannot open ZXP file: {}", e),
                extension: None,
            };
        }
    };

    let mut archive = match ZipArchive::new(file) {
        Ok(a) => a,
        Err(e) => {
            return InstallResult {
                success: false,
                message: format!("Cannot read ZXP archive: {}", e),
                extension: None,
            };
        }
    };

    for i in 0..archive.len() {
        let mut entry = match archive.by_index(i) {
            Ok(e) => e,
            Err(_) => continue,
        };

        // Skip META-INF (ZXP signature files)
        if entry.name().starts_with("META-INF") {
            continue;
        }

        let out_path = target_dir.join(entry.name());

        if entry.name().ends_with('/') {
            let _ = fs::create_dir_all(&out_path);
        } else {
            if let Some(parent) = out_path.parent() {
                let _ = fs::create_dir_all(parent);
            }
            if let Ok(mut out_file) = fs::File::create(&out_path) {
                let _ = std::io::copy(&mut entry, &mut out_file);
            }
        }
    }

    let mut installed_info = info.clone();
    installed_info.install_path = Some(target_dir.to_string_lossy().to_string());

    InstallResult {
        success: true,
        message: format!("'{}' installed successfully!", info.name),
        extension: Some(installed_info),
    }
}

/// Remove an installed extension by its ID (searches all known CEP folders)
pub fn uninstall_extension(extension_id: &str) -> Result<(), String> {
    for folder in get_all_extension_folders() {
        let target = folder.join(extension_id);
        if target.exists() {
            return fs::remove_dir_all(&target)
                .map_err(|e| format!("Cannot remove extension: {}", e));
        }
    }
    Err(format!("Extension '{}' not found", extension_id))
}

/// All known CSXS versions (newest first)
const CSXS_VERSIONS: &[&str] = &["12", "11", "10", "9", "8", "7"];

/// Read CEP PlayerDebugMode registry/plist setting
pub fn get_debug_mode() -> bool {
    #[cfg(target_os = "windows")]
    {
        use winreg::RegKey;
        use winreg::enums::HKEY_CURRENT_USER;
        // Check newest first — if any version has debug mode on, return true
        for version in CSXS_VERSIONS {
            let key_path = format!("SOFTWARE\\Adobe\\CSXS.{}", version);
            if let Ok(hkcu) = RegKey::predef(HKEY_CURRENT_USER).open_subkey(&key_path) {
                let val: Result<String, _> = hkcu.get_value("PlayerDebugMode");
                if val.map(|v| v == "1").unwrap_or(false) {
                    return true;
                }
            }
        }
        false
    }
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_default();
        for version in CSXS_VERSIONS {
            let plist = format!(
                "{}/Library/Preferences/com.adobe.CSXS.{}.plist",
                home, version
            );
            if let Ok(output) = std::process::Command::new("defaults")
                .args(["read", &plist, "PlayerDebugMode"])
                .output()
            {
                let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if val == "1" {
                    return true;
                }
            }
        }
        false
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    false
}

/// Set CEP PlayerDebugMode
pub fn set_debug_mode(enabled: bool) -> Result<(), String> {
    let value = if enabled { "1" } else { "0" };

    #[cfg(target_os = "windows")]
    {
        use winreg::RegKey;
        use winreg::enums::{HKEY_CURRENT_USER, KEY_SET_VALUE};
        // Write to all known CSXS versions (including CSXS.12)
        for version in CSXS_VERSIONS {
            let key_path = format!("SOFTWARE\\Adobe\\CSXS.{}", version);
            if let Ok(key) = RegKey::predef(HKEY_CURRENT_USER)
                .open_subkey_with_flags(&key_path, KEY_SET_VALUE)
            {
                let _ = key.set_value("PlayerDebugMode", &value.to_string());
            } else if let Ok((key, _)) = RegKey::predef(HKEY_CURRENT_USER)
                .create_subkey(&key_path)
            {
                let _ = key.set_value("PlayerDebugMode", &value.to_string());
            }
        }
        return Ok(());
    }
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_default();
        for version in CSXS_VERSIONS {
            let plist = format!(
                "{}/Library/Preferences/com.adobe.CSXS.{}.plist",
                home, version
            );
            let _ = std::process::Command::new("defaults")
                .args(["write", &plist, "PlayerDebugMode", value])
                .output();
        }
        return Ok(());
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    Err("Unsupported platform".to_string())
}

// ─── XML Parsing ─────────────────────────────────────────────────────────────

fn parse_manifest_xml(xml: &str, base_path: Option<&Path>) -> Result<ExtensionInfo, String> {
    let mut id = String::new();
    let mut name = String::new();
    let mut version = String::new();
    let mut description = String::new();
    let mut author = String::new();
    let mut cep_version = String::new();
    let mut host_list: Vec<HostApp> = Vec::new();
    let mut icon_path: Option<String> = None;
    let mut required_runtime_version: Option<String> = None;

    // Extract with regex-like string operations
    for line in xml.lines() {
        let line = line.trim();

        if line.contains("<Extension ") || line.starts_with("<Extension ") {
            if let Some(v) = extract_attr(line, "Id") {
                if id.is_empty() {
                    id = v;
                }
            }
            if let Some(v) = extract_attr(line, "Version") {
                if version.is_empty() {
                    version = v;
                }
            }
        }

        if line.contains("<ExtensionManifest") || line.contains("<ExtensionBundle") {
            if let Some(v) = extract_attr(line, "ExtensionBundleName") {
                if name.is_empty() {
                    name = v;
                }
            }
            if let Some(v) = extract_attr(line, "ExtensionBundleId") {
                if id.is_empty() {
                    id = v;
                }
            }
            if let Some(v) = extract_attr(line, "ExtensionBundleVersion") {
                if version.is_empty() {
                    version = v;
                }
            }
            if let Some(v) = extract_attr(line, "CEPVersion") {
                if cep_version.is_empty() {
                    cep_version = v;
                }
            }
        }

        if line.contains("<ExtensionList>") {
            if let Some(v) = extract_attr(line, "ExtensionBundleId") {
                if id.is_empty() {
                    id = v;
                }
            }
        }

        if line.contains("<Host ") {
            let host_name = extract_attr(line, "Name").unwrap_or_default();
            let host_ver = extract_attr(line, "Version").unwrap_or_else(|| "All".to_string());
            if !host_name.is_empty() {
                host_list.push(HostApp {
                    name: format_host_name(&host_name),
                    version: host_ver,
                });
            }
        }

        // <Menu> is the user-visible panel name in CEP manifests
        if (line.starts_with("<Menu>") || line.contains("<Menu>")) && name.is_empty() {
            name = extract_text(line, "Menu");
        }

        // <Name> in CEP is usually the internal panel type name ("main", "panel", etc.)
        // Only use it if nothing better has been found yet, and it's not a generic term
        if (line.starts_with("<Name>") || line.contains("<Name>")) && name.is_empty() {
            let candidate = extract_text(line, "Name");
            let generic = ["main", "panel", "extension", "index", "ui", "app", "core", "popup"];
            if !generic.contains(&candidate.to_lowercase().as_str()) && !candidate.is_empty() {
                name = candidate;
            }
        }

        if (line.starts_with("<Description>") || line.contains("<Description>"))
            && description.is_empty()
        {
            description = extract_text(line, "Description");
        }

        if (line.starts_with("<Author>") || line.contains("<Author>")) && author.is_empty() {
            author = extract_text(line, "Author");
        }

        // Parse RequiredRuntime CSXS version
        if line.contains("RequiredRuntime") {
            if let Some(v) = extract_attr(line, "Version") {
                required_runtime_version = Some(v);
            }
        }

        // Parse icon paths from <Icon> elements (prefer DarkNormal > Normal)
        if line.contains("<Icon") && icon_path.is_none() {
            let icon_type = extract_attr(line, "Type").unwrap_or_default();
            let icon_value = if line.contains("/>") {
                // Self-closing: <Icon Type="Normal">./path</Icon> won't work, try attribute
                extract_attr(line, "Path").or_else(|| {
                    // Check for content between <Icon ...> and </Icon> on same line
                    extract_text(line, "Icon")
                        .trim_matches(|c: char| c == '.' || c == '/')
                        .to_string()
                        .into()
                })
            } else {
                let t = extract_text(line, "Icon");
                if t.is_empty() { None } else { Some(t) }
            };

            if let Some(ref val) = icon_value {
                let clean = val.trim().trim_start_matches("./");
                if !clean.is_empty() && (icon_type.contains("DarkNormal") || icon_type.contains("Normal") || icon_type.is_empty()) {
                    if let Some(bp) = base_path {
                        let full = bp.join(clean);
                        if full.exists() {
                            icon_path = Some(full.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }

    // Fallback: derive a readable name from the extension ID
    if name.is_empty() && !id.is_empty() {
        let generic = ["main", "panel", "extension", "index", "ui", "app", "core", "popup", "host"];
        let parts: Vec<&str> = id.split('.').collect();

        // Find the last non-generic, non-TLD segment
        // e.g. "com.example.myCoolExt.main" → "myCoolExt"
        let raw = parts
            .iter()
            .rev()
            .find(|p| {
                let lower = p.to_lowercase();
                !generic.contains(&lower.as_str())
                    && lower != "com"
                    && lower != "net"
                    && lower != "org"
                    && lower != "io"
                    && p.len() > 2
            })
            .copied()
            .unwrap_or(parts.last().copied().unwrap_or(&id));

        name = raw.replace('-', " ").replace('_', " ");
        // Title case
        name = name
            .split_whitespace()
            .map(|w| {
                let mut c = w.chars();
                match c.next() {
                    None => String::new(),
                    Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ");
    }

    if id.is_empty() {
        return Err("Could not find extension ID in manifest".to_string());
    }

    // Use RequiredRuntime version as cep_version fallback
    if cep_version.is_empty() {
        if let Some(ref rtv) = required_runtime_version {
            cep_version = rtv.clone();
        }
    }

    Ok(ExtensionInfo {
        id,
        name,
        version: if version.is_empty() {
            "Unknown".to_string()
        } else {
            version
        },
        description,
        author,
        host_list,
        cep_version,
        install_path: None,
        icon_path,
    })
}

fn extract_attr(line: &str, attr: &str) -> Option<String> {
    let patterns = [
        format!("{}=\"", attr),
        format!("{}='", attr),
    ];
    for pattern in &patterns {
        if let Some(start) = line.find(pattern.as_str()) {
            let rest = &line[start + pattern.len()..];
            let quote = pattern.chars().last().unwrap();
            if let Some(end) = rest.find(quote) {
                let val = rest[..end].trim().to_string();
                if !val.is_empty() {
                    return Some(val);
                }
            }
        }
    }
    None
}

fn extract_text(line: &str, tag: &str) -> String {
    let open = format!("<{}>", tag);
    let close = format!("</{}>", tag);
    if let (Some(s), Some(e)) = (line.find(&open), line.find(&close)) {
        let start = s + open.len();
        if start < e {
            return line[start..e].trim().to_string();
        }
    }
    String::new()
}

fn format_host_name(raw: &str) -> String {
    match raw.to_uppercase().as_str() {
        "PPRO" | "PREMIERE" => "Premiere Pro".to_string(),
        "AEFT" | "AFTEREFFECTS" => "After Effects".to_string(),
        "ILST" | "ILLUSTRATOR" => "Illustrator".to_string(),
        "PHSP" | "PHOTOSHOP" => "Photoshop".to_string(),
        "AUDE" | "AUDITION" => "Audition".to_string(),
        "DRWV" | "DREAMWEAVER" => "Dreamweaver".to_string(),
        "FLPR" | "ANIMATE" => "Animate".to_string(),
        "IDSN" | "INDESIGN" => "InDesign".to_string(),
        "RUSH" | "PREMIERERUSH" => "Premiere Rush".to_string(),
        "CHAR" | "CHARACTER" => "Character Animator".to_string(),
        _ => raw.to_string(),
    }
}
