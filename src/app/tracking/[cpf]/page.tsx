import { redirect } from "next/navigation";

type LegacyTrackingPageProps = {
  params: Promise<{
    cpf: string;
  }>;
};

function getCpf(value: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value.trim();
}

export default async function LegacyTrackingPage({
  params,
}: LegacyTrackingPageProps) {
  const resolvedParams = await params;
  const cpf = getCpf(resolvedParams.cpf);

  if (!cpf) {
    redirect("/");
  }

  redirect(`/tracking?cpf=${encodeURIComponent(cpf)}`);
}
