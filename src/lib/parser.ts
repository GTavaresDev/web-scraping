import * as cheerio from "cheerio";
import type {
  PackageDetail,
  PackageStatus,
  TrackingEvent,
  TrackingListItem,
} from "@/lib/types";
import { STATUS_KEYWORDS } from "@/utils/constants";
import { normalizeText, parseSswDateTime } from "@/utils/formatters";

function createTrackingId(detailPath: string, nfNumber: string, orderNumber: string): string {
  const detailId = detailPath.match(/[?&]id=([^&]+)/)?.[1];

  if (detailId) {
    return detailId.replace(/[^a-zA-Z0-9_-]/g, "");
  }

  const base = `${nfNumber}-${orderNumber}`.replace(/\s+/g, "-");
  return base.toLowerCase();
}

function deriveStatus(value: string): PackageStatus {
  const normalized = normalizeText(value).toUpperCase();

  for (const keyword of STATUS_KEYWORDS) {
    if (keyword.terms.some((term) => normalized.includes(term))) {
      return keyword.status;
    }
  }

  return normalized
    .slice(0, 40)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "pendente";
}

function buildDateTime(lines: string[]): string {
  if (lines.length === 0) {
    return "";
  }

  return normalizeText(lines.slice(0, 2).join(" "));
}

function extractLinesFromHtml(fragment: string): string[] {
  const normalizedFragment = fragment.replace(/<br\s*\/?>/gi, "\n");
  const $ = cheerio.load(normalizedFragment);

  return $.root()
    .text()
    .split("\n")
    .map(normalizeText)
    .filter(Boolean);
}

function sortEventsDesc(events: TrackingEvent[]): TrackingEvent[] {
  return [...events].sort((left, right) => {
    const leftDate = parseSswDateTime(left.dateTime)?.getTime() ?? 0;
    const rightDate = parseSswDateTime(right.dateTime)?.getTime() ?? 0;

    return rightDate - leftDate;
  });
}

function composeDescription(title: string, detail: string): string {
  const normalizedTitle = normalizeText(title);
  const normalizedDetail = normalizeText(detail);

  if (!normalizedDetail) {
    return normalizedTitle;
  }

  if (normalizedDetail.toUpperCase().startsWith(normalizedTitle.toUpperCase())) {
    return normalizedDetail;
  }

  return `${normalizedTitle} ${normalizedDetail}`.trim();
}

function extractValueByLabel($: cheerio.CheerioAPI, label: string): string {
  const cell = $("td")
    .filter((_, element) => normalizeText($(element).text()) === label)
    .first();

  if (!cell.length) {
    return "";
  }

  return normalizeText(cell.next("td").text());
}

function extractPathFromOnclick(value: string): string {
  return value.match(/opx\('([^']+)'/)?.[1] ?? "";
}

export function parseTrackingListHtml(html: string): TrackingListItem[] {
  const $ = cheerio.load(html);
  const recipientCell = $("td")
    .filter((_, element) => normalizeText($(element).text()) === "Destinatário:")
    .first();
  const recipient = normalizeText(recipientCell.nextAll("td").last().text());
  const rows = [...html.matchAll(/<tr[^>]*onclick="opx\('([^']+)'\)"[^>]*>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((match) => {
      const rowPath = match[1] ?? "";
      const rowHtml = match[2] ?? "";
      const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];

      if (cells.length < 3) {
        return null;
      }

      const statusCell = cheerio.load(cells[2][1]);
      const documentLines = extractLinesFromHtml(cells[0][1]);
      const eventLines = extractLinesFromHtml(cells[1][1]);
      const title = normalizeText(statusCell("p.titulo").first().text());
      const detail = normalizeText(statusCell("p.tdb").first().text());
      const unit = normalizeText(statusCell("font").first().text()).replace(/[()]/g, "");
      const anchorPath = extractPathFromOnclick(statusCell("a[onclick]").first().attr("onclick") ?? "");
      const detailPath = rowPath || anchorPath;
      const nfNumber = documentLines[0] ?? "Informação indisponível";
      const orderNumber = documentLines[1] ?? "Informação indisponível";
      const location = eventLines[0] ?? "Informação indisponível";
      const dateTime = buildDateTime(eventLines.slice(1));
      const status = deriveStatus(title || detail);

      return {
        id: createTrackingId(detailPath, nfNumber, orderNumber),
        recipient: recipient || "Informação indisponível",
        nfNumber,
        orderNumber,
        currentStatus: status,
        lastEvent: {
          dateTime,
          location,
          unit,
          description: composeDescription(title, detail),
          status,
        },
        detailPath,
      } satisfies TrackingListItem;
    })
    .filter((item): item is TrackingListItem => Boolean(item?.detailPath));
}

export function parseTrackingDetailHtml(
  html: string,
  fallback: TrackingListItem,
): PackageDetail {
  const $ = cheerio.load(html);
  const recipient =
    extractValueByLabel($, "Destinatário:") ||
    fallback.recipient ||
    "Informação indisponível";
  const pickupDate = extractValueByLabel($, "N Coleta:") || null;
  const nfNumber = extractValueByLabel($, "N Fiscal:") || fallback.nfNumber;
  const orderNumber = extractValueByLabel($, "N Pedido:") || fallback.orderNumber;

  const events = sortEventsDesc(
    $("tr")
      .filter((_, row) => $(row).find("p.titulo").length > 0)
      .map((_, row) => {
        const cells = $(row).children("td");
        const dateLines = extractLinesFromHtml($.html(cells.eq(0)) || "");
        const locationLines = extractLinesFromHtml($.html(cells.eq(1)) || "");
        const title = normalizeText(cells.eq(2).find("p.titulo").first().text());
        const detail = normalizeText(cells.eq(2).find("p.tdb").first().text());
        const status = deriveStatus(title || detail);

        return {
          dateTime: buildDateTime(dateLines),
          location: locationLines[0] ?? fallback.lastEvent.location,
          unit: locationLines[1] ?? fallback.lastEvent.unit,
          description: composeDescription(title, detail),
          status,
        } satisfies TrackingEvent;
      })
      .get(),
  );

  const currentStatus = events[0]?.status ?? fallback.currentStatus;

  return {
    id: fallback.id,
    recipient,
    nfNumber,
    orderNumber,
    pickupDate,
    currentStatus,
    events: events.length > 0 ? events : [fallback.lastEvent],
  };
}
