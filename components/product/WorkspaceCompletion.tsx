"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest, asArray, asRecord } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";
import { uploadProfileFile, downloadFile } from "@/lib/api/profile-files";
import { ProductPage, StatusChip } from "./ProductUI";
import {
  field,
  select,
  related,
  RecordForm,
  ResourceScreen,
  ResourceState,
  useResource,
  value,
  workspaceRequest,
} from "./LiveWorkspace";

export function OrganisationLogo() {
  const resource = useResource("company", "");
  const row = asRecord(resource.data.organisation);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("logo");
    if (!(file instanceof File) || !file.size) return;
    setPending(true);
    setError("");
    try {
      const { context } = await authApi.current();
      const uploaded = await uploadProfileFile(
        file,
        "ORGANISATION_LOGO",
        setStatus,
        context.organisationId ?? undefined,
      );
      await workspaceRequest("company", "", {
        method: "PATCH",
        body: { logoFileId: uploaded.id, expectedUpdatedAt: row.updatedAt },
      });
      invalidateLive();
      await resource.reload();
      setStatus("Company logo saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Logo upload failed.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="detail-card">
      <h3>Company logo</h3>
      <ResourceState resource={resource}>
        <form onSubmit={upload}>
          <label className="form-field">
            New logo
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp"
              required
            />
          </label>
          <button disabled={pending} type="submit">
            {pending ? "Uploading and scanning…" : "Upload logo"}
          </button>
        </form>
        {Boolean(row.logoFileId) && (
          <button
            type="button"
            onClick={() =>
              void downloadFile(value(row, "logoFileId")).catch((cause) =>
                setError(cause.message),
              )
            }
          >
            Download current logo
          </button>
        )}
      </ResourceState>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export function CompanyFiles() {
  const auth = useResource("account", "/auth/me");
  const organisationId = value(asRecord(auth.data.context), "organisationId");
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [fileId, setFileId] = useState("");
  return (
    <ProductPage
      title="Company files"
      description="Upload a private workspace file, wait for its safety scan, then download it using an authorised link."
    >
      <form
        className="product-form-card"
        onSubmit={(event) => {
          event.preventDefault();
          const file = new FormData(event.currentTarget).get("file");
          if (!(file instanceof File) || !file.size) return;
          setPending(true);
          setError("");
          void (async () => {
            const { context } = await authApi.current();
            const result = await uploadProfileFile(
              file,
              "OTHER",
              setStatus,
              context.organisationId ?? undefined,
            );
            setFileId(result.id);
            setRevision((current) => current + 1);
            setStatus("File saved. Keep its link to open it again.");
          })()
            .catch((cause) => setError(cause.message))
            .finally(() => setPending(false));
        }}
      >
        <label className="form-field">
          File
          <input
            name="file"
            type="file"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
            required
          />
        </label>
        <button disabled={pending}>
          {pending ? "Uploading and scanning…" : "Upload file"}
        </button>
      </form>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
      {fileId && <Link href={`/company/files/${fileId}`}>Open saved file</Link>}
      {organisationId && (
        <ResourceScreen
          key={revision}
          scope="account"
          config={{
            title: "Workspace documents",
            path: `/files?organisationId=${organisationId}`,
            key: "files",
            columns: [
              ["originalName", "File"],
              ["category", "Category"],
              ["status", "Status"],
              ["createdAt", "Uploaded"],
            ],
            href: (row) => `/company/files/${row.id}`,
          }}
        />
      )}
    </ProductPage>
  );
}
export function CompanyFile({ id }: { id: string }) {
  const resource = useResource("account", `/files/${id}`);
  const file = asRecord(resource.data.file);
  const [error, setError] = useState("");
  return (
    <ProductPage title={value(file, "originalName") || "Company file"}>
      <ResourceState resource={resource}>
        <StatusChip status={value(file, "status")} />
        <button
          type="button"
          disabled={file.status !== "READY"}
          onClick={() =>
            void downloadFile(id).catch((cause) => setError(cause.message))
          }
        >
          Download file
        </button>
        <p>Bookmark this page to return to the file.</p>
        {error && <p role="alert">{error}</p>}
      </ResourceState>
    </ProductPage>
  );
}

export function SavedJobs() {
  const resource = useResource("talent", "/saved-jobs");
  const [error, setError] = useState("");
  return (
    <ProductPage title="Saved jobs">
      <ResourceState resource={resource}>
        {asArray(resource.data.savedJobs)
          .map(asRecord)
          .map((row) => (
            <article className="detail-card" key={value(row, "jobId")}>
              <h3>{value(row, "job.title")}</h3>
              <p>{value(row, "job.organisation.name")}</p>
              <StatusChip status={value(row, "job.status")} />
              {value(row, "job.status") === "PUBLISHED" && (
                <Link href={`/talent/jobs/${row.jobId}`}>View job</Link>
              )}
              <button
                type="button"
                onClick={() =>
                  void apiRequest(
                    `/api/v1/talents/me/saved-jobs/${row.jobId}`,
                    { method: "DELETE" },
                  )
                    .then(resource.reload)
                    .catch((cause) => setError(cause.message))
                }
              >
                Remove saved job
              </button>
            </article>
          ))}
        {!asArray(resource.data.savedJobs).length && (
          <p>
            You have no saved jobs yet.{" "}
            <Link href="/talent/jobs">Find jobs</Link>
          </p>
        )}
        {error && <p role="alert">{error}</p>}
      </ResourceState>
    </ProductPage>
  );
}

export function ShortlistPicker({
  talentProfileId,
}: {
  talentProfileId: string;
}) {
  return (
    <details>
      <summary>Add to shortlist</summary>
      <RecordForm
        scope="company"
        fields={[
          related("shortlistId", "Shortlist", "/shortlists", "shortlists"),
        ]}
        submitLabel="Add candidate"
        onSave={async (body) => {
          await workspaceRequest(
            "company",
            `/shortlists/${body.shortlistId}/candidates`,
            { method: "POST", body: { talentProfileId } },
          );
          invalidateLive("org:shortlist");
        }}
      />
      <Link href="/company/shortlists">Create or manage shortlists</Link>
    </details>
  );
}

export function PerformancePeriod({ id }: { id: string }) {
  const resource = useResource("company", `/performance/periods/${id}`);
  const row = asRecord(resource.data.period);
  return (
    <ProductPage title={value(row, "name") || "Performance period"}>
      <ResourceState resource={resource}>
        <StatusChip status={value(row, "status")} />
        <h3>Metrics</h3>
        {asArray(row.metrics)
          .map(asRecord)
          .map((metric) => (
            <p key={value(metric, "id")}>
              {value(metric, "name")} ({value(metric, "kind")})
            </p>
          ))}
        {row.status === "DRAFT" && (
          <RecordForm
            scope="company"
            fields={[
              field("key", "Metric key (lowercase with underscores)"),
              field("name", "Metric name"),
              select("kind", "Metric type", [
                "NUMERIC",
                "PERCENTAGE",
                "RATING",
                "BOOLEAN",
              ]),
              field("minValue", "Minimum", "number", false),
              field("maxValue", "Maximum", "number", false),
            ]}
            submitLabel="Add metric"
            onSave={async (body) => {
              await workspaceRequest(
                "company",
                `/performance/periods/${id}/metrics`,
                {
                  method: "POST",
                  body: { ...body, formula: { type: "manual" } },
                },
              );
              await resource.reload();
            }}
          />
        )}
        <Link href="/company/performance">Manage period status</Link>
        {row.status === "OPEN" && (
          <RecordForm
            scope="company"
            fields={[
              related(
                "staffAssignmentId",
                "Team member",
                "/team-members",
                "teamMembers",
              ),
            ]}
            submitLabel="Create review"
            onSave={async (body) => {
              await workspaceRequest("company", "/performance/reviews", {
                method: "POST",
                body: { ...body, performancePeriodId: id },
              });
              invalidateLive();
            }}
          />
        )}
        <Link href="/company/performance/reviews">View reviews</Link>
      </ResourceState>
    </ProductPage>
  );
}
export function CompanyReviews() {
  return (
    <ResourceScreen
      scope="company"
      config={{
        title: "Performance reviews",
        path: "/performance/reviews",
        key: "reviews",
        columns: [
          ["staffAssignment.jobTitle", "Assignment"],
          ["performancePeriod.name", "Period"],
          ["status", "Status"],
        ],
        href: (row) => `/company/performance/reviews/${row.id}`,
      }}
    />
  );
}
export function PerformanceReview({
  id,
  scope,
}: {
  id: string;
  scope: "company" | "talent";
}) {
  const path =
    scope === "company"
      ? `/performance/reviews/${id}`
      : `/performance-reviews/${id}`;
  const resource = useResource(scope, path);
  const row = asRecord(resource.data.review);
  const metrics = asArray(asRecord(row.performancePeriod).metrics).map(
    asRecord,
  );
  const mutate = async (
    suffix: string,
    body: Record<string, unknown>,
    method: "POST" | "PATCH" | "PUT" = "POST",
  ) => {
    await workspaceRequest(scope, path + suffix, {
      method,
      body: { ...body, expectedUpdatedAt: row.updatedAt },
    });
    await resource.reload();
  };
  return (
    <ProductPage
      title={value(row, "performancePeriod.name") || "Performance review"}
    >
      <ResourceState resource={resource}>
        <StatusChip status={value(row, "status")} />
        <p>{value(row, "summary")}</p>
        {asArray(row.results)
          .map(asRecord)
          .map((result) => (
            <p key={value(result, "id")}>
              {value(result, "metricDefinition.name")}: {value(result, "value")}
            </p>
          ))}
        {asArray(row.feedback)
          .map(asRecord)
          .map((feedback) => (
            <article className="detail-card" key={value(feedback, "id")}>
              <strong>{value(feedback, "kind")}</strong>
              <p>{value(feedback, "body")}</p>
            </article>
          ))}
        {scope === "talent" &&
          ["DRAFT", "SELF_ASSESSMENT"].includes(value(row, "status")) && (
            <RecordForm
              scope={scope}
              fields={[field("body", "Self assessment", "textarea")]}
              submitLabel="Submit self assessment"
              onSave={(body) => mutate("/self-assessment", body)}
            />
          )}{" "}
        {scope === "talent" && row.status === "FINALISED" && (
          <RecordForm
            scope={scope}
            fields={[
              select("action", "Response", ["ACKNOWLEDGE", "DISPUTE"]),
              field(
                "reason",
                "Reason (required for a dispute)",
                "textarea",
                false,
              ),
            ]}
            submitLabel="Send response"
            onSave={(body) => mutate("/respond", body)}
          />
        )}{" "}
        {scope === "company" &&
          [
            "DRAFT",
            "SELF_ASSESSMENT",
            "MANAGER_REVIEW",
            "CALIBRATION",
          ].includes(value(row, "status")) && (
            <>
              <RecordForm
                scope={scope}
                row={row}
                fields={[field("summary", "Summary", "textarea", false)]}
                submitLabel="Save summary"
                onSave={(body) => mutate("", body, "PATCH")}
              />
              <RecordForm
                scope={scope}
                fields={[
                  field("body", "Feedback", "textarea"),
                  select("kind", "Feedback type", ["MANAGER", "PEER"]),
                ]}
                submitLabel="Add feedback visible to talent"
                onSave={async (body) => {
                  await workspaceRequest(scope, path + "/feedback", {
                    method: "POST",
                    body: { ...body, isVisibleToTalent: true },
                  });
                  await resource.reload();
                }}
              />
              {["MANAGER_REVIEW", "CALIBRATION"].includes(
                value(row, "status"),
              ) && (
                <RecordForm
                  scope={scope}
                  fields={[
                    {
                      name: "metricDefinitionId",
                      label: "Metric",
                      required: true,
                      options: metrics.map((metric) => ({
                        value: value(metric, "id"),
                        label: value(metric, "name"),
                      })),
                    },
                    field("value", "Result", "number"),
                    field("note", "Evidence", "textarea"),
                  ]}
                  submitLabel="Record result"
                  onSave={(body) =>
                    mutate(
                      "/results",
                      {
                        metricDefinitionId: body.metricDefinitionId,
                        value: body.value,
                        evidence: { note: body.note },
                      },
                      "PUT",
                    )
                  }
                />
              )}
              <RecordForm
                scope={scope}
                fields={[
                  select(
                    "status",
                    "Next stage",
                    ["DRAFT", "SELF_ASSESSMENT"].includes(value(row, "status"))
                      ? ["MANAGER_REVIEW"]
                      : row.status === "MANAGER_REVIEW"
                        ? ["CALIBRATION", "FINALISED"]
                        : ["FINALISED"],
                  ),
                ]}
                submitLabel="Update review stage"
                onSave={(body) => mutate("/status", body)}
              />
            </>
          )}
      </ResourceState>
    </ProductPage>
  );
}

export function ProfileBasics() {
  const resource = useResource("talent", "/profile");
  const row = asRecord(resource.data.profile);
  return (
    <ResourceState resource={resource}>
      <RecordForm
        scope="talent"
        row={row}
        key={value(row, "updatedAt")}
        fields={[
          field("headline", "Professional headline"),
          field("bio", "Bio", "textarea", false),
          field("countryCode", "Country code", "text", false),
          field("city", "City", "text", false),
          field("timeZone", "Time zone"),
          {
            ...field("yearsExperience", "Years of experience", "number", false),
            number: true,
            min: 0,
            max: 80,
          },
          field("currentTitle", "Current title", "text", false),
          field("currentCompany", "Current company", "text", false),
          field("portfolioUrl", "Portfolio URL", "url", false),
          field("linkedinUrl", "LinkedIn URL", "url", false),
          field("githubUrl", "GitHub URL", "url", false),
          field("websiteUrl", "Website URL", "url", false),
        ]}
        onSave={async (body) => {
          await workspaceRequest("talent", "/profile", {
            method: "PATCH",
            body: { ...body, expectedUpdatedAt: row.updatedAt },
          });
          invalidateLive("talent:");
          await resource.reload();
        }}
      />
      <Link href="/talent/profile/files">Manage photo and CV</Link>
      <Link href="/talent/account">Manage account identity and security</Link>
    </ResourceState>
  );
}
