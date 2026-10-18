import { expect, test } from "@playwright/test";
import { browserApi, credentials, liveOnly, login } from "./helpers";

test.describe("payroll and platform administration", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");

  test("company session loads payroll and payment workflows", async ({ page }) => {
    test.skip(!credentials("company"), "Configure the seeded company account."); await login(page, "company");
    const me = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me"); const organisationId = me.payload.data.context.organisationId;
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/payroll?page=1&pageSize=20`)).status).toBe(200);
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/payments?page=1&pageSize=20`)).status).toBe(200);
  });

  test("admin dashboard uses canonical admin routes", async ({ page }) => {
    test.skip(!credentials("admin"), "Configure the seeded admin account."); await login(page, "admin");
    await page.goto("/platform-admin"); await expect(page.getByText("Operational command centre")).toBeVisible();
    for (const path of ["dashboard", "organisations?page=1&pageSize=20", "compensation/payroll?page=1&pageSize=20", "compensation/payments?page=1&pageSize=20", "operations?page=1&pageSize=20"]) {
      const result = await browserApi(page, `/api/v1/admin/${path}`); expect(result.status, `${path}: ${JSON.stringify(result.payload)}`).toBe(200);
    }
  });
});
