import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import type { ToastState } from "../types";

interface InstallToastProps {
  toast: ToastState;
}

export function InstallToast({ toast }: InstallToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
        toast.type === "success"
          ? "bg-[#1a2a1a] border-green-500/30 text-green-400"
          : "bg-[#2a1a1a] border-red-500/30 text-red-400"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle size={15} className="shrink-0" />
      ) : (
        <XCircle size={15} className="shrink-0" />
      )}
      <span className="max-w-[300px] truncate text-white/80">{toast.message}</span>
    </motion.div>
  );
}
