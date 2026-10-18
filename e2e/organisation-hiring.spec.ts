import { expect, test } from "@playwright/test";
import { browserApi, credentials, liveOnly, login } from "./helpers";

test.describe("organisation onboarding, invitations and hiring journey", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");
  test.beforeEach(async ({ page }) => { test.skip(!credentials("company"), "Configure the seeded company account."); await login(page, "company"); });

  test("loads onboarding and invitations through the browser session", async ({ page }) => {
    const me = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me");
    const organisationId = me.payload.data.context.organisationId;
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/onboarding`)).status).toBe(200);
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/invitations?page=1&pageSize=20`)).status).toBe(200);
  });

  test("traverses jobs, applications, interviews, offers and placements", async ({ page }) => {
    const me = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me");
    const organisationId = me.payload.data.context.organisationId;
    for (const path of ["jobs", "applications", "interviews", "offers", "placements"]) {
      const result = await browserApi(page, `/api/v1/organisations/${organisationId}/${path}?page=1&pageSize=20`);
      expect(result.status, `${path}: ${JSON.stringify(result.payload)}`).toBe(200);
    }
  });
});
