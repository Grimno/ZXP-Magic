import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Bug, FolderOpen, Shield, ChevronRight } from "lucide-react";

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
    <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white/90">Settings</h2>
        <p className="text-xs text-white/30 mt-0.5">ZXP Magic tercihleri</p>
      </div>

      {/* Extensions Folder */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Extensions Klasörü</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] text-white/40 font-mono break-all leading-relaxed">
            {extensionsFolder || "Yükleniyor…"}
          </p>
          <button
            onClick={openFolder}
            className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <FolderOpen size={12} />
            Explorer'da Aç
            <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Debug Mode */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Geliştirici</p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Bug size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">CEP Debug Mode</p>
                <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed max-w-[260px]">
                  İmzasız extension'ların Adobe uygulamalarında çalışmasını sağlar.
                </p>
              </div>
            </div>
            <button
              onClick={toggleDebugMode}
              disabled={debugLoading}
              className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 ${
                debugMode ? "bg-blue-600" : "bg-white/10"
              } ${debugLoading ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                debugMode ? "translate-x-[18px]" : "translate-x-0"
              }`} />
            </button>
          </div>
          {debugMode && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-500/5 rounded-lg border border-amber-500/10">
              <Shield size={11} className="text-amber-500/70 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/70 leading-relaxed">
                Debug modu aktif. Geliştirme bitmişse kapatmanız önerilir.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Hakkında</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {[
            ["Versiyon", "0.1.0"],
            ["Platform", "Windows / macOS"],
            ["Lisans", "MIT"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-white/30">{label}</span>
              <span className="text-white/60 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
