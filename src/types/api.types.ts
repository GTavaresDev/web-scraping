import type { PackageDetail, TrackingPayload } from "./tracking.types";

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
