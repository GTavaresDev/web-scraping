import type { PackageSummary } from "@/lib/types";
import { PackageCard } from "@/components/tracking/PackageCard";

type PackageListProps = {
  items: PackageSummary[];
};

export function PackageList({ items }: PackageListProps) {
  return (
    <div className="grid gap-4 sm:gap-5">
      {items.map((item) => (
        <PackageCard key={item.id} item={item} />
      ))}
    </div>
  );
}
