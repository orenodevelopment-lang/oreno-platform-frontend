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

  test("completes the hiring journey through offer acceptance", async ({ page }) => {
    test.skip(!credentials("talent"), "Configure the seeded talent account.");
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
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/jobs/${job.id}/publish`, { expectedUpdatedAt: job.updatedAt, reason: "E2E publication" })).status).toBe(200);

    await login(page, "talent");
    const applied = await browserWrite<{ data: { application: { id: string; updatedAt: string } } }>(page, `/api/v1/jobs/${job.id}/applications`, { coverLetter: "Automated staging journey.", answers: [], attachments: [] }, { idempotent: true });
    expect(applied.status, JSON.stringify(applied.payload)).toBe(201);
    let application = applied.payload.data.application;

    await login(page, "company");
    for (const status of ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEWING"] as const) {
      const changed = await browserWrite<{ data: { application: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/applications/${application.id}/status`, { status, expectedUpdatedAt: application.updatedAt, reason: `E2E ${status}` });
      expect(changed.status, JSON.stringify(changed.payload)).toBe(200);
      application = changed.payload.data.application;
    }
    const starts = new Date(Date.now() + 86_400_000);
    const interview = await browserWrite<{ data: { interview: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/interviews`, { applicationId: application.id, stage: "E2E interview", stageOrder: 1, mode: "VIDEO", scheduledStartAt: starts.toISOString(), scheduledEndAt: new Date(starts.getTime() + 3_600_000).toISOString(), timeZone: "Africa/Lagos", meetingUrl: "https://meet.example.test/e2e", participants: [] });
    expect(interview.status, JSON.stringify(interview.payload)).toBe(201);
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/interviews/${interview.payload.data.interview.id}/outcome`, { expectedUpdatedAt: interview.payload.data.interview.updatedAt, result: "PASSED", summary: "E2E journey passed." })).status).toBe(200);

    const offered = await browserWrite<{ data: { offer: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/offers`, { applicationId: application.id, title: "Production engineer", employmentType: "FULL_TIME", workArrangement: "REMOTE", startDate: new Date(Date.now() + 7 * 86_400_000).toISOString(), expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(), terms: [{ key: "base_compensation", label: "Base hourly compensation", valueAmount: "45.00", currency: "USD", rateUnit: "HOURLY", position: 0 }] });
    expect(offered.status, JSON.stringify(offered.payload)).toBe(201);
    const offer = offered.payload.data.offer;
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/offers/${offer.id}/send`, { expectedUpdatedAt: offer.updatedAt })).status).toBe(200);

    await login(page, "talent");
    const accepted = await browserWrite<{ data: { placement: { id: string }; staffAssignment: { id: string } } }>(page, `/api/v1/talents/me/offers/${offer.id}/respond`, { response: "ACCEPT" }, { idempotent: true });
    expect(accepted.status, JSON.stringify(accepted.payload)).toBe(200);
    expect(accepted.payload.data.placement.id).toBeTruthy();
    expect(accepted.payload.data.staffAssignment.id).toBeTruthy();
  });
});
