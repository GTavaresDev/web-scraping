import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2",
        hasError
          ? "border-red-500"
          : "border-slate-200 hover:border-slate-300 focus:border-blue-500",
        className,
      )}
      {...props}
    />
  );
}
