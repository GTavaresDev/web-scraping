"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PackageDetail } from "@/components/tracking/PackageDetail";
import { PackageDetailLoading } from "@/components/tracking/TrackingLoadingStates";
import { useTracking } from "@/components/tracking/TrackingProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function TrackingDetailView() {
  const params = useParams<{ trackingId: string }>();
  const trackingId = Array.isArray(params.trackingId)
    ? params.trackingId[0]
    : params.trackingId;
  const tracking = useTracking();
  const item = tracking.payload.detailsById[trackingId ?? ""];

  if (!tracking.hydrated) {
    return <PackageDetailLoading />;
  }

  if (!item) {
    return (
      <section className="mx-auto flex w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full">
          <Alert>Dados não disponíveis. Busque novamente pelo CPF.</Alert>
          <div className="mt-4">
            <Link href="/">
              <Button type="button">Ir para a busca</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const backHref = tracking.cpf
    ? `/tracking?cpf=${encodeURIComponent(tracking.cpf)}`
    : "/";

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <Link
            href={backHref}
            className="inline-flex w-fit items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
          >
            ← Voltar para lista
          </Link>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Rastreamento por CPF
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Detalhes da encomenda
            </h1>
          </div>
        </div>
        <div className="mt-6">
          <PackageDetail item={item} />
        </div>
      </div>
    </section>
  );
}
