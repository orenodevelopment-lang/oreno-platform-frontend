import { expect, test, type Page } from "@playwright/test";
import { browserApi, browserWrite, credentials, csrfHeader, csrfToken, liveOnly, login, type AccountKind } from "./helpers";

type Screening = {
  id: string;
  applicationId: string;
  status: string;
  updatedAt: string;
  currentCvFileId: string;
  interviews: Array<{ id: string; updatedAt: string }>;
};

type SubmittedApplication = {
  id: string;
  updatedAt: string;
  screening: Screening;
};

async function uploadReadyCv(page: Page, label: string) {
  const token = await csrfToken(page);
  expect(token).toBeTruthy();
  const content = Array.from(new TextEncoder().encode(`%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n% fictional ${label} CV\n%%EOF`));
  const ticket = await browserApi<{ data: { file: { id: string }; upload: { uploadUrl: string; method?: string; headers?: Record<string, string>; fields?: Record<string, string> } } }>(page, "/api/v1/files/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json", [csrfHeader]: token! },
    body: JSON.stringify({ category: "CV", originalName: `${label.toLowerCase()}-cv.pdf`, mimeType: "application/pdf", sizeBytes: content.length }),
  });
  expect(ticket.status, JSON.stringify(ticket.payload)).toBe(201);
  const { file, upload } = ticket.payload.data;
  const uploaded = await page.evaluate(async ({ upload, content }) => {
    const bytes = new Uint8Array(content);
    if ((upload.method ?? "PUT") === "POST") {
      const form = new FormData();
      Object.entries(upload.fields ?? {}).forEach(([key, value]) => form.append(key, value));
      form.append("file", new Blob([bytes], { type: "application/pdf" }), "candidate-cv.pdf");
      return fetch(upload.uploadUrl, { method: "POST", body: form }).then((response) => response.status);
    }
    return fetch(upload.uploadUrl, { method: "PUT", headers: upload.headers, body: bytes }).then((response) => response.status);
  }, { upload, content });
  expect(uploaded).toBeLessThan(300);
  expect((await browserApi(page, `/api/v1/files/${file.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json", [csrfHeader]: token! }, body: "{}" })).status).toBe(200);
  await expect.poll(async () => {
    const result = await browserApi<{ data: { file: { status: string } } }>(page, `/api/v1/files/${file.id}`);
    return result.payload.data.file.status;
  }, { timeout: 90_000 }).toBe("READY");
  return file.id;
}

async function apply(page: Page, kind: "candidateA" | "candidateB" | "candidateC", jobId: string) {
  await login(page, kind);
  const fileId = await uploadReadyCv(page, kind);
  const submitted = await browserWrite<{ data: { application: SubmittedApplication } }>(page, `/api/v1/public/jobs/${jobId}/applications`, {
    coverLetter: `Fictional ${kind} screening acceptance journey.`,
    answers: [],
    attachments: [{ fileId, kind: "CV", label: `${kind}-cv.pdf` }],
  }, { idempotent: true });
  expect(submitted.status, JSON.stringify(submitted.payload)).toBe(201);
  expect(submitted.payload.data.application.screening.status).toBe("PENDING_CV_REVIEW");
  return { application: submitted.payload.data.application, fileId };
}

async function authUserId(page: Page) {
  const me = await browserApi<{ data: { user: { id: string } } }>(page, "/api/v1/auth/me");
  expect(me.status).toBe(200);
  return me.payload.data.user.id;
}

async function assign(page: Page, application: SubmittedApplication, reviewerId: string) {
  const result = await browserWrite<{ data: { screening: Screening } }>(page, `/api/v1/admin/screening/applications/${application.id}/assign`, {
    reviewerId,
    expectedUpdatedAt: application.screening.updatedAt,
    reason: "Assigned to the seeded human Oreno reviewer for browser acceptance testing.",
  });
  expect(result.status, JSON.stringify(result.payload)).toBe(200);
  return result.payload.data.screening;
}

async function reviewCv(page: Page, screening: Screening, decision: "APPROVED" | "NOT_SELECTED") {
  const result = await browserWrite<{ data: { screening: Screening } }>(page, `/api/v1/admin/screening/applications/${screening.applicationId}/cv-review`, {
    expectedUpdatedAt: screening.updatedAt,
    reason: decision === "APPROVED" ? "Human reviewer confirmed role evidence in the submitted CV." : "Human reviewer found insufficient role evidence for this vacancy.",
    decision,
    rubric: { submittedCvReviewed: true, roleCriteriaCompared: true },
    privateNotes: "Fictional browser acceptance record.",
    candidateVisibleFeedback: decision === "APPROVED" ? "Your CV is advancing to an Oreno interview." : "Your application will not advance for this vacancy.",
    employerSafeSummary: decision === "APPROVED" ? "Oreno verified relevant role evidence." : null,
  });
  expect(result.status, JSON.stringify(result.payload)).toBe(200);
  return result.payload.data.screening;
}

async function interview(page: Page, screening: Screening, reviewerId: string, outcome: "PASSED" | "FAILED") {
  const starts = new Date(Date.now() + 86_400_000);
  const scheduled = await browserWrite<{ data: { screening: Screening } }>(page, `/api/v1/admin/screening/applications/${screening.applicationId}/interviews`, {
    expectedUpdatedAt: screening.updatedAt,
    reason: "Schedule the required human Oreno screening interview.",
    interviewerId: reviewerId,
    mode: "VIDEO",
    scheduledStartAt: starts.toISOString(),
    scheduledEndAt: new Date(starts.getTime() + 3_600_000).toISOString(),
    timeZone: "Africa/Lagos",
    meetingUrl: "https://meet.example.test/oreno-screening-e2e",
  });
  expect(scheduled.status, JSON.stringify(scheduled.payload)).toBe(201);
  const scheduledScreening = scheduled.payload.data.screening;
  const currentInterview = scheduledScreening.interviews[0];
  expect(currentInterview).toBeTruthy();
  const decided = await browserWrite<{ data: { screening: Screening } }>(page, `/api/v1/admin/screening/interviews/${currentInterview.id}/outcome`, {
    expectedUpdatedAt: currentInterview.updatedAt,
    reason: outcome === "PASSED" ? "Human interview verified the required job evidence." : "Human interview did not verify the required job evidence.",
    outcome,
    rubric: { humanInterviewCompleted: true, roleEvidenceDiscussed: true },
    privateNotes: "Fictional browser acceptance record.",
    candidateVisibleFeedback: outcome === "PASSED" ? "Your Oreno interview was completed successfully." : "Your application will not advance after the Oreno interview.",
  });
  expect(decided.status, JSON.stringify(decided.payload)).toBe(200);
  return decided.payload.data.screening;
}

test.describe("mandatory Oreno recruitment screening", () => {
  test.skip(!liveOnly(), "Set E2E_LIVE=true to run against an isolated staging stack.");
  test.setTimeout(360_000);

  test("keeps Candidates A/B hidden and releases Candidate C into the existing hiring journey", async ({ page }) => {
    const required: AccountKind[] = ["company", "candidateA", "candidateB", "candidateC", "reviewer", "releaseApprover"];
    test.skip(required.some((kind) => !credentials(kind)), "Configure the seeded company, three candidates, reviewer, and release approver accounts.");

    await login(page, "company");
    const companyMe = await browserApi<{ data: { context: { organisationId: string } } }>(page, "/api/v1/auth/me");
    const organisationId = companyMe.payload.data.context.organisationId;
    const suffix = Date.now();
    const created = await browserWrite<{ data: { job: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/jobs`, {
      title: `Managed screening engineer ${suffix}`,
      employmentType: "FULL_TIME",
      workArrangement: "REMOTE",
      description: "Fictional vacancy for the three-candidate managed-screening browser journey.",
      applicationDeadline: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      requirements: [{ kind: "OTHER", label: "Production integration evidence", weight: 1, isMandatory: true, position: 0 }],
    }, { idempotent: true });
    expect(created.status, JSON.stringify(created.payload)).toBe(201);
    const job = created.payload.data.job;
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/jobs/${job.id}/publish`, { expectedUpdatedAt: job.updatedAt, reason: "Publish the isolated screening acceptance vacancy." })).status).toBe(200);

    const candidateA = await apply(page, "candidateA", job.id);
    const candidateB = await apply(page, "candidateB", job.id);
    const candidateC = await apply(page, "candidateC", job.id);

    await login(page, "company");
    for (const candidate of [candidateA, candidateB, candidateC]) {
      expect((await browserApi(page, `/api/v1/organisations/${organisationId}/applications/${candidate.application.id}`)).status).toBe(404);
      expect((await browserWrite(page, `/api/v1/files/${candidate.fileId}/download`, {})).status).toBeGreaterThanOrEqual(403);
    }

    await login(page, "reviewer");
    const reviewerId = await authUserId(page);

    let screeningA = await assign(page, candidateA.application, reviewerId);
    screeningA = await reviewCv(page, screeningA, "NOT_SELECTED");
    expect(screeningA.status).toBe("NOT_SELECTED");
    await login(page, "candidateA");
    const candidateAStatus = await browserApi<{ data: { screening: Screening } }>(page, `/api/v1/talents/me/applications/${candidateA.application.id}/screening`);
    expect(candidateAStatus.payload.data.screening.status).toBe("NOT_SELECTED");

    await login(page, "reviewer");
    let screeningB = await assign(page, candidateB.application, reviewerId);
    screeningB = await reviewCv(page, screeningB, "APPROVED");
    screeningB = await interview(page, screeningB, reviewerId, "FAILED");
    expect(screeningB.status).toBe("NOT_SELECTED");

    let screeningC = await assign(page, candidateC.application, reviewerId);
    screeningC = await reviewCv(page, screeningC, "APPROVED");
    screeningC = await interview(page, screeningC, reviewerId, "PASSED");
    const approved = await browserWrite<{ data: { screening: Screening } }>(page, `/api/v1/admin/screening/applications/${candidateC.application.id}/final-decision`, {
      expectedUpdatedAt: screeningC.updatedAt,
      reason: "Human CV and interview evidence support submission to the company.",
      decision: "APPROVED",
      candidateMessage: "Oreno approved your application for forwarding.",
      employerSummary: "Oreno reviewed the submitted CV and completed a human role interview.",
    });
    expect(approved.status, JSON.stringify(approved.payload)).toBe(200);
    screeningC = approved.payload.data.screening;
    expect(screeningC.status).toBe("APPROVED_FOR_SUBMISSION");

    await login(page, "company");
    expect((await browserApi(page, `/api/v1/organisations/${organisationId}/applications/${candidateC.application.id}`)).status).toBe(404);

    await login(page, "releaseApprover");
    const released = await browserWrite<{ data: { screening: Screening }; meta: { replayed: boolean } }>(page, `/api/v1/admin/screening/applications/${candidateC.application.id}/release`, {
      expectedUpdatedAt: screeningC.updatedAt,
      reason: "Explicitly forward the approved fictional candidate to the target company.",
      organisationId,
      confirmation: true,
    }, { idempotent: true });
    expect(released.status, JSON.stringify(released.payload)).toBe(200);
    expect(released.payload.data.screening.status).toBe("RELEASED_TO_COMPANY");

    await login(page, "company");
    const visible = await browserApi<{ data: { application: { screening: { employerSummary: string } } } }>(page, `/api/v1/organisations/${organisationId}/applications/${candidateC.application.id}`);
    expect(visible.status, JSON.stringify(visible.payload)).toBe(200);
    expect(visible.payload.data.application.screening.employerSummary).toContain("human role interview");
    for (const hidden of [candidateA, candidateB]) {
      expect((await browserApi(page, `/api/v1/organisations/${organisationId}/applications/${hidden.application.id}`)).status).toBe(404);
    }

    const starts = new Date(Date.now() + 2 * 86_400_000);
    const companyInterview = await browserWrite<{ data: { interview: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/interviews`, {
      applicationId: candidateC.application.id,
      stage: "Company interview",
      stageOrder: 1,
      mode: "VIDEO",
      scheduledStartAt: starts.toISOString(),
      scheduledEndAt: new Date(starts.getTime() + 3_600_000).toISOString(),
      timeZone: "Africa/Lagos",
      meetingUrl: "https://meet.example.test/company-e2e",
      participants: [],
    });
    expect(companyInterview.status, JSON.stringify(companyInterview.payload)).toBe(201);
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/interviews/${companyInterview.payload.data.interview.id}/outcome`, { expectedUpdatedAt: companyInterview.payload.data.interview.updatedAt, result: "PASSED", summary: "Fictional company interview passed." })).status).toBe(200);

    const offered = await browserWrite<{ data: { offer: { id: string; updatedAt: string } } }>(page, `/api/v1/organisations/${organisationId}/offers`, {
      applicationId: candidateC.application.id,
      title: "Managed screening engineer",
      employmentType: "FULL_TIME",
      workArrangement: "REMOTE",
      startDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      terms: [{ key: "base_compensation", label: "Base hourly compensation", valueAmount: "45.00", currency: "USD", rateUnit: "HOURLY", position: 0 }],
    });
    expect(offered.status, JSON.stringify(offered.payload)).toBe(201);
    const offer = offered.payload.data.offer;
    expect((await browserWrite(page, `/api/v1/organisations/${organisationId}/offers/${offer.id}/send`, { expectedUpdatedAt: offer.updatedAt })).status).toBe(200);

    await login(page, "candidateC");
    const accepted = await browserWrite<{ data: { placement: { id: string }; staffAssignment: { id: string } } }>(page, `/api/v1/talents/me/offers/${offer.id}/respond`, { response: "ACCEPT" }, { idempotent: true });
    expect(accepted.status, JSON.stringify(accepted.payload)).toBe(200);
    expect(accepted.payload.data.placement.id).toBeTruthy();
    expect(accepted.payload.data.staffAssignment.id).toBeTruthy();
  });
});
