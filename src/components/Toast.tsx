import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastListener: ((toast: ToastMessage) => void) | null = null;

export function showToast(message: string, type: ToastType = "info") {
  if (toastListener) {
    toastListener({ id: Math.random().toString(36).substring(2, 9), type, message });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-lg shadow-xl border text-xs leading-relaxed transition-all duration-300 transform translate-y-0 ${
            t.type === "error"
              ? "bg-red-900 text-white border-red-700"
              : t.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base flex-shrink-0">
              {t.type === "error" ? "⚠️" : t.type === "success" ? "✓" : "ℹ️"}
            </span>
            <p className="font-medium">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white font-bold text-sm leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
