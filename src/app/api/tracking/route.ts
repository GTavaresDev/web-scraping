import { NextResponse } from "next/server";
import { parseTrackingDetailHtml, parseTrackingListHtml } from "@/lib/parser";
import { scrapeTrackingByCpf, scrapeTrackingDetail } from "@/lib/scraper";
import type {
  PackageDetail,
  PackageSummary,
  TrackingError,
  TrackingListItem,
  TrackingResponse,
} from "@/lib/types";
import { validateCpf } from "@/lib/validators";

export const runtime = "nodejs";

function buildError(code: TrackingError["code"], error: string, status: number) {
  return NextResponse.json<TrackingError>(
    {
      success: false,
      error,
      code,
    },
    { status },
  );
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { cpf?: string };
    const validation = validateCpf(body.cpf ?? "");

    if (!validation.valid) {
      return buildError("INVALID_CPF", "CPF inválido.", 400);
    }

    const listHtml = await scrapeTrackingByCpf(validation.cleaned);
    const listItems = parseTrackingListHtml(listHtml);

    if (listItems.length === 0) {
      return NextResponse.json<TrackingResponse>({
        success: true,
        data: {
          packages: [],
          detailsById: {},
        },
        scrapedAt: new Date().toISOString(),
      });
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

    return NextResponse.json<TrackingResponse>({
      success: true,
      data: {
        packages,
        detailsById,
      },
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const code = String(error.code);

      if (code === "SSW_UNAVAILABLE") {
        return buildError(
          "SSW_UNAVAILABLE",
          "O sistema SSW está temporariamente indisponível. Tente novamente em alguns minutos.",
          502,
        );
      }

      if (code === "SCRAPING_FAILED") {
        return buildError(
          "SCRAPING_FAILED",
          "Não foi possível interpretar a resposta do SSW no momento.",
          502,
        );
      }
    }

    return buildError(
      "INTERNAL_ERROR",
      "Ocorreu um erro interno ao buscar as encomendas.",
      500,
    );
  }
}
