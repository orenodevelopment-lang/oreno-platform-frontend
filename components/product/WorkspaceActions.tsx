"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiRequest, asArray, asRecord, textValue } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";
import { ProductPage, StatusChip } from "./ProductUI";
import {
  field,
  related,
  select,
  value,
  label,
  RecordForm,
  ResourceState,
  ResourceScreen,
  useResource,
  workspaceRequest,
  type Row,
} from "./LiveWorkspace";
import { uploadProfileFile, downloadFile } from "@/lib/api/profile-files";

export function ProfileFiles() {
  const resource = useResource("talent", "/profile");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;
    setBusy(true);
    setError("");
    try {
      const category = String(form.get("category")) as "CV" | "PROFILE_PHOTO";
      const result = await uploadProfileFile(file, category, setStatus);
      await apiRequest("/api/v1/talents/me/files", {
        method: "PUT",
        body: { fileId: result.id, field: category },
      });
      invalidateLive("talent:");
      await resource.reload();
      setStatus("File saved to your profile.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <ProductPage title="Profile photo and CV">
      <form className="product-form-card" onSubmit={upload}>
        <label className="form-field">
          File type
          <select name="category">
            <option value="CV">CV (PDF, DOC, DOCX)</option>
            <option value="PROFILE_PHOTO">
              Profile photo (JPG, PNG, WebP)
            </option>
          </select>
        </label>
        <label className="form-field">
          File
          <input
            name="file"
            type="file"
            required
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          />
        </label>
        <button disabled={busy} type="submit">
          {busy ? "Uploading and scanning…" : "Upload"}
        </button>
        {status && <p role="status">{status}</p>}
        {error && <p role="alert">{error}</p>}
      </form>
      <ResourceState resource={resource}>
        {asArray(asRecord(resource.data.profile).documents)
          .map(asRecord)
          .map((row) => (
            <p key={value(row, "id")}>
              <button
                type="button"
                onClick={() =>
                  void downloadFile(value(asRecord(row.file), "id")).catch(
                    (cause) => setError(cause.message),
                  )
                }
              >
                {value(asRecord(row.file), "originalName")}
              </button>
            </p>
          ))}
      </ResourceState>
    </ProductPage>
  );
}
const availabilityFields = [
  select("availabilityStatus", "Availability", [
    "AVAILABLE_NOW",
    "AVAILABLE_FROM_DATE",
    "UNAVAILABLE",
  ]),
  field("availableFrom", "Available from", "date", false),
  {
    ...select("preferredEmploymentTypes", "Employment types", [
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
    ]),
    multiple: true,
  },
  select(
    "preferredWorkArrangement",
    "Work arrangement",
    ["REMOTE", "HYBRID", "ONSITE"],
    false,
  ),
  {
    ...field("hoursPerWeek", "Hours per week", "number", false),
    number: true,
    min: 1,
    max: 168,
  },
  field("expectedRateAmount", "Expected rate", "number", false),
  field("expectedRateCurrency", "Currency", "text", false),
  select(
    "expectedRateUnit",
    "Rate unit",
    ["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    false,
  ),
];
export function AvailabilityLive() {
  const resource = useResource("talent", "/profile");
  const row = asRecord(resource.data.profile);
  return (
    <ProductPage title="Availability and preferences">
      <ResourceState resource={resource}>
        <RecordForm
          scope="talent"
          fields={availabilityFields}
          row={row}
          key={value(row, "updatedAt")}
          onSave={async (body) => {
            await workspaceRequest("talent", "/availability", {
              method: "PATCH",
              body: {
                preferredWorkArrangement: null,
                hoursPerWeek: null,
                expectedRateAmount: null,
                expectedRateCurrency: null,
                expectedRateUnit: null,
                ...body,
                availableFrom:
                  body.availabilityStatus === "AVAILABLE_FROM_DATE"
                    ? (body.availableFrom ?? null)
                    : null,
                expectedUpdatedAt: row.updatedAt,
              },
            });
            invalidateLive("talent:");
            await resource.reload();
          }}
        />
      </ResourceState>
    </ProductPage>
  );
}

export function AccountSecurity() {
  const resource = useResource("account", "/auth/sessions");
  const [setup, setSetup] = useState<{
    secret: string;
    otpauthUrl: string;
    setupToken: string;
  }>();
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(action: () => Promise<unknown>) {
    setError("");
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage("Account security updated.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The security action failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="detail-card">
      <h3>Sessions and two-step verification</h3>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <ResourceState resource={resource}>
        {asArray(resource.data.sessions)
          .map(asRecord)
          .map((row) => (
            <div className="dashboard-live-row" key={value(row, "id")}>
              <span>
                {value(row, "deviceLabel") || "Browser session"}
                {row.current ? " (current)" : ""}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await authApi.revokeSession(value(row, "id"));
                    if (row.current)
                      window.dispatchEvent(new Event("oreno:session-expired"));
                    else await resource.reload();
                  })
                }
              >
                Sign out device
              </button>
            </div>
          ))}
      </ResourceState>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            setSetup(await authApi.startTwoFactorSetup());
          })
        }
      >
        Set up authenticator
      </button>
      {setup && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const code = String(new FormData(event.currentTarget).get("code"));
            void run(async () => {
              const result = await authApi.confirmTwoFactorSetup(
                code,
                setup.setupToken,
              );
              setCodes(result.recoveryCodes);
              setSetup(undefined);
              invalidateLive("talent:account");
            });
          }}
        >
          <p>
            Enter this setup key in your authenticator app, then enter its
            six-digit code.
          </p>
          <code className="security-secret">{setup.secret}</code>
          <label className="form-field">
            Authenticator code
            <input
              name="code"
              autoComplete="one-time-code"
              required
              pattern="[0-9]{6}"
            />
          </label>
          <button disabled={busy}>Confirm authenticator</button>
        </form>
      )}
      {codes.length > 0 && (
        <div role="status">
          <p>
            Save these recovery codes somewhere safe. Each can be used once.
          </p>
          <pre>{codes.join("\n")}</pre>
          <button type="button" onClick={() => setCodes([])}>
            I saved my codes
          </button>
        </div>
      )}
      <details>
        <summary>Disable two-step verification</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void run(async () => {
              await authApi.disableTwoFactor(
                String(form.get("password")),
                String(form.get("code")),
              );
              invalidateLive("talent:account");
            });
          }}
        >
          <label className="form-field">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="form-field">
            Authenticator or recovery code
            <input name="code" required />
          </label>
          <button disabled={busy}>Disable authenticator</button>
        </form>
      </details>
    </section>
  );
}

