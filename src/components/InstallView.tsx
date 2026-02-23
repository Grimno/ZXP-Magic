import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Upload } from "lucide-react";
import type { ExtensionInfo } from "../types";
import { AppBadge, ExtIconFallback } from "../lib/appColors";

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
    <div className="h-full flex items-center justify-center px-10 py-8">
      <AnimatePresence mode="wait">

        {/* ── Installing state ── */}
        {installing && (
          <motion.div
            key="installing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8"
          >
            {/* Spinner */}
            <div className="relative w-[72px] h-[72px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{ border: "1.5px solid transparent", borderTopColor: "var(--accent)", borderRightColor: "rgba(59,130,246,0.15)" }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[10px] rounded-full"
                style={{ border: "1px solid transparent", borderTopColor: "rgba(59,130,246,0.35)" }}
              />
              <div
                className="absolute inset-0 m-auto w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--card)", border: "1px solid var(--border-sub)" }}
              >
                <Upload size={14} style={{ color: "var(--accent)" }} />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <p className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>
                Installing extension
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-2)" }}>
                Copying files to Adobe CEP folder
              </p>
            </div>

            {/* Progress shimmer */}
            <div className="w-40 h-px rounded-full overflow-hidden" style={{ background: "var(--elevated)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Success card ── */}
        {!installing && lastInstalled && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full"
            style={{ maxWidth: 440 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            >
              {/* Success banner */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  background: "rgba(16,185,129,0.07)",
                  borderBottom: "1px solid rgba(16,185,129,0.12)",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <Check size={13} className="text-emerald-400" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <p className="text-[13px] font-semibold text-emerald-400">Installation successful</p>
                  <p className="text-[11px] text-emerald-500/50 mt-0.5">Restart your Adobe app to activate</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">

                {/* Icon + name */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      background: "var(--elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {lastInstalled.icon_path ? (
                      <img
                        src={`https://asset.localhost/${lastInstalled.icon_path.replace(/\\/g, "/")}`}
                        alt=""
                        className="w-full h-full object-contain p-1.5"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <ExtIconFallback name={lastInstalled.name} id={lastInstalled.id} size={40} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold truncate" style={{ color: "var(--text)", letterSpacing: "-0.01em" }}>
                      {lastInstalled.name}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--text-2)" }}>
                      v{lastInstalled.version}
                      {lastInstalled.author && (
                        <span style={{ color: "var(--text-3)" }}> · {lastInstalled.author}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Compatible apps */}
                {lastInstalled.host_list.length > 0 && (
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold mb-2"
                      style={{ color: "var(--text-3)" }}
                    >
                      Compatible with
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lastInstalled.host_list.map(h => (
                        <AppBadge key={h.name} name={h.name} size={32} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {lastInstalled.description && (
                  <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: "var(--text-2)" }}>
                    {lastInstalled.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onDismiss}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-medium transition-all"
                    style={{
                      background: "var(--elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-2)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--card)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                    }}
                  >
                    Install another
                  </button>
                  <button
                    onClick={onGoToLibrary}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "#5b96ff";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--accent)";
                    }}
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
            transition={{ duration: 0.2 }}
            className="w-full"
            style={{ maxWidth: 480 }}
          >
            <motion.button
              onClick={onPickFile}
              whileTap={{ scale: 0.985 }}
              className="w-full group relative flex flex-col items-center justify-center gap-7 rounded-2xl cursor-pointer overflow-hidden"
              style={{
                minHeight: 280,
                background: "var(--card)",
                border: "1px solid var(--border)",
                transition: "border-color 0.25s, background 0.25s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)";
                (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--card)";
              }}
            >
              {/* Ambient glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)",
                }}
              />

              {/* Corner marks */}
              {[
                "top-5 left-5 border-t border-l rounded-tl-lg",
                "top-5 right-5 border-t border-r rounded-tr-lg",
                "bottom-5 left-5 border-b border-l rounded-bl-lg",
                "bottom-5 right-5 border-b border-r rounded-br-lg",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute w-4 h-4 ${cls} transition-colors duration-300`}
                  style={{ borderColor: "var(--border)" }}
                />
              ))}

              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: "var(--elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Upload size={22} style={{ color: "var(--text-3)" }} />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "var(--accent-glow)", filter: "blur(20px)" }}
                />
              </div>

              {/* Text */}
              <div className="text-center space-y-2 relative">
                <p className="text-[15px] font-semibold" style={{ color: "var(--text-2)", letterSpacing: "-0.01em" }}>
                  Drop your extension here
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
                  or{" "}
                  <span style={{ color: "var(--accent)", opacity: 0.8 }}>
                    browse files
                  </span>
                </p>
                <p
                  className="text-[11px] font-mono tracking-widest"
                  style={{ color: "var(--text-3)", opacity: 0.6 }}
                >
                  .zxp · .zxpinstall
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
