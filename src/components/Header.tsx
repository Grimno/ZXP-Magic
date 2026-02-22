import { Settings, LayoutGrid } from "lucide-react";

type View = "home" | "settings";

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  extensionCount: number;
}

export function Header({ view, onViewChange, extensionCount }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0f1117]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <span className="text-white font-black text-sm">Z</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-white">ZXP Magic</h1>
          {extensionCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/10 text-white/60 rounded-md">
              {extensionCount}
            </span>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-0.5 bg-white/[0.05] rounded-lg p-0.5">
        <button
          onClick={() => onViewChange("home")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === "home"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <LayoutGrid size={12} />
          Extensions
        </button>
        <button
          onClick={() => onViewChange("settings")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            view === "settings"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Settings size={12} />
          Settings
        </button>
      </nav>
    </header>
  );
}
