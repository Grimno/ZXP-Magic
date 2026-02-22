import { motion } from "framer-motion";
import { Puzzle, Trash2, ChevronRight } from "lucide-react";
import type { ExtensionInfo } from "../types";

interface ExtensionGridProps {
  extensions: ExtensionInfo[];
  loading: boolean;
  onSelect: (ext: ExtensionInfo) => void;
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

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="h-2.5 bg-white/5 rounded w-1/3" />
          <div className="flex gap-1.5 mt-3">
            <div className="h-5 w-16 bg-white/5 rounded-md" />
            <div className="h-5 w-20 bg-white/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtensionGrid({ extensions, loading, onSelect, onUninstall }: ExtensionGridProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pb-16 px-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <Puzzle size={24} className="text-white/20" />
        </div>
        <p className="text-sm font-medium text-white/50">Extension yüklü değil</p>
        <p className="text-xs text-white/25 mt-1 max-w-[200px]">
          Yukarıdaki alana .zxp dosyası bırak veya seç
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-white/25 font-medium uppercase tracking-wider">
          {extensions.length} extension
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {extensions.map((ext, i) => (
          <motion.div
            key={ext.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(ext)}
            className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                {ext.icon_path ? (
                  <img
                    src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                    alt=""
                    className="w-full h-full object-contain p-1"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Puzzle size={16} className="text-white/25" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white/90 truncate">{ext.name}</p>
                  <ChevronRight size={13} className="text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                </div>
                <p className="text-[11px] text-white/30 mt-0.5">v{ext.version}</p>

                {ext.host_list.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {ext.host_list.slice(0, 3).map(h => {
                      const c = getAppColor(h.name);
                      return (
                        <span
                          key={h.name}
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${c.bg} ${c.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} opacity-70`} />
                          {h.name}
                        </span>
                      );
                    })}
                    {ext.host_list.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/30">
                        +{ext.host_list.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Uninstall */}
            <button
              onClick={e => { e.stopPropagation(); onUninstall(ext); }}
              className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-white/30 hover:text-red-400 transition-all px-1.5 py-1 rounded-md hover:bg-red-500/10"
            >
              <Trash2 size={11} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
