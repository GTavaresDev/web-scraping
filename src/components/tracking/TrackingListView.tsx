"use client";

import Link from "next/link";
import { PackageList } from "@/components/tracking/PackageList";
import { useTracking } from "@/components/tracking/TrackingProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PackageListLoading } from "@/components/tracking/TrackingLoadingStates";
import { maskCpfHidden } from "@/utils/formatters";

type TrackingListViewProps = {
  cpf: string;
};

export function TrackingListView({ cpf }: TrackingListViewProps) {
  const tracking = useTracking();

  if (!tracking.hydrated) {
    return <PackageListLoading />;
  }

  if (tracking.cpf !== cpf) {
    return (
      <section className="mx-auto flex w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full">
          <Alert>Dados não disponíveis. Busque novamente pelo CPF.</Alert>
          <div className="mt-4">
            <Link href="/">
              <Button type="button">Buscar novamente</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (tracking.payload.packages.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Card className="mx-auto w-full max-w-3xl p-8 text-center sm:p-10">
          <p className="text-4xl">📦</p>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Nenhuma encomenda encontrada para este CPF.
          </h1>
          <p className="mt-2 text-slate-500">
            O SSW não retornou pacotes vinculados ao CPF informado.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button type="button">Buscar outro CPF</Button>
            </Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8">
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
          >
            ← Voltar
          </Link>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Rastreamento por CPF
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Lista de encomendas
              </h1>
              <p className="text-sm text-slate-500">
                CPF: {maskCpfHidden(cpf ?? "")}
              </p>
            </div>
            <p className="text-sm font-medium text-slate-400 sm:text-right">
              {tracking.payload.packages.length} encomenda
              {tracking.payload.packages.length > 1 ? "s" : ""} encontrada
              {tracking.payload.packages.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <PackageList
          items={tracking.payload.packages}
          scrapedAt={tracking.scrapedAt}
        />
      </div>
    </section>
  );
}
