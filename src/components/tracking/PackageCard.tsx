import Link from "next/link";
import type { PackageSummary } from "@/types";
import { formatRelativeDate } from "@/utils/formatters/date.formatter";
import { StatusBadge } from "@/components/tracking/StatusBadge";

type PackageCardProps = {
  item: PackageSummary;
  scrapedAt?: string;
};

export function PackageCard({ item, scrapedAt }: PackageCardProps) {
  return (
    <Link
      href={`/detail/${item.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Nota fiscal
          </p>
          <p className="font-mono text-sm font-medium text-slate-700 sm:text-[15px]">
            {item.nfNumber}
          </p>
        </div>
        <div className="sm:pt-0.5">
          <StatusBadge status={item.currentStatus} />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Destinatário
        </p>
        <p className="mt-2 text-base font-semibold leading-6 text-slate-900">
          {item.recipient}
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Última atualização
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-slate-600 transition-colors group-hover:text-slate-700">
            {item.lastEvent.description}
          </p>
          <span className="shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
            {formatRelativeDate(item.lastEvent.dateTime, scrapedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
