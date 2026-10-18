import { expect, type Page } from "@playwright/test";

export const apiUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:4000";
export const csrfCookie = process.env.NEXT_PUBLIC_ORENO_CSRF_COOKIE ?? "oreno_csrf";
export const csrfHeader = process.env.NEXT_PUBLIC_ORENO_CSRF_HEADER ?? "x-oreno-csrf";

export function liveOnly() {
  return process.env.E2E_LIVE === "true";
}

export function credentials(kind: "talent" | "company" | "admin") {
  const prefix = `E2E_${kind.toUpperCase()}`;
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  const twoFactorCode = process.env[`${prefix}_TWO_FACTOR_CODE`];
  return email && password ? { email, password, twoFactorCode } : undefined;
}

export async function browserApi<T>(page: Page, path: string, init: RequestInit = {}) {
  return page.evaluate(async ({ url, init }) => {
    const response = await fetch(url, { ...init, credentials: "include", headers: { Accept: "application/json", ...(init.headers ?? {}) } });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    return { status: response.status, headers: Object.fromEntries(response.headers.entries()), payload };
  }, { url: `${apiUrl}${path}`, init }) as Promise<{ status: number; headers: Record<string, string>; payload: T }>;
}

export async function login(page: Page, kind: "talent" | "company" | "admin") {
  const account = credentials(kind);
  expect(account, `Configure E2E_${kind.toUpperCase()}_EMAIL and _PASSWORD`).toBeTruthy();
  await page.goto("/");
  const result = await browserApi(page, "/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...account, deviceLabel: "Playwright production verification" }) });
  expect(result.status, JSON.stringify(result.payload)).toBe(200);
  return account!;
}

export async function csrfToken(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === csrfCookie)?.value;
}
