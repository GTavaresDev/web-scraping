import type { PackageDetail as PackageDetailType } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/tracking/StatusBadge";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";

type PackageDetailProps = {
  item: PackageDetailType;
};

export function PackageDetail({ item }: PackageDetailProps) {
  const fields = [
    { label: "Destinatário", value: item.recipient },
    { label: "Pedido", value: item.orderNumber },
    { label: "Coleta", value: item.pickupDate ?? "Informação indisponível" },
    { label: "Nota fiscal", value: item.nfNumber },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Encomenda</p>
            <h1 className="mt-1 font-mono text-xl font-bold text-slate-900">
              {item.nfNumber}
            </h1>
          </div>
          <StatusBadge status={item.currentStatus} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                {field.label}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{field.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Linha do tempo</h2>
            <p className="text-sm text-slate-500">Eventos mais recentes no topo.</p>
          </div>
          <span className="text-sm text-slate-400">
            {item.events.length} evento{item.events.length > 1 ? "s" : ""}
          </span>
        </div>
        <TrackingTimeline events={item.events} />
      </Card>
    </div>
  );
}
