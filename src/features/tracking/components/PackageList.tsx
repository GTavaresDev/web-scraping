import type { PackageSummary } from "@/types";
import { PackageCard } from "@/features/tracking/components/PackageCard";

type PackageListProps = {
  items: PackageSummary[];
  scrapedAt?: string;
};

export function PackageList({ items, scrapedAt }: PackageListProps) {
  return (
    <div className="grid gap-4 sm:gap-5">
      {items.map((item) => (
        <PackageCard key={item.id} item={item} scrapedAt={scrapedAt} />
      ))}
    </div>
  );
}
