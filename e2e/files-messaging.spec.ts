import { expect, test } from "@playwright/test";
import { apiUrl, browserApi, browserWrite, credentials, csrfHeader, csrfToken, liveOnly, login } from "./helpers";

test.describe("file transport and realtime messaging", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");
  test.beforeEach(async ({ page }) => { test.skip(!credentials("talent"), "Configure the seeded talent account."); await login(page, "talent"); });

  test("uploads, completes and requests a signed download", async ({ page }) => {
    const token = await csrfToken(page); expect(token).toBeTruthy();
    const ticket = await browserApi<{ data: { file: { id: string }; upload: { uploadUrl: string; method?: string; headers?: Record<string, string> } } }>(page, "/api/v1/files/uploads", { method: "POST", headers: { "Content-Type": "application/json", [csrfHeader]: token! }, body: JSON.stringify({ category: "PROFILE_PHOTO", originalName: "e2e.png", mimeType: "image/png", sizeBytes: 8 }) });
    expect(ticket.status, JSON.stringify(ticket.payload)).toBe(201);
    const { file, upload } = ticket.payload.data;
    const uploaded = await page.evaluate(async ({ upload }) => fetch(upload.uploadUrl, { method: upload.method ?? "PUT", headers: upload.headers, body: new Uint8Array([137,80,78,71,13,10,26,10]) }).then((response) => response.status), { upload });
    expect(uploaded).toBeLessThan(300);
    expect((await browserApi(page, `/api/v1/files/${file.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json", [csrfHeader]: token! }, body: "{}" })).status).toBe(200);
    await expect.poll(async () => {
      const status = await browserApi<{ data: { file: { status: string } } }>(page, `/api/v1/files/${file.id}`);
      return status.payload.data.file.status;
    }, { timeout: 30_000 }).toBe("READY");
    const download = await browserWrite<{ data: { downloadUrl: string; expiresAt: string } }>(page, `/api/v1/files/${file.id}/download`, {});
    expect(download.status, JSON.stringify(download.payload)).toBe(200);
    expect(new URL(download.payload.data.downloadUrl).protocol).toMatch(/^https?:$/);
  });

  test("opens Socket.IO from the real frontend origin", async ({ page }) => {
    const socket = page.waitForEvent("websocket", (ws) => ws.url().startsWith(apiUrl.replace(/^http/, "ws")) && ws.url().includes("socket.io"));
    await page.goto("/talent/messages");
    await expect(page.getByRole("heading", { name: "Messages" }).first()).toBeVisible();
    await expect(await socket).toBeTruthy();
  });
});
