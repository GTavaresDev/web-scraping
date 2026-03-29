import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
