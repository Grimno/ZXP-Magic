import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";

interface DropZoneProps {
  installing: boolean;
  dragOver: boolean;
  onPickFile: () => void;
}

export function DropZone({ installing, dragOver, onPickFile }: DropZoneProps) {
  return (
    <div className="px-4 pt-4 pb-3">
      <motion.button
        onClick={onPickFile}
        disabled={installing}
        whileHover={!installing ? { scale: 1.005 } : {}}
        whileTap={!installing ? { scale: 0.995 } : {}}
        className={`w-full relative flex flex-col items-center justify-center gap-2.5 px-6 py-6 rounded-2xl border transition-all cursor-pointer disabled:cursor-not-allowed overflow-hidden ${
          dragOver
            ? "border-blue-500 bg-blue-500/10"
            : installing
            ? "border-white/10 bg-white/[0.03]"
            : "border-white/[0.08] bg-white/[0.03] hover:border-blue-500/50 hover:bg-blue-500/5"
        }`}
      >
        {/* Glow effect */}
        {!installing && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        )}

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          installing ? "bg-white/5" : "bg-blue-600/20"
        }`}>
          {installing ? (
            <Loader2 size={20} className="text-white/30 animate-spin" />
          ) : (
            <Upload size={20} className="text-blue-400" />
          )}
        </div>

        <div className="text-center">
          <p className={`text-sm font-semibold ${installing ? "text-white/30" : "text-white/80"}`}>
            {installing ? "Kuruluyor…" : "ZXP dosyası seç veya sürükle bırak"}
          </p>
          {!installing && (
            <p className="text-xs text-white/30 mt-0.5">.zxp · .zxpinstall</p>
          )}
        </div>
      </motion.button>
    </div>
  );
}
