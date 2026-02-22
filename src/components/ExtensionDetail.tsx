import { motion } from "framer-motion";
import { X, Puzzle, Trash2, FolderOpen, Tag, User, Cpu } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { ExtensionInfo } from "../types";

interface ExtensionDetailProps {
  ext: ExtensionInfo;
  onClose: () => void;
  onUninstall: (ext: ExtensionInfo) => void;
}

const APP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Premiere Pro": { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
  "After Effects": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  "Photoshop": { bg: "bg-sky-500/10", text: "text-sky-400", dot: "bg-sky-500" },
  "Illustrator": { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
  "InDesign": { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-500" },
  "Audition": { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-500" },
  "Animate": { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
};

function getAppColor(name: string) {
  return APP_COLORS[name] || { bg: "bg-white/5", text: "text-white/50", dot: "bg-white/30" };
}

export function ExtensionDetail({ ext, onClose, onUninstall }: ExtensionDetailProps) {
  const handleOpenFolder = async () => {
    try { await invoke("open_extensions_folder"); } catch (e) { console.error(e); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[#13151c] border-l border-white/[0.06] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white/80">Detaylar</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="flex flex-col items-center text-center px-4 py-6 border-b border-white/[0.04]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-3 overflow-hidden">
              {ext.icon_path ? (
                <img
                  src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                  alt=""
                  className="w-full h-full object-contain p-2"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <Puzzle size={24} className="text-white/20" />
              )}
            </div>
            <p className="text-base font-bold text-white/90">{ext.name}</p>
            <p className="text-xs text-white/30 mt-0.5">v{ext.version}</p>
          </div>

          {/* Meta */}
          <div className="px-4 py-4 space-y-4">
            {ext.description && (
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-1.5">Açıklama</p>
                <p className="text-xs text-white/50 leading-relaxed">{ext.description}</p>
              </div>
            )}

            {ext.author && (
              <div className="flex items-center gap-2.5">
                <User size={12} className="text-white/25 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Geliştirici</p>
                  <p className="text-xs text-white/60 mt-0.5">{ext.author}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <Tag size={12} className="text-white/25 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">Extension ID</p>
                <p className="text-[11px] text-white/40 font-mono break-all mt-0.5">{ext.id}</p>
              </div>
            </div>

            {ext.cep_version && (
              <div className="flex items-center gap-2.5">
                <Cpu size={12} className="text-white/25 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold">CEP Versiyonu</p>
                  <p className="text-xs text-white/60 mt-0.5">{ext.cep_version}</p>
                </div>
              </div>
            )}

            {ext.host_list.length > 0 && (
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-2">Uyumlu Uygulamalar</p>
                <div className="flex flex-wrap gap-1.5">
                  {ext.host_list.map(h => {
                    const c = getAppColor(h.name);
                    return (
                      <span key={h.name} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg font-medium ${c.bg} ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} opacity-70`} />
                        {h.name}
                        {h.version !== "All" && <span className="opacity-50 ml-0.5">{h.version}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
          <button
            onClick={handleOpenFolder}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/60 hover:text-white/80 text-xs font-medium transition-all"
          >
            <FolderOpen size={13} />
            Klasörü Aç
          </button>
          <button
            onClick={() => onUninstall(ext)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-400 hover:text-red-300 text-xs font-medium transition-all border border-red-500/10"
          >
            <Trash2 size={13} />
            Kaldır
          </button>
        </div>
      </motion.div>
    </>
  );
}
