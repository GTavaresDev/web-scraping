import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as cheerio from "cheerio";
import type { ScraperError, SswFormFields } from "@/lib/types";
import { REQUEST_TIMEOUT_MS, SSW_BASE_URL, SSW_TRACKING_URL } from "@/utils/constants";

const execFileAsync = promisify(execFile);
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

function buildCurlEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };

  delete env.LD_PRELOAD;
  delete env.DYLD_INSERT_LIBRARIES;
  delete env.DYLD_LIBRARY_PATH;

  return env;
}

function createScraperError(
  code: ScraperError["code"],
  message: string,
  cause?: unknown,
): ScraperError {
  const error = new Error(message, cause ? { cause } : undefined) as ScraperError;
  error.code = code;
  return error;
}

async function runCurl(args: string[], attempt = 0): Promise<string> {
  try {
    const { stdout } = await execFileAsync("curl", args, {
      maxBuffer: 2_000_000,
      env: buildCurlEnv(),
    });

    return stdout;
  } catch (error) {
    const exitCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "number"
        ? error.code
        : undefined;

    if (exitCode === 28 && attempt === 0) {
      return runCurl(args, 1);
    }

    if (exitCode === 28) {
      throw createScraperError(
        "SSW_UNAVAILABLE",
        "O SSW não respondeu dentro do tempo limite.",
        error,
      );
    }

    throw createScraperError("SCRAPING_FAILED", "Falha ao consultar o SSW.", error);
  }
}

function assertHtmlLooksUsable(html: string): void {
  const normalized = html.toLowerCase();
  const knownFailures = [
    "erro interno",
    "sistema indispon",
    "temporariamente indispon",
    "acesso negado",
  ];

  if (knownFailures.some((failure) => normalized.includes(failure))) {
    throw createScraperError(
      "SCRAPING_FAILED",
      "A resposta do SSW não contém dados de rastreamento válidos.",
    );
  }
}

async function loadTrackingForm(): Promise<SswFormFields> {
  const html = await runCurl([
    "-s",
    "-L",
    "--max-time",
    String(Math.floor(REQUEST_TIMEOUT_MS / 1000)),
    "-H",
    "Accept: text/html,application/xhtml+xml",
    "-H",
    `User-Agent: ${USER_AGENT}`,
    "-e",
    SSW_TRACKING_URL,
    SSW_TRACKING_URL,
  ]);
  const $ = cheerio.load(html);
  const form = $("form").first();

  if (!form.length) {
    throw createScraperError(
      "SCRAPING_FAILED",
      "Não foi possível localizar o formulário público de rastreamento.",
    );
  }

  const hiddenFields = form
    .find("input[type='hidden']")
    .toArray()
    .map((element) => {
      const name = $(element).attr("name") ?? "";
      const value = $(element).attr("value") ?? "";
      return [name, value] as const;
    })
    .filter(([name]) => Boolean(name))
    .reduce<Record<string, string>>((accumulator, [name, value]) => {
      accumulator[name] = value;
      return accumulator;
    }, {});

  const cpfFieldName =
    form.find("input[type='tel']").attr("name") ??
    form.find("input:not([type='hidden'])").attr("name");

  if (!cpfFieldName) {
    throw createScraperError(
      "SCRAPING_FAILED",
      "Não foi possível identificar o campo de CPF do formulário.",
    );
  }

  return {
    action: form.attr("action") ?? "/2/resultSSW_dest",
    method: ((form.attr("method") ?? "POST").toUpperCase() as "GET" | "POST"),
    cpfFieldName,
    hiddenFields,
  };
}

export async function scrapeTrackingByCpf(cpf: string): Promise<string> {
  const form = await loadTrackingForm();
  const body = new URLSearchParams({
    ...form.hiddenFields,
    [form.cpfFieldName]: cpf,
  }).toString();
  const html = await runCurl([
    "-s",
    "-L",
    "--max-time",
    String(Math.floor(REQUEST_TIMEOUT_MS / 1000)),
    "-H",
    "Accept: text/html,application/xhtml+xml",
    "-H",
    `User-Agent: ${USER_AGENT}`,
    "-H",
    "Content-Type: application/x-www-form-urlencoded",
    "-H",
    `Origin: ${SSW_BASE_URL}`,
    "-e",
    SSW_TRACKING_URL,
    "--data",
    body,
    `${SSW_BASE_URL}${form.action}`,
  ]);

  assertHtmlLooksUsable(html);
  return html;
}

export async function scrapeTrackingDetail(detailPath: string): Promise<string> {
  const html = await runCurl([
    "-s",
    "-L",
    "--max-time",
    String(Math.floor(REQUEST_TIMEOUT_MS / 1000)),
    "-H",
    "Accept: text/html,application/xhtml+xml",
    "-H",
    `User-Agent: ${USER_AGENT}`,
    "-e",
    SSW_TRACKING_URL,
    detailPath.startsWith("http") ? detailPath : `${SSW_BASE_URL}${detailPath}`,
  ]);

  assertHtmlLooksUsable(html);
  return html;
}
