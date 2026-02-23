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
      showToast({ type: "success", message: `${ext.name} removed successfully.` });
      setSelectedExt(null);
      if (lastInstalled?.id === ext.id) setLastInstalled(null);
      await loadExtensions();
    } catch (e) {
      showToast({ type: "error", message: String(e) });
    }
  };

  useEffect(() => {
    let unlistenHover: (() => void) | undefined;
    let unlistenDrop: (() => void) | undefined;
    let unlistenLeave: (() => void) | undefined;

    listen("tauri://drag-over", () => setDragOver(true)).then(fn => { unlistenHover = fn; });
    listen("tauri://drag-leave", () => setDragOver(false)).then(fn => { unlistenLeave = fn; });

    listen<{ paths: string[] }>("tauri://drag-drop", async (event) => {
      setDragOver(false);
      const paths = event.payload.paths;
      if (!paths?.length) return;
      const path = paths[0];
      if (path.endsWith(".zxp") || path.endsWith(".zxpinstall")) {
        await handleInstall(path);
      } else {
        showToast({ type: "error", message: "Please drop a .zxp or .zxpinstall file." });
      }
    }).then(fn => { unlistenDrop = fn; });

    return () => { unlistenHover?.(); unlistenLeave?.(); unlistenDrop?.(); };
  }, []);

  const activeTab = showSettings ? null : tab;

  return (
    <div
      className="flex flex-col h-screen overflow-hidden select-none"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          height: 56,
          background: "var(--surface)",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >

        {/* Left — Logo */}
        <div className="flex items-center gap-2.5" style={{ width: 130 }}>
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="ZXP Magic"
              className="w-7 h-7 object-cover"
              style={{ borderRadius: 9 }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: 9, boxShadow: "0 0 14px rgba(79,141,247,0.35)" }}
            />
          </div>
          <div className="leading-none">
            <p
              className="text-[13px] font-semibold"
              style={{ color: "var(--text)", letterSpacing: "-0.015em" }}
            >
              ZXP Magic
            </p>
            <p className="text-[10px] mt-[3px]" style={{ color: "var(--text-3)" }}>
              by Grimno
            </p>
          </div>
        </div>

        {/* Center — Segment control */}
        <AnimatePresence mode="wait">
          {!showSettings && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 p-1.5 rounded-xl"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              {(["install", "library"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="relative flex items-center gap-2 rounded-lg transition-colors"
                  style={{ height: 32, paddingLeft: 18, paddingRight: 18 }}
                >
                  {/* Animated background */}
                  {activeTab === t && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "var(--elevated)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 42 }}
                    />
                  )}

                  {/* Label */}
                  <span
                    className="relative z-10 text-[12.5px] font-medium transition-colors duration-150"
                    style={{
                      color: activeTab === t ? "var(--text)" : "var(--text-2)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t === "install" ? "Install" : "Library"}
                  </span>

                  {/* Badge */}
                  {t === "library" && extensions.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 flex items-center justify-center text-[10px] font-semibold rounded-md px-1.5"
                      style={{
                        height: 17,
                        minWidth: 17,
                        background: activeTab === "library" ? "var(--accent-dim)" : "rgba(255,255,255,0.06)",
                        color: activeTab === "library" ? "var(--accent)" : "var(--text-3)",
                      }}
                    >
                      {extensions.length}
                    </motion.span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right — Settings button */}
        <div className="flex justify-end" style={{ width: 130 }}>
          <motion.button
            onClick={() => setShowSettings(s => !s)}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 rounded-lg px-3 transition-all"
            style={{
              height: 32,
              background: showSettings ? "var(--elevated)" : "transparent",
              border: `1px solid ${showSettings ? "var(--border)" : "transparent"}`,
              color: showSettings ? "var(--text)" : "var(--text-2)",
            }}
            onMouseEnter={e => {
              if (!showSettings) {
                (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }
            }}
            onMouseLeave={e => {
              if (!showSettings) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
              }
            }}
          >
            <motion.div
              animate={{ rotate: showSettings ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Settings size={13} />
            </motion.div>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em" }}>
              Settings
            </span>
          </motion.button>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <SettingsPanel />
            </motion.div>
          ) : tab === "install" ? (
            <motion.div
              key="install"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
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
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
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

      {/* ── Extension Detail Panel ────────────────────────────── */}
      <AnimatePresence>
        {selectedExt && (
          <ExtensionDetail
            ext={selectedExt}
            onClose={() => setSelectedExt(null)}
            onUninstall={handleUninstall}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <InstallToast toast={toast} />}
      </AnimatePresence>

      {/* ── Global Drag Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(7,8,15,0.9)", backdropFilter: "blur(20px)" }}
            />

            <div className="relative flex flex-col items-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-20px] rounded-[32px] pointer-events-none"
                  style={{ background: "var(--accent-glow)", filter: "blur(28px)" }}
                />
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[88px] h-[88px] rounded-3xl flex items-center justify-center"
                  style={{
                    background: "var(--card)",
                    border: "1.5px solid rgba(79,141,247,0.5)",
                    boxShadow: "0 0 40px rgba(79,141,247,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(79,141,247,0.9)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </motion.div>
              </div>

              <div className="text-center">
                <p
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                >
                  Drop to install
                </p>
                <p className="text-[13px] mt-1.5 font-mono tracking-widest" style={{ color: "var(--text-3)" }}>
                  .zxp · .zxpinstall
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
