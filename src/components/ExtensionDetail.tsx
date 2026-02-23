import { motion } from "framer-motion";
import { X, Trash2, FolderOpen } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { ExtensionInfo } from "../types";
import { AppBadge, ExtIconFallback } from "../lib/appColors";

interface ExtensionDetailProps {
  ext: ExtensionInfo;
  onClose: () => void;
  onUninstall: (ext: ExtensionInfo) => void;
}

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

export function ExtensionDetail({ ext, onClose, onUninstall }: ExtensionDetailProps) {
  const handleOpenFolder = async () => {
    try { await invoke("open_extensions_folder"); } catch (e) { console.error(e); }
  };

  const accent = getPrimaryAccent(ext.host_list);

  const rows = [
    ext.description ? ["Description", ext.description] : null,
    ["Extension ID", ext.id],
    ext.cep_version ? ["CEP Version", ext.cep_version] : null,
    ext.author ? ["Developer", ext.author] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(7,8,15,0.6)",
          backdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        style={{
          position: "fixed",
          right: 0, top: 0, bottom: 0,
          width: 310,
          zIndex: 50,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-24px 0 60px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 52,
          borderBottom: "1px solid var(--border-sub)",
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
            Extension Details
          </p>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-3)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--elevated)";
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* ── Hero ── */}
        <div style={{
          padding: "28px 20px 24px",
          borderBottom: "1px solid var(--border-sub)",
          flexShrink: 0,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${accent}14 0%, transparent 65%)`,
          }} />
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
          }} />

          {/* Icon */}
          <div style={{
            width: 68, height: 68,
            borderRadius: 18,
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: `0 0 0 4px ${accent}12, 0 8px 24px rgba(0,0,0,0.35)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            margin: "0 auto 14px",
            position: "relative",
          }}>
            {ext.icon_path ? (
              <img
                src={`https://asset.localhost/${ext.icon_path.replace(/\\/g, "/")}`}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10 }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <ExtIconFallback name={ext.name} id={ext.id} size={60} />
            )}
          </div>

          {/* Name */}
          <p style={{
            fontSize: 16, fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            {ext.name}
          </p>

          {/* Version + author */}
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5 }}>
            v{ext.version}{ext.author ? ` · ${ext.author}` : ""}
          </p>

          {/* App tags */}
          {ext.host_list.length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "center", gap: 6, marginTop: 12,
            }}>
              {ext.host_list.map(h => (
                <AppBadge key={h.name} name={h.name} size={22} />
              ))}
            </div>
          )}
        </div>

        {/* ── Info rows ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {rows.map(([label, value], i) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 12,
                padding: "11px 20px",
                borderBottom: i < rows.length - 1 ? "1px solid var(--border-sub)" : "none",
                alignItems: "start",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, paddingTop: 1 }}>
                {label}
              </span>
              <span style={{
                fontSize: label === "Extension ID" ? 10 : 12,
                color: "var(--text-2)",
                fontFamily: label === "Extension ID" ? "monospace" : "inherit",
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-sub)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flexShrink: 0,
        }}>
          <button
            onClick={handleOpenFolder}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-2)",
              background: "var(--elevated)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              transition: "background 0.15s, color 0.15s",
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
            <FolderOpen size={13} />
            Open Folder
          </button>

          <button
            onClick={() => onUninstall(ext)}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              color: "#f87171",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.28)";
              (e.currentTarget as HTMLElement).style.color = "#fca5a5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
              (e.currentTarget as HTMLElement).style.color = "#f87171";
            }}
          >
            <Trash2 size={13} />
            Remove Extension
          </button>
        </div>
      </motion.div>
    </>
  );
}
