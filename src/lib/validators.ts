import type { CpfValidationResult } from "@/lib/types";
import { onlyDigits } from "@/utils/formatters";

function calculateCpfDigit(base: string, factor: number): number {
  const total = base
    .split("")
    .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
  const remainder = total % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function validateCpf(value: string): CpfValidationResult {
  const cleaned = onlyDigits(value);

  if (cleaned.length !== 11) {
    return { valid: false, cleaned };
  }

  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, cleaned };
  }

  const firstDigit = calculateCpfDigit(cleaned.slice(0, 9), 10);
  const secondDigit = calculateCpfDigit(`${cleaned.slice(0, 9)}${firstDigit}`, 11);
  const valid =
    cleaned === `${cleaned.slice(0, 9)}${firstDigit}${secondDigit}`;

  return { valid, cleaned };
}
