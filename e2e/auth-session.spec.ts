import { expect, test } from "@playwright/test";
import { browserApi, csrfHeader, csrfToken, credentials, liveOnly, login } from "./helpers";

test.describe("registration, verification, cookies and CSRF", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");

  test("registration creates a pending account", async ({ page }) => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await page.goto("/auth/talent-signup");
    await page.getByLabel("First name").fill("Browser");
    await page.getByLabel("Last name").fill("Test");
    await page.getByLabel("Email address").fill(`e2e+${suffix}@example.test`);
    await page.getByLabel("Password").fill(`E2E-${suffix}-Safe!9`);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByRole("heading", { name: "Request completed" })).toBeVisible();
  });

  test("email verification consumes a real test token", async ({ page }) => {
    test.skip(!process.env.E2E_VERIFICATION_TOKEN, "Set E2E_VERIFICATION_TOKEN from the staging capture mailbox.");
    await page.goto(`/auth/verify-email?token=${encodeURIComponent(process.env.E2E_VERIFICATION_TOKEN!)}`);
    await page.getByRole("button", { name: /verify email/i }).click();
    await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
  });

  test("session cookie authenticates reads and CSRF protects writes", async ({ page }) => {
    test.skip(!credentials("talent"), "Configure the seeded talent account.");
    await login(page, "talent");
    expect((await browserApi(page, "/api/v1/auth/me")).status).toBe(200);
    const rejected = await browserApi(page, "/api/v1/auth/logout", { method: "POST" });
    expect(rejected.status).toBe(403);
    const token = await csrfToken(page);
    expect(token).toBeTruthy();
    const accepted = await browserApi(page, "/api/v1/auth/logout", { method: "POST", headers: { [csrfHeader]: token! } });
    expect(accepted.status).toBe(204);
  });
});
