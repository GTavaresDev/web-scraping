"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PackageList } from "@/components/tracking/PackageList";
import { useTracking } from "@/components/tracking/TrackingProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PackageListLoading } from "@/components/tracking/TrackingLoadingStates";
import { maskCpfHidden } from "@/utils/formatters";

export function TrackingListView() {
  const params = useParams<{ cpf: string }>();
  const cpf = Array.isArray(params.cpf) ? params.cpf[0] : params.cpf;
  const tracking = useTracking();

  if (!tracking.hydrated) {
    return <PackageListLoading />;
  }

  if (tracking.cpf !== cpf) {
    return (
      <section className="mx-auto flex w-full max-w-4xl px-4 py-10 sm:px-6">
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
      <section className="mx-auto flex w-full max-w-4xl px-4 py-10 sm:px-6">
        <Card className="w-full p-8 text-center">
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
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-3">
        <Link href="/" className="text-sm font-medium text-blue-600">
          ← Voltar
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Encomendas</h1>
            <p className="text-sm text-slate-500">CPF: {maskCpfHidden(cpf ?? "")}</p>
          </div>
          <p className="text-sm text-slate-400">
            {tracking.payload.packages.length} encomenda
            {tracking.payload.packages.length > 1 ? "s" : ""} encontrada
            {tracking.payload.packages.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <PackageList items={tracking.payload.packages} />
    </section>
  );
}
