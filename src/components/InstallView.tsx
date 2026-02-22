import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, ArrowRight, Puzzle, Check } from "lucide-react";
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
  return APP_COLORS[name] || { bg: "bg-white/8", text: "text-white/40", dot: "bg-white/25" };
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
    <div className="h-full flex items-center justify-center px-8 py-6 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">

        {/* ── Installing ── */}
        {installing && (
          <motion.div
            key="installing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center gap-7"
          >
            <div className="relative w-20 h-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-blue-500 border-r-blue-500/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2.5 rounded-full border-[1.5px] border-transparent border-t-blue-400/40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={22} className="text-blue-400/70 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-base font-semibold text-white/80">Installing…</p>
              <p className="text-xs text-white/30">Copying extension files</p>
            </div>
            <div className="w-48 h-px bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Success card ── */}
        {!installing && lastInstalled && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="w-full max-w-[420px]"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">

              {/* Top success bar */}
              <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/[0.08] border-b border-emerald-500/[0.12]">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Successfully Installed</p>
                  <p className="text-[11px] text-emerald-400/50 mt-0.5">Restart Adobe apps to activate</p>
                </div>
              </div>

              {/* Extension info */}
              <div className="p-5 space-y-4">

                {/* Icon + name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                    {lastInstalled.icon_path ? (
                      <img
                        src={`https://asset.localhost/${lastInstalled.icon_path.replace(/\\/g, "/")}`}
                        alt=""
                        className="w-full h-full object-contain p-1.5"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <Puzzle size={20} className="text-white/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-white/95 truncate">{lastInstalled.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      v{lastInstalled.version}
                      {lastInstalled.author && <span className="ml-2 text-white/20">· {lastInstalled.author}</span>}
                    </p>
                  </div>
                </div>

                {/* Compatible apps */}
                {lastInstalled.host_list.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold mb-2">Compatible With</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lastInstalled.host_list.map(h => {
                        const c = getAppColor(h.name);
                        return (
                          <span key={h.name} className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium ${c.bg} ${c.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                            {h.name}
                            {h.version && h.version !== "All" && (
                              <span className="opacity-40 text-[10px]">{h.version}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                {lastInstalled.description && (
                  <p className="text-xs text-white/30 leading-relaxed line-clamp-2">
                    {lastInstalled.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onDismiss}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/40 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all"
                  >
                    Install Another
                  </button>
                  <button
                    onClick={onGoToLibrary}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/20"
                  >
                    View in Library
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Drop zone ── */}
        {!installing && !lastInstalled && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-[440px]"
          >
            <motion.button
              onClick={onPickFile}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.995 }}
              className="w-full group relative flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-white/[0.09] hover:border-blue-500/35 bg-white/[0.02] hover:bg-blue-500/[0.03] transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {/* Corner marks */}
              {[
                "top-4 left-4 border-t border-l rounded-tl-lg",
                "top-4 right-4 border-t border-r rounded-tr-lg",
                "bottom-4 left-4 border-b border-l rounded-bl-lg",
                "bottom-4 right-4 border-b border-r rounded-br-lg",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 border-white/15 group-hover:border-blue-500/40 transition-colors duration-300 ${cls}`} />
              ))}

              {/* Upload icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] group-hover:border-blue-500/20 group-hover:bg-blue-500/5 flex items-center justify-center transition-all duration-300">
                  <Upload size={24} className="text-white/20 group-hover:text-blue-400 transition-colors duration-300" />
                </div>
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-blue-600/10 blur-xl group-hover:bg-blue-600/20"
                />
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <p className="text-[15px] font-semibold text-white/50 group-hover:text-white/75 transition-colors duration-200">
                  Drop your extension here
                </p>
                <p className="text-sm text-white/20">
                  or{" "}
                  <span className="text-blue-400/70 group-hover:text-blue-400 transition-colors">
                    browse files
                  </span>
                </p>
                <p className="text-[11px] text-white/12 font-mono tracking-wide">.zxp · .zxpinstall</p>
              </div>
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