export function TaskLive({ id }: { id: string }) {
  const resource = useResource("company", `/tasks/${id}`);
  const row = asRecord(resource.data.task);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function command(suffix: string, body: Row) {
    setBusy(true);
    setError("");
    try {
      await workspaceRequest("company", `/tasks/${id}${suffix}`, {
        method: "POST",
        body,
      });
      invalidateLive("org:task");
      await resource.reload();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update task.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ProductPage title={value(row, "title") || "Task"}>
      <ResourceState resource={resource}>
        <p>{value(row, "description")}</p>
        <label className="form-field">
          Status
          <select
            disabled={busy}
            value={value(row, "status")}
            onChange={(event) =>
              void command("/status", {
                status: event.target.value,
                expectedUpdatedAt: row.updatedAt,
              })
            }
          >
            {[
              "TO_DO",
              "IN_PROGRESS",
              "IN_REVIEW",
              "COMPLETED",
              "CANCELLED",
            ].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        {asArray(row.comments)
          .map(asRecord)
          .map((comment) => (
            <article className="detail-card" key={value(comment, "id")}>
              <strong>{label(asRecord(comment.author))}</strong>
              <p>{value(comment, "body")}</p>
            </article>
          ))}
        <RecordForm
          scope="company"
          fields={[field("body", "Comment", "textarea")]}
          submitLabel="Add comment"
          onSave={async (body) => {
            await workspaceRequest("company", `/tasks/${id}/comments`, {
              method: "POST",
              body,
            });
            await resource.reload();
          }}
        />
        {error && <p role="alert">{error}</p>}
      </ResourceState>
    </ProductPage>
  );
}
export function TaskCalendarLive({ scope }: { scope: "talent" | "company" }) {
  return (
    <ResourceScreen
      scope={scope}
      config={{
        title: "Task calendar",
        path: "/tasks",
        key: "tasks",
        columns: [
          ["title", "Task"],
          ["dueDate", "Due date"],
          ["status", "Status"],
        ],
        href: (row) => `/${scope}/tasks/${row.id}`,
      }}
    />
  );
}

export function ShortlistLive({ id }: { id: string }) {
  const resource = useResource("company", `/shortlists/${id}`);
  const row = asRecord(resource.data.shortlist);
  const [error, setError] = useState("");
  return (
    <ProductPage title={value(row, "name") || "Shortlist"}>
      <ResourceState resource={resource}>
        <p>{value(row, "description")}</p>
        {error && <p role="alert">{error}</p>}
        {asArray(row.candidates)
          .map(asRecord)
          .map((candidate) => (
            <article key={value(candidate, "id")}>
              <p>{label(asRecord(candidate.talentProfile))}</p>
              <button
                type="button"
                onClick={() =>
                  void workspaceRequest(
                    "company",
                    `/shortlists/${id}/candidates/${candidate.id}`,
                    { method: "DELETE" },
                  )
                    .then(resource.reload)
                    .catch((cause) => setError(cause.message))
                }
              >
                Remove candidate
              </button>
            </article>
          ))}
        <RecordForm
          scope="company"
          fields={[
            {
              ...related("talentProfileId", "Candidate", "/talents", "talents"),
              source: { scope: "account", path: "/talents", key: "talents" },
            },
          ]}
          submitLabel="Add candidate"
          onSave={async (body) => {
            await workspaceRequest("company", `/shortlists/${id}/candidates`, {
              method: "POST",
              body,
            });
            await resource.reload();
          }}
        />
        <RecordForm
          scope="company"
          fields={[field("body", "Note", "textarea")]}
          submitLabel="Add note"
          onSave={async (body) => {
            await workspaceRequest("company", `/shortlists/${id}/notes`, {
              method: "POST",
              body,
            });
            await resource.reload();
          }}
        />
        {asArray(row.notes)
          .map(asRecord)
          .map((note) => (
            <p key={value(note, "id")}>{value(note, "body")}</p>
          ))}
      </ResourceState>
    </ProductPage>
  );
}

export function MemberLive({ id }: { id: string }) {
  const resource = useResource("company", `/team-members/${id}`);
  const row = asRecord(resource.data.teamMember);
  return (
    <ProductPage title={label(row)}>
      <ResourceState resource={resource}>
        <RecordForm
          key={value(row, "updatedAt")}
          scope="company"
          row={row}
          fields={[
            field("jobTitle", "Job title"),
            select("status", "Status", ["PENDING", "ACTIVE", "SUSPENDED"]),
          ]}
          onSave={async (body) => {
            await workspaceRequest("company", `/team-members/${id}`, {
              method: "PATCH",
              body: { ...body, expectedUpdatedAt: row.updatedAt },
            });
            await resource.reload();
          }}
        />
        <RecordForm
          scope="company"
          fields={[
            related(
              "departmentId",
              "Department",
              "/departments",
              "departments",
            ),
            field("effectiveFrom", "Effective from", "date"),
          ]}
          submitLabel="Assign department"
          onSave={async (body) => {
            await workspaceRequest(
              "company",
              `/team-members/${id}/department`,
              { method: "POST", body },
            );
            await resource.reload();
          }}
        />
        <RecordForm
          scope="company"
          fields={[
            related(
              "staffAssignmentId",
              "Manager",
              "/team-members",
              "teamMembers",
            ),
            field("effectiveFrom", "Effective from", "date"),
          ]}
          submitLabel="Assign manager"
          onSave={async (body) => {
            await workspaceRequest("company", `/team-members/${id}/manager`, {
              method: "POST",
              body: {
                manager: {
                  type: "STAFF_ASSIGNMENT",
                  staffAssignmentId: body.staffAssignmentId,
                },
                effectiveFrom: body.effectiveFrom,
              },
            });
            await resource.reload();
          }}
        />
        <RecordForm
          scope="company"
          fields={[
            {
              ...related("teamIds", "Teams", "/teams", "teams"),
              multiple: true,
            },
            field("effectiveFrom", "Effective from", "date"),
          ]}
          submitLabel="Assign teams"
          onSave={async (body) => {
            await workspaceRequest("company", `/team-members/${id}/teams`, {
              method: "POST",
              body: {
                teams: asArray(body.teamIds).map((teamId) => ({
                  teamId,
                  isLead: false,
                })),
                effectiveFrom: body.effectiveFrom,
              },
            });
            await resource.reload();
          }}
        />
      </ResourceState>
    </ProductPage>
  );
}

export function OfferActions({ id }: { id: string }) {
  const resource = useResource("company", "/offers", "offers");
  const row = asArray(resource.data.offers)
    .map(asRecord)
    .find((row) => row.id === id);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function send(command: string) {
    if (!row) return;
    setPending(true);
    setError("");
    try {
      await workspaceRequest("company", `/offers/${id}/${command}`, {
        method: "POST",
        idempotent: true,
        body: { expectedUpdatedAt: row.updatedAt },
      });
      invalidateLive("org:offers");
      await resource.reload();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update offer.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      {error && <p role="alert">{error}</p>}
      {row?.status === "DRAFT" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => void send("send")}
        >
          Send offer to candidate
        </button>
      )}
      {["DRAFT", "SENT", "VIEWED"].includes(textValue(row?.status)) && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Withdraw this offer?")) void send("withdraw");
          }}
        >
          Withdraw offer
        </button>
      )}
    </div>
  );
}

