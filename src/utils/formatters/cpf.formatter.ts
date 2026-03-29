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
