import { expect, test } from "@playwright/test";
import { browserApi, browserWrite, credentials, liveOnly, login } from "./helpers";

test.describe("organisation onboarding, invitations and hiring journey", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");
  test.beforeEach(async ({ page }) => { test.skip(!credentials("company"), "Configure the seeded company account."); await login(page, "company"); });

  test("loads onboarding and invitations through the browser session", async ({ page }) => {
    const me = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me");
    const organisationId = me.payload.data.context.organisationId;
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/onboarding`)).status).toBe(200);
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/invitations?page=1&pageSize=20`)).status).toBe(200);
  });

  test("creates and publishes a vacancy for the managed hiring flow", async ({ page }) => {
    const me = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me");
    const organisationId = me.payload.data.context.organisationId;
    const suffix = Date.now();
    const created = await browserWrite<{ data: { job: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/jobs`, {
      title: `E2E production engineer ${suffix}`,
      employmentType: "FULL_TIME",
      workArrangement: "REMOTE",
      description: "Verify the deployed frontend and API hiring contract end to end.",
      applicationDeadline: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      requirements: [{ kind: "OTHER", label: "Production integration", weight: 1, isMandatory: true, position: 0 }],
    }, { idempotent: true });
    expect(created.status, JSON.stringify(created.payload)).toBe(201);
    const job = created.payload.data.job;
    const published = await browserWrite<{ data: { job: { status: string } } }>(page, `/api/v1/organisations/${organisationId}/jobs/${job.id}/publish`, { expectedUpdatedAt: job.updatedAt, reason: "E2E publication" });
    expect(published.status, JSON.stringify(published.payload)).toBe(200);
    expect(published.payload.data.job.status).toBe("PUBLISHED");
  });
});
