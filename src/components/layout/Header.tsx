"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTracking } from "@/components/tracking/TrackingProvider";
import { APP_NAME } from "@/utils/constants";

export function Header() {
  const pathname = usePathname();
  const { userName } = useTracking();
  const shouldShowUserName =
    pathname === "/tracking" ||
    pathname.startsWith("/tracking/") ||
    pathname.startsWith("/detail/");

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <Image
            src="/images/hyerlogo.jpg"
            alt={`${APP_NAME} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-2xl object-cover"
            priority
          />
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Área do cliente
            </p>
            <p className="text-lg font-semibold">Rastreio</p>
          </div>
        </Link>
        <p className="hidden text-sm text-slate-500 sm:block">
          {shouldShowUserName && userName
            ? `Olá, ${userName}`
            : "Consulta de encomendas por CPF"}
        </p>
      </div>
    </header>
  );
}
