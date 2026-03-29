import type { ReactNode } from "react";
import { cn } from "@/utils";

type AlertProps = {
  children: ReactNode;
  tone?: "error" | "info";
};

export function Alert({ children, tone = "info" }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-600",
      )}
    >
      {children}
    </div>
  );
}
