"use client";
import Link from "next/link";
import { useState } from "react";
import { asArray, asRecord } from "@/lib/api/client";
import { invalidateLive } from "@/lib/api/live-store";
import { ProductPage, StatusChip } from "./ProductUI";
import {
  field,
  select,
  RecordForm,
  ResourceState,
  useResource,
  value,
  workspaceRequest,
} from "./LiveWorkspace";

const jobFields = [
  field("title", "Job title"),
  field("description", "Description (at least 20 characters)", "textarea"),
  field("responsibilities", "Responsibilities", "textarea", false),
  field("requirementsText", "Requirements", "textarea", false),
  select("employmentType", "Employment type", [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
    "TEMPORARY",
  ]),
  select("workArrangement", "Work arrangement", ["REMOTE", "HYBRID", "ONSITE"]),
  {
    ...field("openings", "Openings", "number"),
    number: true,
    min: 1,
    max: 1000,
    defaultValue: "1",
  },
  field("category", "Category", "text", false),
  field("countryCode", "Country code", "text", false),
  field("city", "City", "text", false),
  field("applicationDeadline", "Deadline", "date", false),
  field("rateMinAmount", "Minimum rate", "number", false),
  field("rateMaxAmount", "Maximum rate", "number", false),
  field("rateCurrency", "Rate currency", "text", false),
  select(
    "rateUnit",
    "Rate unit",
    ["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    false,
  ),
];
export function NewJob() {
  const [id, setId] = useState("");
  return (
    <ProductPage title="Create a job">
      <RecordForm
        scope="company"
        fields={jobFields}
        submitLabel="Create draft"
        onSave={async (body) => {
          const result = await workspaceRequest("company", "/jobs", {
            method: "POST",
            idempotent: true,
            body,
          });
          setId(value(asRecord(result.job), "id"));
          invalidateLive("org:jobs");
        }}
      />
      {id && <Link href={`/company/jobs/${id}`}>Review your saved job</Link>}
    </ProductPage>
  );
}
export function JobLive({ id, edit = false }: { id: string; edit?: boolean }) {
  const resource = useResource("company", `/jobs/${id}`);
  const row = asRecord(resource.data.job);
  return (
    <ProductPage
      title={value(row, "title") || "Job"}
      actions={
        <>
          <Link href={`/company/jobs/${id}/edit`}>Edit job</Link>
          <Link href="/company/applications">View applications</Link>
        </>
      }
    >
      <ResourceState resource={resource}>
        {edit ? (
          <RecordForm
            scope="company"
            row={row}
            fields={jobFields}
            key={value(row, "updatedAt")}
            onSave={async (body) => {
              await workspaceRequest("company", `/jobs/${id}`, {
                method: "PATCH",
                body: { ...body, expectedUpdatedAt: row.updatedAt },
              });
              invalidateLive("org:job");
              await resource.reload();
            }}
          />
        ) : (
          <>
            <StatusChip status={value(row, "status")} />
            <dl className="detail-list">
              {[
                ["employmentType", "Employment"],
                ["workArrangement", "Workplace"],
                ["openings", "Openings"],
                ["countryCode", "Country"],
                ["city", "City"],
              ].map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{value(row, key).replaceAll("_", " ") || "—"}</dd>
                </div>
              ))}
            </dl>
            <section className="detail-card">
              <h3>Description</h3>
              <p>{value(row, "description")}</p>
              <h3>Responsibilities</h3>
              <p>{value(row, "responsibilities") || "Not specified"}</p>
              <h3>Requirements</h3>
              <p>{value(row, "requirementsText") || "Not specified"}</p>
            </section>
          </>
        )}
      </ResourceState>
    </ProductPage>
  );
}
export function InviteMember() {
  return (
    <ProductPage title="Invite a member">
      <RecordForm
        scope="company"
        fields={[
          field("email", "Email", "email"),
          field("firstName", "First name"),
          field("lastName", "Last name"),
          select("role", "Role", ["HR_USER", "MANAGER"]),
          field("message", "Message", "textarea", false),
        ]}
        submitLabel="Send invitation"
        onSave={async (body) => {
          await workspaceRequest("company", "/invitations", {
            method: "POST",
            body,
          });
          invalidateLive("org:invitations");
        }}
      />
    </ProductPage>
  );
}
export function RolesLive() {
  const resource = useResource("company", "/roles");
  return (
    <ResourceState resource={resource}>
      {asArray(resource.data.roles)
        .map(asRecord)
        .map((row) => (
          <details className="detail-card" key={value(row, "key")}>
            <summary>{value(row, "name")}</summary>
            <p>{value(row, "description")}</p>
            <ul>
              {asArray(row.permissions)
                .map(asRecord)
                .map((item) => asRecord(item.permission))
                .map((permission) => (
                  <li key={value(permission, "key")}>
                    {value(permission, "description") ||
                      value(permission, "key")}
                  </li>
                ))}
            </ul>
          </details>
        ))}
    </ResourceState>
  );
}
export function MembersLive() {
  const resource = useResource("company", "/members?pageSize=100");
  const [error, setError] = useState("");
  return (
    <ResourceState resource={resource}>
      {error && <p role="alert">{error}</p>}
      {asArray(resource.data.members)
        .map(asRecord)
        .map((row) => (
          <article className="detail-card" key={value(row, "id")}>
            <h3>
              {value(row, "user.firstName")} {value(row, "user.lastName")}
            </h3>
            <p>{value(row, "user.email")}</p>
            <StatusChip status={value(row, "status")} />
            <RecordForm
              scope="company"
              row={{ id: row.id, role: value(row, "role.key") }}
              fields={[
                select("role", "Role", [
                  "COMPANY_OWNER",
                  "HR_USER",
                  "MANAGER",
                  "TALENT",
                ]),
              ]}
              onSave={async (body) => {
                await workspaceRequest("company", `/members/${row.id}/role`, {
                  method: "PATCH",
                  body: { ...body, expectedUpdatedAt: row.updatedAt },
                });
                await resource.reload();
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Change this member's access?")) return;
                void workspaceRequest(
                  "company",
                  `/members/${row.id}/${row.status === "ACTIVE" ? "suspend" : "reactivate"}`,
                  {
                    method: "POST",
                    body: {
                      expectedUpdatedAt: row.updatedAt,
                      ...(row.status === "ACTIVE"
                        ? {
                            reason:
                              "Changed by an authorised workspace administrator.",
                          }
                        : {}),
                    },
                  },
                )
                  .then(resource.reload)
                  .catch((cause) => setError(cause.message));
              }}
            >
              {row.status === "ACTIVE" ? "Suspend access" : "Reactivate access"}
            </button>
          </article>
        ))}
    </ResourceState>
  );
}
export function HiringApplicationChoice({
  name = "applicationId",
}: {
  name?: string;
}) {
  const resource = useResource("company", "/applications?pageSize=100");
  return (
    <label className="form-field">
      Released application
      <select name={name} required>
        <option value="">Choose a candidate and job</option>
        {asArray(resource.data.applications)
          .map(asRecord)
          .map((row) => (
            <option key={value(row, "id")} value={value(row, "id")}>
              {value(row, "talentProfile.user.firstName")}{" "}
              {value(row, "talentProfile.user.lastName")} —{" "}
              {value(row, "job.title")}
            </option>
          ))}
      </select>
      {resource.error && <small role="alert">{resource.error}</small>}
    </label>
  );
}
