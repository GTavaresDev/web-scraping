import { redirect } from "next/navigation";
import Tracking from "@/components/pages/Tracking";

type TrackingPageProps = {
  searchParams?: Promise<{
    cpf?: string | string[];
  }>;
};

function getCpf(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function TrackingPage({
  searchParams,
}: TrackingPageProps) {
  const resolvedSearchParams = await searchParams;
  const cpf = getCpf(resolvedSearchParams?.cpf);

  if (!cpf) {
    redirect("/");
  }

  return <Tracking cpf={cpf} />;
}
