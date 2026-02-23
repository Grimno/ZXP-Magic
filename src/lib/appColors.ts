export const APP_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Premiere Pro":       { bg: "bg-violet-500/12", text: "text-violet-300", dot: "bg-violet-400" },
  "After Effects":      { bg: "bg-blue-500/12",   text: "text-blue-300",   dot: "bg-blue-400" },
  "Photoshop":          { bg: "bg-sky-500/12",     text: "text-sky-300",    dot: "bg-sky-400" },
  "Illustrator":        { bg: "bg-orange-500/12",  text: "text-orange-300", dot: "bg-orange-400" },
  "InDesign":           { bg: "bg-pink-500/12",    text: "text-pink-300",   dot: "bg-pink-400" },
  "Audition":           { bg: "bg-emerald-500/12", text: "text-emerald-300",dot: "bg-emerald-400" },
  "Animate":            { bg: "bg-amber-500/12",   text: "text-amber-300",  dot: "bg-amber-400" },
  "Premiere Rush":      { bg: "bg-purple-500/12",  text: "text-purple-300", dot: "bg-purple-400" },
  "Character Animator": { bg: "bg-teal-500/12",    text: "text-teal-300",   dot: "bg-teal-400" },
};

export function getAppColor(name: string) {
  return APP_COLORS[name] ?? { bg: "bg-white/[0.06]", text: "text-white/40", dot: "bg-white/25" };
}

// Adobe-accurate app icon style badges
export const APP_BADGE: Record<string, { abbr: string; bg: string; fg: string }> = {
  "Premiere Pro":       { abbr: "Pr", bg: "#2d0b67", fg: "#c4b5fd" },
  "After Effects":      { abbr: "Ae", bg: "#0b1b59", fg: "#a5b4fc" },
  "Photoshop":          { abbr: "Ps", bg: "#001e36", fg: "#67c8ff" },
  "Illustrator":        { abbr: "Ai", bg: "#3a1a00", fg: "#ffa54f" },
  "InDesign":           { abbr: "Id", bg: "#49021f", fg: "#ff80ab" },
  "Audition":           { abbr: "Au", bg: "#002d2d", fg: "#4afac8" },
  "Animate":            { abbr: "An", bg: "#3e1700", fg: "#ffb84f" },
  "Premiere Rush":      { abbr: "Ru", bg: "#2d1a47", fg: "#d8b4fe" },
  "Character Animator": { abbr: "Ch", bg: "#0d2b2b", fg: "#5eead4" },
};

export function getAppBadge(name: string) {
  return APP_BADGE[name] ?? {
    abbr: name.slice(0, 2),
    bg: "#1a1f2e",
    fg: "#9aa3bc",
  };
}

/** Small 22×22 Adobe-style app icon badge */
export function AppBadge({ name, size = 22 }: { name: string; size?: number }) {
  const b = getAppBadge(name);
  return (
    <span
      title={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: b.bg,
        fontSize: Math.round(size * 0.41),
        fontWeight: 700,
        color: b.fg,
        letterSpacing: "-0.03em",
        fontFamily: "system-ui, -apple-system, sans-serif",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {b.abbr}
    </span>
  );
}

/** Extension icon fallback — colored initial based on extension id */
export function ExtIconFallback({ name, id, size = 44 }: { name: string; id: string; size?: number }) {
  const hue = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initial = name.charAt(0).toUpperCase() || "?";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: `hsl(${hue}, 45%, 14%)`,
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        color: `hsl(${hue}, 65%, 65%)`,
        letterSpacing: "-0.02em",
        fontFamily: "system-ui, -apple-system, sans-serif",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initial}
    </span>
  );
}
