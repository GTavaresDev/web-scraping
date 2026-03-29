import { TrackingListView } from "@/features/tracking/components/TrackingListView";

type TrackingProps = {
  cpf: string;
};

export default function Tracking({ cpf }: TrackingProps) {
  return <TrackingListView cpf={cpf} />;
}
