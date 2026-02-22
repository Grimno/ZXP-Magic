import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Trash2, RefreshCw, Package } from "lucide-react";
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
  return APP_COLORS[name] || { bg: "bg-white/8", text: "text-white/40", dot: "bg-white/25" };
}

interface LibraryViewProps {
  extensions: ExtensionInfo[];
  loading: boolean;
  onSelect: (ext: ExtensionInfo) => void;
  onUninstall: (ext: ExtensionInfo) => void;
  onRefresh: () => Promise<void>;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/5 rounded-lg w-1/3" />
        <div className="h-2.5 bg-white/5 rounded-lg w-1/5" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-6 w-20 bg-white/5 rounded-lg" />
        <div className="h-6 w-16 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export function LibraryView({ extensions, loading, onSelect, onUninstall, onRefresh }: LibraryViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 700);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 pb-10">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Package size={26} className="text-white/15" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/35">Kitaplık boş / Library empty</p>
          <p className="text-xs text-white/20 mt-1">Kur sekmesinden extension ekle</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
        <p className="text-xs text-white/25">
          <span className="text-white/50 font-semibold">{extensions.length}</span>
          <span className="ml-1">extension yüklü</span>
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] disabled:opacity-40"
        >
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {extensions.map((ext, i) => (
            <motion.div
              key={ext.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 30 }}
              onMouseEnter={() => setHoveredId(ext.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(ext)}
              className={`flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] cursor-pointer transition-colors duration-150 ${
                hoveredId === ext.id ? "bg-white/[0.04]" : ""
              }`}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                {ext.icon_path ? (
                  <img
                    src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                    alt=""
                    className="w-full h-full object-contain p-1.5"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Puzzle size={16} className="text-white/20" />
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{ext.name}</p>
                <p className="text-[11px] text-white/25 mt-0.5">
                  v{ext.version}{ext.author ? ` · ${ext.author}` : ""}
                </p>
              </div>

              {/* Host tags */}
              <div className="flex items-center gap-1.5 shrink-0">
                {ext.host_list.slice(0, 2).map(h => {
                  const c = getAppColor(h.name);
                  return (
                    <span key={h.name} className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg font-medium ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                      {h.name}
                    </span>
                  );
                })}
                {ext.host_list.length > 2 && (
                  <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-white/25">
                    +{ext.host_list.length - 2}
                  </span>
                )}
              </div>

              {/* Uninstall */}
              <AnimatePresence>
                {hoveredId === ext.id && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                    onClick={e => { e.stopPropagation(); onUninstall(ext); }}
                    className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-red-400 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 size={11} />
                    Kaldır
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
