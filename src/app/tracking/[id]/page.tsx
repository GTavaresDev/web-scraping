import { redirect } from "next/navigation";
import TrackingDetail from "@/components/pages/TrackingDetail";
import { validateCpf } from "@/utils/validators/cpf.validator";

type TrackingDetailOrLegacyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getSegment(value: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value.trim();
}

export default async function TrackingDetailOrLegacyPage({
  params,
}: TrackingDetailOrLegacyPageProps) {
  const resolvedParams = await params;
  const id = getSegment(resolvedParams.id);

  if (!id) {
    redirect("/");
  }

  const cpfValidation = validateCpf(id);

  if (cpfValidation.valid) {
    redirect(`/tracking?cpf=${encodeURIComponent(cpfValidation.cleaned)}`);
  }

  return <TrackingDetail />;
}