export function TalentTeamLive() {
  const resource = useResource("talent", "/workforce/assignments");
  return (
    <ProductPage title="Your work assignments">
      <ResourceState resource={resource}>
        {asArray(resource.data.assignments)
          .map(asRecord)
          .map((row) => (
            <article className="detail-card" key={value(row, "id")}>
              <h3>{value(row, "organisation.name")}</h3>
              <p>{value(row, "jobTitle")}</p>
              <StatusChip status={value(row, "status")} />
              <Link href="/talent/messages">Message an authorised contact</Link>
            </article>
          ))}
        {asArray(resource.data.assignments).length === 0 && (
          <p>You have no work assignments yet.</p>
        )}
      </ResourceState>
    </ProductPage>
  );
}
export function TalentList({ kind }: { kind: "interviews" | "offers" }) {
  return (
    <ResourceScreen
      scope="talent"
      config={{
        title: kind === "offers" ? "Offers" : "Interviews",
        path: `/${kind}`,
        key: kind,
        columns:
          kind === "offers"
            ? [
                ["title", "Title"],
                ["startDate", "Start"],
                ["status", "Status"],
              ]
            : [
                ["stage", "Interview"],
                ["scheduledStartAt", "Scheduled"],
                ["status", "Status"],
              ],
        href: (row) => `/talent/${kind}/${row.id}`,
      }}
    />
  );
}
