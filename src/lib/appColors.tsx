import premiereProImg    from "../assets/premiere-pro.png";
import afterEffectsImg   from "../assets/after-effects.png";
import photoshopImg      from "../assets/photoshop.png";
import illustratorImg    from "../assets/illustrator.png";
import indesignImg       from "../assets/indesign.png";
import auditionImg       from "../assets/audition.png";
import animateImg        from "../assets/animate.png";
import lightroomImg      from "../assets/lightroom.png";
import lightroomClassicImg from "../assets/lightroom-classic.png";
import adobeXdImg        from "../assets/adobe-xd.png";
import mediaEncoderImg   from "../assets/media-encoder.png";
import dreamweaverImg    from "../assets/dreamweaver.png";

// PNG icon map — apps without a file fall back to letter abbreviation
const APP_ICON_URLS: Record<string, string> = {
  "Premiere Pro":       premiereProImg,
  "After Effects":      afterEffectsImg,
  "Photoshop":          photoshopImg,
  "Illustrator":        illustratorImg,
  "InDesign":           indesignImg,
  "Audition":           auditionImg,
  "Animate":            animateImg,
  "Lightroom":          lightroomImg,
  "Lightroom Classic":  lightroomClassicImg,
  "Adobe XD":           adobeXdImg,
  "Media Encoder":      mediaEncoderImg,
  "Dreamweaver":        dreamweaverImg,
};

// Adobe-accurate fallback badge colors (used when no PNG available)
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
  "Lightroom":          { abbr: "Lr", bg: "#001a2e", fg: "#67c8ff" },
  "Lightroom Classic":  { abbr: "Lc", bg: "#1a0d00", fg: "#ffb347" },
  "Adobe XD":           { abbr: "Xd", bg: "#1a0033", fg: "#e879f9" },
  "Media Encoder":      { abbr: "Me", bg: "#0a1a00", fg: "#86efac" },
  "Dreamweaver":        { abbr: "Dw", bg: "#002233", fg: "#67e8f9" },
};

export function getAppBadge(name: string) {
  return APP_BADGE[name] ?? {
    abbr: name.slice(0, 2),
    bg: "#1a1f2e",
    fg: "#9aa3bc",
  };
}

/** Small Adobe-style app icon badge — shows PNG logo if available, letter fallback otherwise */
export function AppBadge({ name, size = 22 }: { name: string; size?: number }) {
  const iconUrl = APP_ICON_URLS[name];
  const b = getAppBadge(name);
  const radius = Math.round(size * 0.27);

  if (iconUrl) {
    return (
      <span
        title={name}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={iconUrl}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
    );
  }

  return (
    <span
      title={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: radius,
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

// Legacy — kept for any remaining references
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
