import { STATUS_LABELS } from "@/utils/constants";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCpfHidden(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length !== 11) {
    return maskCpf(digits);
  }

  return `•••.•••.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSswDateTime(value: string): Date | null {
  const normalized = normalizeText(value);
  const match = normalized.match(
    /^(\d{2})\/(\d{2})\/(\d{2})(?:\s+(\d{2}):(\d{2}))?$/,
  );

  if (!match) {
    return null;
  }

  const [, day, month, year, hour = "00", minute = "00"] = match;
  const fullYear = Number(year) >= 70 ? `19${year}` : `20${year}`;
  const iso = `${fullYear}-${month}-${day}T${hour}:${minute}:00-03:00`;
  const parsed = new Date(iso);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeDate(value: string): string {
  const parsed = parseSswDateTime(value);

  if (!parsed) {
    return "Data indisponível";
  }

  const diffMs = Date.now() - parsed.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `há ${days} dia${days > 1 ? "s" : ""}`;
  }

  return new Intl.DateTimeFormat("pt-BR").format(parsed);
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}
