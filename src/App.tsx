import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Settings } from "lucide-react";
import { InstallView } from "./components/InstallView";
import { LibraryView } from "./components/LibraryView";
import { ExtensionDetail } from "./components/ExtensionDetail";
import { SettingsPanel } from "./components/SettingsPanel";
import { InstallToast } from "./components/InstallToast";
import type { ExtensionInfo, InstallResult, ToastState } from "./types";

type Tab = "install" | "library";

export default function App() {
  const [tab, setTab] = useState<Tab>("install");
  const [showSettings, setShowSettings] = useState(false);
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastInstalled, setLastInstalled] = useState<ExtensionInfo | null>(null);
  const [selectedExt, setSelectedExt] = useState<ExtensionInfo | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadExtensions = useCallback(async () => {
    try {
      const list = await invoke<ExtensionInfo[]>("list_extensions");
      setExtensions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  useEffect(() => { loadExtensions(); }, [loadExtensions]);

  const showToast = (state: ToastState) => {
    setToast(state);
    setTimeout(() => setToast(null), 4000);
  };

  const handleInstall = async (filePath: string) => {
    setInstalling(true);
    setLastInstalled(null);
    try {
      const result = await invoke<InstallResult>("install_extension", { path: filePath });
      if (result.success && result.extension) {
        setLastInstalled(result.extension);
        await loadExtensions();
      } else {
        showToast({ type: "error", message: result.message });
      }
    } catch (e) {
      showToast({ type: "error", message: String(e) });
    } finally {
      setInstalling(false);
    }
  };

  const handlePickFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Adobe Extension", extensions: ["zxp", "zxpinstall"] }],
    });
    if (selected && typeof selected === "string") await handleInstall(selected);
  };

  const handleUninstall = async (ext: ExtensionInfo) => {
    try {
      await invoke("uninstall_extension", { extensionId: ext.id });
      showToast({ type: "success", message: `'${ext.name}' kaldırıldı.` });
      setSelectedExt(null);
      if (lastInstalled?.id === ext.id) setLastInstalled(null);
      await loadExtensions();
    } catch (e) {
      showToast({ type: "error", message: String(e) });
    }
  };

  // Drag & drop
  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = (e: DragEvent) => { if (!e.relatedTarget) setDragOver(false); };
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (file.name.endsWith(".zxp") || file.name.endsWith(".zxpinstall")) {
        const path = (file as any).path;
        if (path) await handleInstall(path);
      } else {
        showToast({ type: "error", message: ".zxp veya .zxpinstall dosyası bırakın." });
      }
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#080a0f] text-white overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
            <span className="text-white font-black text-sm leading-none">Z</span>
          </div>
          <span className="text-sm font-bold text-white/90 tracking-tight">ZXP Magic</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
          {(["install", "library"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tab === t ? "text-white" : "text-white/35 hover:text-white/60"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative">
                {t === "install" ? "Kur" : "Kitaplık"}
                {t === "library" && extensions.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-600/30 text-blue-400 rounded-md">
                    {extensions.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowSettings(s => !s)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            showSettings ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <Settings size={15} />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div key="settings"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }} className="h-full overflow-y-auto"
            >
              <SettingsPanel />
            </motion.div>
          ) : tab === "install" ? (
            <motion.div key="install"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-full"
            >
              <InstallView
                installing={installing}
                dragOver={dragOver}
                lastInstalled={lastInstalled}
                onPickFile={handlePickFile}
                onDismiss={() => setLastInstalled(null)}
                onGoToLibrary={() => { setLastInstalled(null); setTab("library"); }}
              />
            </motion.div>
          ) : (
            <motion.div key="library"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="h-full"
            >
              <LibraryView
                extensions={extensions}
                loading={loadingLibrary}
                onSelect={setSelectedExt}
                onUninstall={handleUninstall}
                onRefresh={loadExtensions}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Extension detail panel */}
      <AnimatePresence>
        {selectedExt && (
          <ExtensionDetail
            ext={selectedExt}
            onClose={() => setSelectedExt(null)}
            onUninstall={handleUninstall}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <InstallToast toast={toast} />}
      </AnimatePresence>

      {/* Global drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-md" />
            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="w-24 h-24 rounded-3xl bg-blue-600/20 border-2 border-blue-500/60 flex items-center justify-center"
              >
                <span className="text-5xl">📦</span>
              </motion.div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Bırak ve Kur</p>
                <p className="text-sm text-blue-300/60 mt-1">.zxp · .zxpinstall</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
