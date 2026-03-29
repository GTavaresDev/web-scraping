export type PackageStatus =
  | "em_transito"
  | "entregue"
  | "pendente"
  | "devolvido"
  | "em_transferencia"
  | string;

export type TrackingEvent = {
  dateTime: string;
  location: string;
  unit: string;
  description: string;
  status: PackageStatus;
};

export type PackageSummary = {
  id: string;
  recipient: string;
  nfNumber: string;
  orderNumber: string;
  currentStatus: PackageStatus;
  lastEvent: TrackingEvent;
  eventCount: number;
};

export type PackageDetail = {
  id: string;
  recipient: string;
  nfNumber: string;
  orderNumber: string;
  pickupDate: string | null;
  currentStatus: PackageStatus;
  events: TrackingEvent[];
};

export type TrackingPayload = {
  packages: PackageSummary[];
  detailsById: Record<string, PackageDetail>;
};

export type TrackingListItem = {
  id: string;
  recipient: string;
  nfNumber: string;
  orderNumber: string;
  currentStatus: PackageStatus;
  lastEvent: TrackingEvent;
  detailPath: string;
};

export type TrackingCache = {
  cpf: string;
  payload: TrackingPayload;
  scrapedAt: string;
  userName: string | null;
};

export type TrackingStoreState = TrackingCache & {
  hydrated: boolean;
};
