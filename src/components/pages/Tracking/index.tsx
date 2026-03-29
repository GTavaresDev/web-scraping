import { TrackingListView } from "@/components/tracking/TrackingListView";

type TrackingProps = {
  cpf: string;
};

export default function Tracking({ cpf }: TrackingProps) {
  return <TrackingListView cpf={cpf} />;
}
