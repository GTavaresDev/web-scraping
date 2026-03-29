import { CpfSearchForm } from "@/features/tracking/components/CpfSearchForm";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Rastreie suas encomendas com seu CPF
          </h1>
          <Card className="w-full max-w-xl border-slate-200 p-8 sm:p-10">
            <div className="mb-6">
              <p className="text-2xl font-bold text-slate-800">
                📦 SSW Rastreio
              </p>
              <p className="mt-2 text-slate-600">
                Informe seu CPF no campo abaixo para buscar as encomendas
                vinculadas.
              </p>
            </div>
            <CpfSearchForm />
          </Card>
        </div>
      </div>
    </section>
  );
}
