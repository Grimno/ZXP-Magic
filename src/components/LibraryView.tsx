import { motion } from "framer-motion";
import { Puzzle, Trash2, RefreshCw, ChevronRight } from "lucide-react";
import { useState } from "react";
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

interface LibraryViewProps {
  extensions: ExtensionInfo[];
  loading: boolean;
  onSelect: (ext: ExtensionInfo) => void;
  onUninstall: (ext: ExtensionInfo) => void;
  onRefresh: () => Promise<void>;
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/5 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3.5 bg-white/5 rounded-lg w-1/2" />
          <div className="h-2.5 bg-white/5 rounded-lg w-1/4" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-24 bg-white/5 rounded-lg" />
            <div className="h-6 w-20 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LibraryView({ extensions, loading, onSelect, onUninstall, onRefresh }: LibraryViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 pb-10">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Puzzle size={26} className="text-white/15" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/40">Kitaplık boş</p>
          <p className="text-xs text-white/20 mt-1">Kur sekmesinden extension ekle</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-[#080a0f]/90 backdrop-blur-md px-6 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
        <p className="text-xs text-white/30 font-medium">
          <span className="text-white/60 font-bold">{extensions.length}</span> extension yüklü
        </p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04]"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      {/* Grid */}
      <div className="px-6 py-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {extensions.map((ext, i) => (
          <motion.div
            key={ext.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => onSelect(ext)}
            className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] rounded-xl p-5 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                {ext.icon_path ? (
                  <img
                    src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                    alt=""
                    className="w-full h-full object-contain p-1.5"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Puzzle size={18} className="text-white/20" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white/90 truncate">{ext.name}</p>
                  <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 shrink-0 transition-colors" />
                </div>
                <p className="text-[11px] text-white/25 mb-3">v{ext.version}{ext.author ? ` · ${ext.author}` : ""}</p>

                {ext.host_list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ext.host_list.slice(0, 3).map(h => {
                      const c = getAppColor(h.name);
                      return (
                        <span key={h.name} className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg font-medium ${c.bg} ${c.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                          {h.name}
                        </span>
                      );
                    })}
                    {ext.host_list.length > 3 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-white/25">
                        +{ext.host_list.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Uninstall — hover'da belirir */}
            <motion.button
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              onClick={e => { e.stopPropagation(); onUninstall(ext); }}
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[11px] text-white/25 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.05] hover:border-red-500/20 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Trash2 size={11} />
              Kaldır
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
