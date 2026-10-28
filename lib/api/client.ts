import type { ApiError, ListMeta } from "@/lib/platform/contracts";

type JsonRecord = Record<string, unknown>;
type QueryValue = string | number | boolean | null | undefined;

export interface ApiEnvelope<T> {
  data: T;
  meta?: Partial<ListMeta> & Record<string, unknown>;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | object | null;
  query?: Record<string, QueryValue>;
  idempotent?: boolean;
  idempotencyKey?: string;
  organisationId?: string;
  retries?: number;
  direct?: boolean;
  allowErrorStatuses?: number[];
  raw?: boolean;
}

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_ORENO_API_URL?.trim();
export const API_BASE_URL = (configuredApiBaseUrl || (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000"))
  .replace(/\/$/, "");
export const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_ORENO_CSRF_COOKIE ?? "oreno_csrf";
export const CSRF_HEADER_NAME = process.env.NEXT_PUBLIC_ORENO_CSRF_HEADER ?? "x-oreno-csrf";

export class ApiClientError extends Error implements ApiError {
  readonly code: string;
  readonly requestId?: string;
  readonly fieldErrors?: Record<string, string>;
  readonly status: number;

  constructor(input: ApiError & { status: number }) {
    super(input.message);
    this.name = "ApiClientError";
    this.code = input.code;
    this.status = input.status;
    this.requestId = input.requestId;
    this.fieldErrors = input.fieldErrors;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function requestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function urlFor(path: string, query?: Record<string, QueryValue>) {
  if (!API_BASE_URL && !path.startsWith("http")) {
    throw new ApiClientError({
      status: 0,
      code: "API_CONFIGURATION_ERROR",
      message: "Oreno cannot connect because NEXT_PUBLIC_ORENO_API_URL is missing from this production deployment.",
    });
  }
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function normaliseFieldErrors(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object") return undefined;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, message]) => [
      key,
      Array.isArray(message) ? message.join(", ") : String(message),
    ]),
  );
}

function dispatch(name: string, detail?: unknown) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(name, { detail }));
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    body: inputBody,
    query,
    idempotent,
    idempotencyKey,
    organisationId,
    retries = idempotent ? 1 : 0,
    direct,
    allowErrorStatuses = [],
    raw,
    ...requestInit
  } = options;
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (organisationId) headers.set("X-Organisation-Id", organisationId);

  let body = inputBody as BodyInit | null | undefined;
  if (body && !(body instanceof FormData) && !(body instanceof Blob) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  if (unsafeMethods.has(method)) {
    const csrf = readCookie(CSRF_COOKIE_NAME);
    if (csrf) headers.set(CSRF_HEADER_NAME, decodeURIComponent(csrf));
    if (idempotent || idempotencyKey) headers.set("Idempotency-Key", idempotencyKey ?? requestId());
  }

  let response: Response | undefined;
  let lastNetworkError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    headers.set("X-Request-Id", requestId());
    try {
      response = await fetch(urlFor(path, query), {
        ...requestInit,
        method,
        body,
        headers,
        credentials: "include",
        cache: options.cache ?? "no-store",
      });
      if (![502, 503, 504].includes(response.status) || allowErrorStatuses.includes(response.status) || attempt === retries) break;
    } catch (cause) {
      lastNetworkError = cause;
      if (attempt === retries) break;
    }
  }

  if (!response) {
    const error = new ApiClientError({
      status: 0,
      code: "NETWORK_ERROR",
      message: lastNetworkError instanceof Error ? lastNetworkError.message : "The Oreno API could not be reached.",
    });
    dispatch("oreno:api-error", error);
    throw error;
  }

  if (raw) return response as T;
  const payload = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok && !allowErrorStatuses.includes(response.status)) {
    const source = payload && typeof payload === "object" && "error" in payload
      ? (payload as { error: JsonRecord }).error
      : {};
    const error = new ApiClientError({
      status: response.status,
      code: typeof source.code === "string" ? source.code : "REQUEST_FAILED",
      message: typeof source.message === "string" ? source.message : `Request failed with ${response.status}.`,
      requestId: typeof source.requestId === "string" ? source.requestId : response.headers.get("x-request-id") ?? undefined,
      fieldErrors: normaliseFieldErrors(source.fieldErrors),
    });
    dispatch("oreno:api-error", error);
    if (response.status === 401 && error.code !== "TWO_FACTOR_REQUIRED") dispatch("oreno:session-expired", error);
    throw error;
  }

  if (direct) return payload as T;
  const envelope = payload as ApiEnvelope<T> | undefined;
  return envelope?.data as T;
}

export function pageQuery(page = 1, pageSize = 50, extra: Record<string, QueryValue> = {}) {
  return { page, pageSize, ...extra };
}

export function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function dateLabel(value: unknown) {
  if (typeof value !== "string" && !(value instanceof Date)) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function titleCase(value: unknown, fallback = "Unknown") {
  if (typeof value !== "string" || !value) return fallback;
  return value.toLowerCase().replace(/(^|[_\s-])\w/g, (match) => match.replace(/[_-]/, " ").toUpperCase());
}
