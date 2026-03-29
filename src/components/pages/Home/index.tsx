import { CpfSearchForm } from "@/features/tracking/components/CpfSearchForm";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col justify-center">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Rastreie suas encomendas com seu CPF
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            Consulte rapidamente o status mais recente e a linha do tempo
            completa das encomendas vinculadas ao seu CPF no portal público do
            SSW.
          </p>
        </div>

        <Card className="border-slate-200 p-8">
          <div className="mb-6">
            <p className="text-2xl font-bold text-slate-800">📦 SSW Rastreio</p>
            <p className="mt-2 text-slate-500">
              Digite seu CPF para carregar as encomendas encontradas.
            </p>
          </div>
          <CpfSearchForm />
        </Card>
      </div>
    </section>
  );
}
