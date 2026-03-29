import { NextResponse } from "next/server";
import { getTrackingByCpf } from "@/services/tracking.service";
import type { TrackingError, TrackingResponse } from "@/types";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { cpf?: string };
    const data = await getTrackingByCpf(body.cpf ?? "");

    return NextResponse.json<TrackingResponse>(data);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const code = String(error.code);

      if (code === "INVALID_CPF") {
        return buildError("INVALID_CPF", "CPF inválido.", 400);
      }

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
