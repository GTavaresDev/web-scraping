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

function toSummary(detail: PackageDetail, fallback: TrackingListItem): PackageSummary {
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
        detailsById: {},
      },
      scrapedAt,
    };
  }

  const detailEntries = await Promise.all(
    listItems.map(async (item) => {
      const detailHtml = await scrapeTrackingDetail(item.detailPath);
      const detail = parseTrackingDetailHtml(detailHtml, item);

      return [item.id, detail] as const;
    }),
  );
  const detailsById = Object.fromEntries(detailEntries);
  const packages = listItems.map((item) => toSummary(detailsById[item.id], item));

  return {
    success: true,
    data: {
      packages,
      detailsById,
    },
    scrapedAt,
  };
}
