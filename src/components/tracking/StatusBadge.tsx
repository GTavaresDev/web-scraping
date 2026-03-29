import type { PackageStatus } from "@/types";
import { cn } from "@/utils";
import { STATUS_STYLES } from "@/utils/constants";
import { getStatusLabel } from "@/utils/formatters/date.formatter";

type StatusBadgeProps = {
  status: PackageStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.pendente;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {getStatusLabel(status)}
    </span>
  );
}
