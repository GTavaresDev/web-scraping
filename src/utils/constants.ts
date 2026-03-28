import type { PackageStatus } from "@/lib/types";

export const APP_NAME = "SSW Rastreio";
export const SSW_BASE_URL = "https://ssw.inf.br";
export const SSW_TRACKING_URL = `${SSW_BASE_URL}/2/rastreamento_pf`;
export const TRACKING_STORAGE_KEY = "ssw-tracker-cache";
export const REQUEST_TIMEOUT_MS = 15_000;
export const SAMPLE_CPF = "00644516151";

export const STATUS_LABELS: Record<string, string> = {
  entregue: "Entregue",
  em_transito: "Em trânsito",
  em_transferencia: "Em transferência",
  pendente: "Pendente",
  devolvido: "Devolvido",
};

export const STATUS_STYLES: Record<
  string,
  { badge: string; dot: string }
> = {
  entregue: {
    badge: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  em_transito: {
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  em_transferencia: {
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  pendente: {
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  devolvido: {
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

export const STATUS_KEYWORDS: Array<{
  terms: string[];
  status: PackageStatus;
}> = [
  {
    terms: ["MERCADORIA ENTREGUE", "ENTREGA REALIZADA", "ENTREGUE"],
    status: "entregue",
  },
  {
    terms: ["SAIDA DE UNIDADE", "SAIDA PARA ENTREGA", "EM TRANSITO"],
    status: "em_transito",
  },
  {
    terms: ["CHEGADA EM UNIDADE", "CHEGADA EM UNIDADE DE TRANSBORDO"],
    status: "em_transferencia",
  },
  {
    terms: ["DOCUMENTO DE TRANSPORTE EMITIDO"],
    status: "pendente",
  },
  {
    terms: ["DEVOLV"],
    status: "devolvido",
  },
];
