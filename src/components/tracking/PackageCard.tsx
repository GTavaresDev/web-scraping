import Link from "next/link";
import type { PackageSummary } from "@/lib/types";
import { formatRelativeDate } from "@/utils/formatters";
import { StatusBadge } from "@/components/tracking/StatusBadge";

type PackageCardProps = {
  item: PackageSummary;
};

export function PackageCard({ item }: PackageCardProps) {
  return (
    <Link
      href={`/detail/${item.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-sm text-slate-600">{item.nfNumber}</p>
        <StatusBadge status={item.currentStatus} />
      </div>
      <div className="mt-3">
        <p className="font-medium text-slate-800">{item.recipient}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="truncate text-sm text-slate-500">{item.lastEvent.description}</p>
        <span className="shrink-0 text-sm text-slate-400">
          {formatRelativeDate(item.lastEvent.dateTime)}
        </span>
      </div>
    </Link>
  );
}
