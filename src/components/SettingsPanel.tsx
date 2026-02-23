import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen, Bug, Shield } from "lucide-react";

export function SettingsPanel() {
  const [debugMode, setDebugMode] = useState(false);
  const [debugLoading, setDebugLoading] = useState(true);
  const [extensionsFolder, setExtensionsFolder] = useState("");

  useEffect(() => {
    invoke<boolean>("get_debug_mode").then(setDebugMode).finally(() => setDebugLoading(false));
    invoke<string>("get_extensions_folder").then(setExtensionsFolder);
  }, []);

  const toggleDebugMode = async () => {
    const newVal = !debugMode;
    setDebugMode(newVal);
    try {
      await invoke("set_debug_mode", { enabled: newVal });
    } catch {
      setDebugMode(!newVal);
    }
  };

  const openFolder = async () => {
    try { await invoke("open_extensions_folder"); } catch (e) { console.error(e); }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 40px" }}>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Settings
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
            ZXP Magic preferences
          </p>
        </div>

        {/* ── Storage section ── */}
        <Section label="Storage">
          {/* Extensions folder */}
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FolderOpen size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    Extensions Folder
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    marginTop: 2,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                  }}>
                    {extensionsFolder || "Loading…"}
                  </p>
                </div>
              </div>
              <button
                onClick={openFolder}
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(79,141,247,0.2)",
                  borderRadius: 8,
                  padding: "5px 12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Open
              </button>
            </div>
          </div>
        </Section>

        {/* ── Developer section ── */}
        <Section label="Developer">
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Bug size={14} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    CEP Debug Mode
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, lineHeight: 1.5 }}>
                    Allow unsigned extensions in Adobe apps
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={toggleDebugMode}
                disabled={debugLoading}
                style={{
                  flexShrink: 0,
                  position: "relative",
                  width: 40,
                  height: 22,
                  borderRadius: 99,
                  background: debugMode ? "var(--accent)" : "var(--elevated)",
                  border: `1px solid ${debugMode ? "rgba(79,141,247,0.4)" : "var(--border)"}`,
                  cursor: debugLoading ? "not-allowed" : "pointer",
                  opacity: debugLoading ? 0.4 : 1,
                  transition: "background 0.2s, border-color 0.2s",
                  boxShadow: debugMode ? "0 0 10px rgba(79,141,247,0.25)" : "none",
                }}
              >
                <span style={{
                  position: "absolute",
                  top: 2,
                  left: 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                  transform: debugMode ? "translateX(18px)" : "translateX(0)",
                  transition: "transform 0.2s",
                }} />
              </button>
            </div>

            {/* Warning banner */}
            {debugMode && (
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginTop: 12,
                padding: "10px 12px",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.14)",
                borderRadius: 10,
              }}>
                <Shield size={11} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "rgba(251,191,36,0.75)", lineHeight: 1.5 }}>
                  Debug mode is active. Disable when development is complete.
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* ── About section ── */}
        <Section label="About">
          {[
            ["Version", "0.1.0"],
            ["Platform", "Windows · macOS"],
            ["License", "MIT"],
            ["Made by", "Grimno"],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-sub)" : "none",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </Section>

      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-3)",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: 8,
        paddingLeft: 4,
      }}>
        {label}
      </p>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}
