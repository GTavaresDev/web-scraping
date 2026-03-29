"use client";

import type { PackageSummary } from "@/types";
import { PackageCard } from "@/features/tracking/components/PackageCard";
import { StatusBadge } from "@/features/tracking/components/StatusBadge";
import { formatRelativeDate } from "@/utils/formatters/date.formatter";
import { useRouter } from "next/navigation";

type PackageListProps = {
  items: PackageSummary[];
  scrapedAt?: string;
};

export function PackageList({ items, scrapedAt }: PackageListProps) {
  const router = useRouter();

  return (
    <>
      <div className="grid gap-4 sm:gap-5 lg:hidden">
        {items.map((item) => (
          <PackageCard key={item.id} item={item} scrapedAt={scrapedAt} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate [border-spacing:0.75rem_0]">
            <thead className="bg-slate-50">
              <tr>
                <th className="rounded-l-xl px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Nota fiscal
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pedido
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Destinatário
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Última atualização
                </th>
                <th className="rounded-r-xl px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer align-top transition-colors hover:bg-slate-50/70 focus-visible:bg-slate-50"
                  tabIndex={0}
                  onClick={() => router.push(`/detail/${item.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/detail/${item.id}`);
                    }
                  }}
                >
                  <td className="rounded-l-xl border-y border-l border-slate-100 px-5 py-4 font-mono text-sm font-medium text-slate-700">
                    {item.nfNumber}
                  </td>
                  <td className="border-y border-slate-100 px-5 py-4 font-mono text-sm font-medium text-slate-700">
                    {item.orderNumber}
                  </td>
                  <td className="border-y border-slate-100 px-5 py-4 text-sm font-medium text-slate-900">
                    <p className="line-clamp-2">{item.recipient}</p>
                  </td>
                  <td className="border-y border-slate-100 px-5 py-4">
                    <StatusBadge status={item.currentStatus} />
                  </td>
                  <td className="border-y border-slate-100 px-5 py-4 text-sm text-slate-600">
                    <p className="line-clamp-2">{item.lastEvent.description}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {formatRelativeDate(item.lastEvent.dateTime, scrapedAt)}
                    </p>
                  </td>
                  <td className="rounded-r-xl border-y border-r border-slate-100 px-5 py-4 text-right">
                    <span className="inline-flex whitespace-nowrap items-center justify-center rounded-lg bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-white">
                      Ver detalhes
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
