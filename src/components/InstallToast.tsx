import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ToastState } from "../types";

interface InstallToastProps {
  toast: ToastState;
}

export function InstallToast({ toast }: InstallToastProps) {
  const isSuccess = toast.type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
      style={{
        background: "var(--card)",
        border: `1px solid ${isSuccess ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), ${
          isSuccess
            ? "0 0 20px rgba(16,185,129,0.08)"
            : "0 0 20px rgba(239,68,68,0.08)"
        }`,
        maxWidth: 360,
      }}
    >
      {isSuccess ? (
        <CheckCircle2
          size={14}
          style={{ color: "#34d399", flexShrink: 0 }}
        />
      ) : (
        <XCircle
          size={14}
          style={{ color: "#f87171", flexShrink: 0 }}
        />
      )}
      <span
        className="text-[12px] font-medium truncate"
        style={{ color: "var(--text-2)" }}
      >
        {toast.message}
      </span>
    </motion.div>
  );
}
