"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTracking } from "@/components/tracking/TrackingProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TrackingError, TrackingResponse } from "@/lib/types";
import { validateCpf } from "@/lib/validators";
import { maskCpf, onlyDigits } from "@/utils/formatters";

function getValidationMessage(cpf: string, touched: boolean): string {
  if (!touched) {
    return "";
  }

  const digits = onlyDigits(cpf);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length < 11) {
    return "";
  }

  return validateCpf(cpf).valid ? "" : "CPF inválido";
}

export function CpfSearchForm() {
  const router = useRouter();
  const { setTrackingResult } = useTracking();
  const [cpf, setCpf] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validationMessage = getValidationMessage(cpf, touched);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    const validation = validateCpf(cpf);

    if (!validation.valid) {
      setError("Informe um CPF válido para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: validation.cleaned,
        }),
      });
      const payload = (await response.json()) as TrackingResponse | TrackingError;

      if (!payload.success) {
        setError(
          payload.error || "Não foi possível buscar as encomendas no momento. Tente novamente.",
        );
        return;
      }

      if (!response.ok) {
        setError("Não foi possível buscar as encomendas no momento. Tente novamente.");
        return;
      }

      setTrackingResult({
        cpf: validation.cleaned,
        payload: payload.data,
        scrapedAt: payload.scrapedAt,
      });
      router.push(`/tracking?cpf=${encodeURIComponent(validation.cleaned)}`);
    } catch {
      setError("Falha de rede ao consultar o rastreamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="cpf" className="text-sm font-medium text-slate-700">
          CPF
        </label>
        <Input
          id="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          value={cpf}
          hasError={Boolean(validationMessage)}
          onChange={(event) => {
            setCpf(maskCpf(event.target.value));
            setError("");
          }}
          onBlur={() => {
            setTouched(true);
          }}
          maxLength={14}
          aria-invalid={Boolean(validationMessage)}
          aria-describedby={validationMessage ? "cpf-error" : undefined}
        />
        {validationMessage ? (
          <p id="cpf-error" className="text-sm text-red-600">
            {validationMessage}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Buscando...
          </>
        ) : (
          "Buscar encomendas"
        )}
      </Button>
    </form>
  );
}
