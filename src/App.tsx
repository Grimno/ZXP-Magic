import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
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

  // Drag & drop — Tauri native events
  useEffect(() => {
    let unlistenHover: (() => void) | undefined;
    let unlistenDrop: (() => void) | undefined;
    let unlistenLeave: (() => void) | undefined;

    listen("tauri://drag-over", () => {
      setDragOver(true);
    }).then(fn => { unlistenHover = fn; });

    listen("tauri://drag-leave", () => {
      setDragOver(false);
    }).then(fn => { unlistenLeave = fn; });

    listen<{ paths: string[] }>("tauri://drag-drop", async (event) => {
      setDragOver(false);
      const paths = event.payload.paths;
      if (!paths || paths.length === 0) return;
      const path = paths[0];
      if (path.endsWith(".zxp") || path.endsWith(".zxpinstall")) {
        await handleInstall(path);
      } else {
        showToast({ type: "error", message: "Please drop a .zxp or .zxpinstall file." });
      }
    }).then(fn => { unlistenDrop = fn; });

    return () => {
      unlistenHover?.();
      unlistenLeave?.();
      unlistenDrop?.();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#080a0f] text-white overflow-hidden select-none">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        {/* Logo + name */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ZXP Magic" className="w-7 h-7 rounded-xl object-cover" />
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-white tracking-tight">ZXP Magic</p>
            <p className="text-[10px] text-white/30 leading-none">by Grimno</p>
          </div>
        </div>

        {/* Settings */}
        <button
          onClick={() => { setShowSettings(s => !s); }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            showSettings
              ? "bg-white/10 text-white/80"
              : "text-white/25 hover:text-white/60 hover:bg-white/[0.06]"
          }`}
        >
          <Settings size={15} />
        </button>
      </header>

      {/* ── Tab bar ── */}
      {!showSettings && (
        <div className="flex border-b border-white/[0.06] px-5">
          {(["install", "library"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative py-2.5 mr-6 text-[13px] font-semibold transition-colors duration-150 ${
                tab === t ? "text-white" : "text-white/30 hover:text-white/55"
              }`}
            >
              {t === "install" ? "Kur" : (
                <span className="flex items-center gap-2">
                  Kitaplık
                  {extensions.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/8 text-white/40 rounded-md">
                      {extensions.length}
                    </span>
                  )}
                </span>
              )}
              {tab === t && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
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
              transition={{ duration: 0.12 }} className="h-full"
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
              transition={{ duration: 0.12 }} className="h-full"
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

      <AnimatePresence>
        {selectedExt && (
          <ExtensionDetail
            ext={selectedExt}
            onClose={() => setSelectedExt(null)}
            onUninstall={handleUninstall}
          />
        )}
      </AnimatePresence>

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
            <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-md" />
            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="w-24 h-24 rounded-3xl bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center"
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
