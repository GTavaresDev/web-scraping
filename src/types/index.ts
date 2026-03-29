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

export type TrackingResponse = {
  success: true;
  data: TrackingPayload;
  scrapedAt: string;
};

export type TrackingDetailResponse = {
  success: true;
  data: PackageDetail;
  scrapedAt: string;
};

export type TrackingErrorCode =
  | "INVALID_CPF"
  | "SCRAPING_FAILED"
  | "NO_PACKAGES"
  | "SSW_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type TrackingError = {
  success: false;
  error: string;
  code: TrackingErrorCode;
};

export type CpfValidationResult = {
  valid: boolean;
  cleaned: string;
};

export type SswFormFields = {
  action: string;
  method: "GET" | "POST";
  cpfFieldName: string;
  hiddenFields: Record<string, string>;
};

export type ScraperError = Error & {
  code: Extract<TrackingErrorCode, "SCRAPING_FAILED" | "SSW_UNAVAILABLE">;
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
