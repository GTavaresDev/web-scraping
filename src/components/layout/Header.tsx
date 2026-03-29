"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTracking } from "@/features/tracking/provider/TrackingProvider";
import { APP_NAME } from "@/utils/constants";

export function Header() {
  const pathname = usePathname();
  const { userName } = useTracking();
  const shouldShowUserName =
    pathname === "/tracking" || pathname.startsWith("/tracking/");

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
            <p className="inline-flex items-center gap-2 text-lg font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                className="transform-none fill-slate-900"
              >
                <path d="M12 22a49.749 49.749 0 0 1-3.5-4.624C6.9 14.98 5 11.583 5 9a7 7 0 0 1 14 0c0 2.583-1.9 5.98-3.5 8.375A49.752 49.752 0 0 1 12 22Zm0-16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
              Rastreamento
            </p>
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
