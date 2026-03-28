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
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Encomenda
            </p>
            <h1 className="font-mono text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {item.nfNumber}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Histórico consolidado da remessa com atualização cronológica dos eventos.
            </p>
          </div>
          <div className="sm:pt-1">
            <StatusBadge status={item.currentStatus} />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="rounded-xl bg-slate-50 px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {field.label}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Linha do tempo
            </h2>
            <p className="text-sm text-slate-500">Eventos mais recentes no topo.</p>
          </div>
          <span className="text-sm font-medium text-slate-400">
            {item.events.length} evento{item.events.length > 1 ? "s" : ""}
          </span>
        </div>
        <TrackingTimeline events={item.events} />
      </Card>
    </div>
  );
}
