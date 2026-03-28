import Link from "next/link";
import { APP_NAME } from "@/utils/constants";

export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-lg text-white">
            📦
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Rastreamento
            </p>
            <p className="text-lg font-semibold">{APP_NAME}</p>
          </div>
        </Link>
        <p className="hidden text-sm text-slate-500 sm:block">
          Consulta pública de encomendas por CPF
        </p>
      </div>
    </header>
  );
}
