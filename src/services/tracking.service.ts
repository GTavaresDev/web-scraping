import {
  parseTrackingDetailHtml,
  parseTrackingListHtml,
} from "@/utils/parsers/tracking.parser";
import {
  scrapeTrackingByCpf,
  scrapeTrackingDetail,
} from "@/utils/scrapers/tracking.scraper";
import { validateCpf } from "@/utils/validators/cpf.validator";
import type {
  PackageDetail,
  PackageSummary,
  TrackingDetailResponse,
  TrackingError,
  TrackingListItem,
  TrackingResponse,
} from "@/types";

type TrackingServiceError = Error & {
  code: TrackingError["code"];
};

function createTrackingServiceError(
  code: TrackingServiceError["code"],
  message: string,
): TrackingServiceError {
  const error = new Error(message) as TrackingServiceError;
  error.code = code;
  return error;
}

function toSummary(
  detail: PackageDetail,
  fallback: TrackingListItem,
): PackageSummary {
  const lastEvent = detail.events[0] ?? fallback.lastEvent;

  return {
    id: detail.id,
    recipient: detail.recipient,
    nfNumber: detail.nfNumber,
    orderNumber: detail.orderNumber,
    currentStatus: detail.currentStatus,
    lastEvent,
    eventCount: detail.events.length,
  };
}

export async function getTrackingByCpf(cpf: string): Promise<TrackingResponse> {
  const validation = validateCpf(cpf);

  if (!validation.valid) {
    throw createTrackingServiceError("INVALID_CPF", "CPF inválido.");
  }

  const listHtml = await scrapeTrackingByCpf(validation.cleaned);
  const listItems = parseTrackingListHtml(listHtml);
  const scrapedAt = new Date().toISOString();

  if (listItems.length === 0) {
    return {
      success: true,
      data: {
        packages: [],
      },
      scrapedAt,
    };
  }

  const packages = await Promise.all(
    listItems.map(async (item) => {
      const detailHtml = await scrapeTrackingDetail(item.detailPath);
      const detail = parseTrackingDetailHtml(detailHtml, item);

      return toSummary(detail, item);
    }),
  );

  return {
    success: true,
    data: {
      packages,
    },
    scrapedAt,
  };
}

export async function getTrackingDetailById(
  cpf: string,
  trackingId: string,
): Promise<TrackingDetailResponse> {
  const validation = validateCpf(cpf);

  if (!validation.valid) {
    throw createTrackingServiceError("INVALID_CPF", "CPF inválido.");
  }

  const normalizedTrackingId = trackingId.trim();

  if (!normalizedTrackingId) {
    throw createTrackingServiceError(
      "TRACKING_NOT_FOUND",
      "Encomenda não encontrada para este CPF.",
    );
  }

  const listHtml = await scrapeTrackingByCpf(validation.cleaned);
  const listItems = parseTrackingListHtml(listHtml);
  const targetItem = listItems.find((item) => item.id === normalizedTrackingId);

  if (!targetItem) {
    throw createTrackingServiceError(
      "TRACKING_NOT_FOUND",
      "Encomenda não encontrada para este CPF.",
    );
  }

  const detailHtml = await scrapeTrackingDetail(targetItem.detailPath);
  const detail = parseTrackingDetailHtml(detailHtml, targetItem);

  return {
    success: true,
    data: detail,
    scrapedAt: new Date().toISOString(),
  };
}
