import { motion, AnimatePresence } from "framer-motion";
import { Package, RefreshCw, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ExtensionInfo } from "../types";
import { AppBadge, ExtIconFallback } from "../lib/appColors";

interface LibraryViewProps {
  extensions: ExtensionInfo[];
  loading: boolean;
  onSelect: (ext: ExtensionInfo) => void;
  onUninstall: (ext: ExtensionInfo) => void;
  onRefresh: () => Promise<void>;
}

// Returns the raw accent color value for the left stripe
const APP_ACCENT_HEX: Record<string, string> = {
  "Premiere Pro":       "#8b5cf6",
  "After Effects":      "#3b82f6",
  "Photoshop":          "#0ea5e9",
  "Illustrator":        "#f97316",
  "InDesign":           "#ec4899",
  "Audition":           "#10b981",
  "Animate":            "#f59e0b",
  "Premiere Rush":      "#a855f7",
  "Character Animator": "#14b8a6",
  "Lightroom":          "#0ea5e9",
  "Lightroom Classic":  "#f59e0b",
  "Adobe XD":           "#d946ef",
  "Media Encoder":      "#22c55e",
  "Dreamweaver":        "#06b6d4",
};

function getPrimaryAccent(hostList: { name: string }[]): string {
  for (const h of hostList) {
    if (APP_ACCENT_HEX[h.name]) return APP_ACCENT_HEX[h.name];
  }
  return "#4f8df7";
}

function SkeletonCard() {
  return (
    <div
      className="flex items-stretch rounded-xl overflow-hidden animate-pulse"
      style={{ background: "var(--card)", border: "1px solid var(--border-sub)", height: 80 }}
    >
      <div className="w-1 shrink-0" style={{ background: "var(--elevated)" }} />
      <div className="flex items-center gap-4 px-4 flex-1">
        <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: "var(--elevated)" }} />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 rounded-lg w-2/5" style={{ background: "var(--elevated)" }} />
          <div className="h-2 rounded-lg w-1/4" style={{ background: "var(--elevated)" }} />
          <div className="h-2 rounded-lg w-1/3" style={{ background: "var(--elevated)" }} />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <div className="h-5 w-24 rounded-lg" style={{ background: "var(--elevated)" }} />
          <div className="h-5 w-20 rounded-lg" style={{ background: "var(--elevated)" }} />
        </div>
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
      <div className="h-full overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 pb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Package size={28} style={{ color: "var(--text-3)" }} />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold" style={{ color: "var(--text-2)", letterSpacing: "-0.01em" }}>
            No extensions installed
          </p>
          <p className="text-[12px] mt-1.5" style={{ color: "var(--text-3)" }}>
            Go to Install tab to add your first one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: 44, borderBottom: "1px solid var(--border-sub)" }}
      >
        <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
          <span className="font-semibold" style={{ color: "var(--text-2)" }}>
            {extensions.length}
          </span>{" "}
          {extensions.length === 1 ? "extension" : "extensions"} installed
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all"
          style={{ fontSize: 11, color: "var(--text-3)", background: "transparent" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }}
        >
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-2.5">
          <AnimatePresence>
            {extensions.map((ext, i) => {
              const hovered = hoveredId === ext.id;
              const accent = getPrimaryAccent(ext.host_list);

              return (
                <motion.div
                  key={ext.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, type: "spring", stiffness: 340, damping: 30 }}
                  onMouseEnter={() => setHoveredId(ext.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelect(ext)}
                  className="flex items-stretch rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    background: hovered ? "var(--elevated)" : "var(--card)",
                    border: `1px solid ${hovered ? "var(--border)" : "var(--border-sub)"}`,
                    boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.25)" : "none",
                    transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="w-[3px] shrink-0"
                    style={{
                      background: accent,
                      opacity: hovered ? 0.9 : 0.45,
                      transition: "opacity 0.15s",
                    }}
                  />

                  {/* Content */}
                  <div className="flex items-center gap-4 px-4 py-4 flex-1 min-w-0">

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{
                        background: "var(--elevated)",
                        border: "1px solid var(--border)",
                        boxShadow: `0 0 0 3px ${accent}18`,
                      }}
                    >
                      {ext.icon_path ? (
                        <img
                          src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                          alt=""
                          className="w-full h-full object-contain p-2"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <ExtIconFallback name={ext.name} id={ext.id} size={44} />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px] font-semibold truncate"
                        style={{ color: "var(--text)", letterSpacing: "-0.015em" }}
                      >
                        {ext.name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        v{ext.version}
                        {ext.author && <span> · {ext.author}</span>}
                      </p>
                      {ext.description && (
                        <p
                          className="text-[11px] mt-1 truncate"
                          style={{ color: "var(--text-3)", maxWidth: 340 }}
                        >
                          {ext.description}
                        </p>
                      )}
                      {/* App badges */}
                      {ext.host_list.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {ext.host_list.slice(0, 5).map(h => (
                            <AppBadge key={h.name} name={h.name} size={28} />
                          ))}
                          {ext.host_list.length > 5 && (
                            <span
                              className="text-[10px] px-1.5 py-[2px] rounded-md font-medium"
                              style={{
                                background: "var(--elevated)",
                                color: "var(--text-3)",
                                border: "1px solid var(--border-sub)",
                              }}
                            >
                              +{ext.host_list.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: remove + chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <AnimatePresence>
                        {hovered && (
                          <motion.button
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 6 }}
                            transition={{ duration: 0.12 }}
                            onClick={e => { e.stopPropagation(); onUninstall(ext); }}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                            style={{
                              fontSize: 11,
                              color: "var(--text-2)",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = "#f87171";
                              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                              (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                            }}
                          >
                            <Trash2 size={10} />
                            Remove
                          </motion.button>
                        )}
                      </AnimatePresence>

                      <ChevronRight
                        size={15}
                        style={{
                          color: hovered ? accent : "var(--border)",
                          transition: "color 0.15s",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
