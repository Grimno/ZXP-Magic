mod installer;

use installer::{ExtensionInfo, InstallResult};

#[tauri::command]
fn list_extensions() -> Vec<ExtensionInfo> {
    installer::list_extensions()
}

#[tauri::command]
fn get_extension_info_from_zxp(path: String) -> Result<ExtensionInfo, String> {
    installer::get_extension_info_from_zxp(&path)
}

#[tauri::command]
fn install_extension(path: String) -> InstallResult {
    installer::install_extension(&path)
}

#[tauri::command]
fn uninstall_extension(extension_id: String) -> Result<(), String> {
    installer::uninstall_extension(&extension_id)
}

#[tauri::command]
fn get_extensions_folder() -> String {
    installer::get_extensions_folder()
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
fn open_extensions_folder() -> Result<(), String> {
    let path = installer::get_extensions_folder();
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_debug_mode() -> bool {
    installer::get_debug_mode()
}

#[tauri::command]
fn set_debug_mode(enabled: bool) -> Result<(), String> {
    installer::set_debug_mode(enabled)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            list_extensions,
            get_extension_info_from_zxp,
            install_extension,
            uninstall_extension,
            get_extensions_folder,
            open_extensions_folder,
            get_debug_mode,
            set_debug_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
