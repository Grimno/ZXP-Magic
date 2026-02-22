import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, ArrowRight, Puzzle, X } from "lucide-react";
import type { ExtensionInfo } from "../types";

const APP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Premiere Pro":       { bg: "bg-violet-500/15", text: "text-violet-300", dot: "bg-violet-400" },
  "After Effects":      { bg: "bg-blue-500/15",   text: "text-blue-300",   dot: "bg-blue-400" },
  "Photoshop":          { bg: "bg-sky-500/15",     text: "text-sky-300",    dot: "bg-sky-400" },
  "Illustrator":        { bg: "bg-orange-500/15",  text: "text-orange-300", dot: "bg-orange-400" },
  "InDesign":           { bg: "bg-pink-500/15",    text: "text-pink-300",   dot: "bg-pink-400" },
  "Audition":           { bg: "bg-green-500/15",   text: "text-green-300",  dot: "bg-green-400" },
  "Animate":            { bg: "bg-yellow-500/15",  text: "text-yellow-300", dot: "bg-yellow-400" },
  "Premiere Rush":      { bg: "bg-purple-500/15",  text: "text-purple-300", dot: "bg-purple-400" },
  "Character Animator": { bg: "bg-teal-500/15",    text: "text-teal-300",   dot: "bg-teal-400" },
};

function getAppColor(name: string) {
  return APP_COLORS[name] || { bg: "bg-white/8", text: "text-white/50", dot: "bg-white/30" };
}

interface InstallViewProps {
  installing: boolean;
  dragOver: boolean;
  lastInstalled: ExtensionInfo | null;
  onPickFile: () => void;
  onDismiss: () => void;
  onGoToLibrary: () => void;
}

export function InstallView({ installing, lastInstalled, onPickFile, onDismiss, onGoToLibrary }: InstallViewProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-10 py-8 relative overflow-hidden">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {installing ? (
          /* ── Installing state ── */
          <motion.div
            key="installing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-6 relative"
          >
            {/* Animated rings */}
            <div className="relative w-28 h-28">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border-2 border-transparent border-t-blue-400/50 border-l-blue-400/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={28} className="text-blue-400 animate-spin" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-white/90">Kuruluyor…</p>
              <p className="text-sm text-white/30 mt-1">Extension dosyaları kopyalanıyor</p>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

        ) : lastInstalled ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-md relative"
          >
            <button
              onClick={onDismiss}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors z-10"
            >
              <X size={14} />
            </button>

            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
              {/* Success banner */}
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/10 border-b border-green-500/10 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <span className="text-base">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-300">Başarıyla Kuruldu</p>
                  <p className="text-xs text-green-400/50 mt-0.5">Extension aktif, Adobe'yi yeniden başlatın</p>
                </div>
              </div>

              {/* Extension info */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                    {lastInstalled.icon_path ? (
                      <img
                        src={`https://asset.localhost/${lastInstalled.icon_path.replace(/\\/g, "/")}`}
                        alt=""
                        className="w-full h-full object-contain p-2"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <Puzzle size={22} className="text-white/20" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white/95">{lastInstalled.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/30">v{lastInstalled.version}</span>
                      {lastInstalled.author && (
                        <>
                          <span className="text-white/15">·</span>
                          <span className="text-xs text-white/30">{lastInstalled.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compatible apps */}
                {lastInstalled.host_list.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mb-2">
                      Uyumlu Uygulamalar
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lastInstalled.host_list.map(h => {
                        const c = getAppColor(h.name);
                        return (
                          <span key={h.name} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${c.bg} ${c.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {h.name}
                            {h.version && h.version !== "All" && (
                              <span className="opacity-50">{h.version}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                {lastInstalled.description && (
                  <p className="text-xs text-white/35 leading-relaxed mb-5">{lastInstalled.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onDismiss}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white/70 text-xs font-medium transition-all border border-white/[0.06]"
                  >
                    Yeni Kur
                  </button>
                  <button
                    onClick={onGoToLibrary}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25"
                  >
                    Kitaplığa Git
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        ) : (
          /* ── Default drop zone ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            <motion.button
              onClick={onPickFile}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full aspect-[16/9] relative flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 hover:border-blue-500/40 bg-white/[0.02] hover:bg-blue-500/[0.04] transition-all duration-300 group cursor-pointer overflow-hidden"
            >
              {/* Corner decorations */}
              {[["top-3 left-3 border-t border-l", "rounded-tl-lg"],
                ["top-3 right-3 border-t border-r", "rounded-tr-lg"],
                ["bottom-3 left-3 border-b border-l", "rounded-bl-lg"],
                ["bottom-3 right-3 border-b border-r", "rounded-br-lg"]].map(([pos, round], i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 border-white/20 group-hover:border-blue-500/50 ${round} transition-colors duration-300`} />
              ))}

              {/* Icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] group-hover:border-blue-500/20 group-hover:bg-blue-500/5 flex items-center justify-center transition-all duration-300">
                  <Upload size={28} className="text-white/20 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl bg-blue-600/10 blur-lg group-hover:bg-blue-600/20"
                />
              </div>

              {/* Text */}
              <div className="text-center">
                <p className="text-base font-semibold text-white/60 group-hover:text-white/80 transition-colors duration-200">
                  Extension Dosyasını Sürükle
                </p>
                <p className="text-sm text-white/25 mt-1.5">
                  veya <span className="text-blue-400 group-hover:text-blue-300 transition-colors">dosya seç</span>
                </p>
                <p className="text-xs text-white/15 mt-3 font-mono">.zxp · .zxpinstall</p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
