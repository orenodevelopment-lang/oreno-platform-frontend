"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  apiRequest,
  asArray,
  asRecord,
  dateLabel,
  type ApiRequestOptions,
} from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";
import { invalidateLive } from "@/lib/api/live-store";
import { ProductPage, StatusChip } from "./ProductUI";
import { WorkspaceSkeleton } from "@/components/WorkspaceSessionGate";

export type Row = Record<string, unknown>;
type Scope = "company" | "talent" | "account";
export function value(row: Row, key: string): string {
  const result = key
    .split(".")
    .reduce<unknown>((current, part) => asRecord(current)[part], row);
  return result === null || result === undefined
    ? ""
    : typeof result === "object"
      ? ""
      : String(result);
}
export function label(row: Row) {
  return (
    value(row, "name") ||
    value(row, "title") ||
    value(row, "jobTitle") ||
    value(row, "user.displayName") ||
    [value(row, "user.firstName"), value(row, "user.lastName")]
      .filter(Boolean)
      .join(" ") ||
    [
      value(row, "talentProfile.user.firstName"),
      value(row, "talentProfile.user.lastName"),
    ]
      .filter(Boolean)
      .join(" ") ||
    value(row, "email") ||
    value(row, "reference") ||
    "Record"
  );
}
export async function workspaceRequest<T = Row>(
  scope: Scope,
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (scope === "company") {
    const { context } = await authApi.current();
    if (!context.organisationId)
      throw new Error("This account has no company workspace.");
    return apiRequest<T>(
      `/api/v1/organisations/${context.organisationId}${path}`,
      { ...options, organisationId: context.organisationId },
    );
  }
  return apiRequest<T>(
    (scope === "talent" ? "/api/v1/talents/me" : "/api/v1") + path,
    options,
  );
}
export async function workspaceList(
  scope: Scope,
  path: string,
  key: string,
): Promise<Row[]> {
  const items: Row[] = [];
  for (let page = 1; ; page++) {
    const result = await workspaceRequest<{
      data: Row;
      meta?: { hasNextPage?: boolean };
    }>(scope, path, { direct: true, query: { page, pageSize: 100 } });
    items.push(...asArray(result.data[key]).map(asRecord));
    if (!result.meta?.hasNextPage) return items;
  }
}
export function useResource(scope: Scope, path: string, listKey?: string) {
  const [data, setData] = useState<Row>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const version = useRef(0);
  const reload = useCallback(async () => {
    const current = ++version.current;
    setError("");
    setLoading(true);
    try {
      const result = listKey
        ? { [listKey]: await workspaceList(scope, path, listKey) }
        : await workspaceRequest(scope, path);
      if (current === version.current) setData(result);
    } catch (cause) {
      if (current === version.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "The records could not be loaded.",
        );
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, [scope, path, listKey]);
  useEffect(() => {
    const tracker = version;
    let active = true;
    queueMicrotask(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
      tracker.current++;
    };
  }, [reload]);
  return { data, error, loading, reload };
}
type Choice = { value: string; label: string };
export type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Choice[];
  source?: { scope?: Scope; path: string; key: string };
  number?: boolean;
  multiple?: boolean;
  immutable?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
};
export const field = (
  name: string,
  label: string,
  type = "text",
  required = true,
): Field => ({ name, label, type, required });
export const select = (
  name: string,
  label: string,
  options: string[],
  required = true,
): Field => ({
  name,
  label,
  required,
  options: options.map((value) => ({
    value,
    label: value.replaceAll("_", " "),
  })),
});
export const related = (
  name: string,
  label: string,
  path: string,
  key: string,
  required = true,
): Field => ({ name, label, required, source: { path, key } });
function FieldInput({
  definition,
  scope,
  row,
}: {
  definition: Field;
  scope: Scope;
  row: Row;
}) {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [error, setError] = useState("");
  const { source } = definition;
  useEffect(() => {
    if (!source) return;
    let active = true;
    workspaceList(source.scope ?? scope, source.path, source.key)
      .then((result) => {
        if (active)
          setChoices(
            result.map((item) => ({
              value: value(item, "id"),
              label: label(item),
            })),
          );
      })
      .catch(() => {
        if (active)
          setError("Options could not be loaded. Refresh and try again.");
      });
    return () => {
      active = false;
    };
  }, [source, scope]);
  const options = definition.options ?? (source ? choices : undefined);
  const original = row[definition.name];
  const initial =
    definition.type === "date"
      ? value(row, definition.name).slice(0, 10)
      : value(row, definition.name);
  return (
    <label className="form-field">
      <span>
        {definition.label}
        {definition.required ? " *" : ""}
      </span>
      {options ? (
        <select
          name={definition.name}
          required={definition.required}
          multiple={definition.multiple}
          defaultValue={
            definition.multiple
              ? asArray(original).map(String)
              : initial || definition.defaultValue || ""
          }
        >
          {!definition.multiple && (
            <option value="">Choose {definition.label.toLowerCase()}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : definition.type === "textarea" ? (
        <textarea
          name={definition.name}
          required={definition.required}
          defaultValue={initial}
          rows={4}
        />
      ) : (
        <input
          name={definition.name}
          type={definition.type ?? "text"}
          required={definition.required}
          min={definition.min}
          max={definition.max}
          step={definition.number ? "1" : "any"}
          defaultValue={initial || definition.defaultValue || ""}
        />
      )}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
export function RecordForm({
  scope,
  fields,
  row = {},
  onSave,
  onCancel,
  submitLabel = "Save",
}: {
  scope: Scope;
  fields: Field[];
  row?: Row;
  onSave: (data: Row) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const body: Row = {};
    for (const item of fields) {
      if (row.id && item.immutable) continue;
      const raw = form.get(item.name);
      if (item.multiple) body[item.name] = form.getAll(item.name).map(String);
      else if (raw !== null && raw !== "")
        body[item.name] = item.number ? Number(raw) : String(raw);
      else if (!item.required && row.id)
        body[item.name] = item.number
          ? item.defaultValue
            ? Number(item.defaultValue)
            : undefined
          : null;
    }
    setPending(true);
    setError("");
    setSaved(false);
    try {
      await onSave(body);
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The change could not be saved.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="product-form-card" onSubmit={submit}>
      <div className="form-grid">
        {fields
          .filter((item) => !row.id || !item.immutable)
          .map((item) => (
            <FieldInput
              key={item.name}
              definition={item}
              scope={scope}
              row={row}
            />
          ))}
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      {saved && <p role="status">Saved successfully.</p>}
      <footer>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="platform-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </footer>
    </form>
  );
}
type Action = {
  label: string;
  suffix: string;
  body?: Row;
  states?: string[];
  revision?: boolean;
  method?: "POST" | "DELETE";
  confirm?: boolean;
};
export type ResourceConfig = {
  title: string;
  path: string;
  key: string;
  fields?: Field[];
  columns: Array<[string, string]>;
  edit?: boolean;
  editStates?: string[];
  remove?: boolean;
  actions?: Action[];
  readPath?: string;
  readKey?: string;
  description?: string;
  href?: (row: Row) => string;
};
export function ResourceScreen({
  scope,
  config,
  children,
}: {
  scope: Scope;
  config: ResourceConfig;
  children?: ReactNode;
}) {
  const [page, setPage] = useState(1);
  const readPath = config.readPath ?? config.path;
  const resource = useResource(
    scope,
    `${readPath}${readPath.includes("?") ? "&" : "?"}page=${page}&pageSize=50`,
  );
  const container = config.readKey
    ? asRecord(resource.data[config.readKey])
    : resource.data;
  const rows = asArray(container[config.key]).map(asRecord);
  const [editing, setEditing] = useState<Row>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save(body: Row) {
    await workspaceRequest(
      scope,
      config.path + (editing?.id ? `/${editing.id}` : ""),
      {
        method: editing?.id ? "PATCH" : "POST",
        idempotent: !editing?.id,
        body: {
          ...body,
          ...(editing?.id ? { expectedUpdatedAt: editing.updatedAt } : {}),
        },
      },
    );
    invalidateLive();
    setEditing(undefined);
    await resource.reload();
  }
  async function action(row: Row, command: Action) {
    if (command.confirm && !window.confirm(`${command.label} this record?`))
      return;
    setPending(true);
    setError("");
    try {
      await workspaceRequest(
        scope,
        `${config.path}/${row.id}${command.suffix}`,
        {
          method: command.method ?? "POST",
          idempotent: true,
          body:
            command.method === "DELETE"
              ? undefined
              : {
                  ...command.body,
                  ...(command.revision === false
                    ? {}
                    : { expectedUpdatedAt: row.updatedAt }),
                },
        },
      );
      invalidateLive();
      await resource.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The action failed.");
    } finally {
      setPending(false);
    }
  }
  return (
    <ProductPage
      title={config.title}
      description={config.description}
      actions={
        config.fields && (
          <button
            className="platform-primary"
            type="button"
            onClick={() => setEditing({})}
          >
            Add {config.title.toLowerCase()}
          </button>
        )
      }
    >
      {children}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      {editing && config.fields && (
        <RecordForm
          key={value(editing, "id") || "new"}
          scope={scope}
          fields={config.fields}
          row={editing}
          onSave={save}
          onCancel={() => setEditing(undefined)}
        />
      )}
      <ResourceState resource={resource}>
        {rows.length === 0 ? (
          <p>No records yet.</p>
        ) : (
          <div className="workspace-table">
            <table>
              <thead>
                <tr>
                  {config.columns.map(([key, name]) => (
                    <th key={key}>{name}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={value(row, "id") || index}>
                    {config.columns.map(([key]) => (
                      <td key={key}>
                        {key.toLowerCase().includes("date") ||
                        key.endsWith("At") ||
                        key === "effectiveFrom"
                          ? dateLabel(value(row, key))
                          : value(row, key) || "—"}
                      </td>
                    ))}
                    <td>
                      {config.href && (
                        <Link href={config.href(row)}>View details</Link>
                      )}
                      {config.edit &&
                        (!config.editStates ||
                          config.editStates.includes(value(row, "status"))) &&
                        config.fields && (
                          <button type="button" onClick={() => setEditing(row)}>
                            Edit
                          </button>
                        )}
                      {config.remove && (
                        <button
                          disabled={pending}
                          type="button"
                          onClick={() =>
                            void action(row, {
                              label: "Remove",
                              suffix: "",
                              method: "DELETE",
                              confirm: true,
                            })
                          }
                        >
                          Remove
                        </button>
                      )}
                      {config.actions
                        ?.filter(
                          (command) =>
                            !command.states ||
                            command.states.includes(value(row, "status")),
                        )
                        .map((command) => (
                          <button
                            type="button"
                            disabled={pending}
                            key={command.label}
                            onClick={() => void action(row, command)}
                          >
                            {command.label}
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="workspace-pagination">
          <button
            type="button"
            disabled={page === 1 || resource.loading}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            disabled={
              rows.length < 50 ||
              resource.loading ||
              Boolean(config.readKey) ||
              readPath !== config.path ||
              ["/teams", "/departments"].includes(config.path)
            }
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </ResourceState>
    </ProductPage>
  );
}
export function ResourceState({
  resource,
  children,
}: {
  resource: ReturnType<typeof useResource>;
  children: ReactNode;
}) {
  return resource.loading ? (
    <WorkspaceSkeleton />
  ) : resource.error ? (
    <div role="alert">
      <p>{resource.error}</p>
      <button type="button" onClick={() => void resource.reload()}>
        Retry
      </button>
    </div>
  ) : (
    <>{children}</>
  );
}

const nameDescription = [
  field("name", "Name"),
  field("description", "Description", "textarea", false),
];
const dates = [
  field("startDate", "Start date", "date"),
  field("endDate", "End date", "date"),
];
const staff = related(
  "staffAssignmentId",
  "Team member",
  "/team-members",
  "teamMembers",
);
export const companyResources: Record<string, ResourceConfig> = {
  departments: {
    title: "Departments",
    path: "/departments",
    key: "departments",
    fields: [
      ...nameDescription,
      related(
        "parentId",
        "Parent department",
        "/departments",
        "departments",
        false,
      ),
    ],
    columns: [
      ["name", "Name"],
      ["description", "Description"],
    ],
    edit: true,
    remove: true,
  },
  teams: {
    title: "Teams",
    path: "/teams",
    key: "teams",
    fields: [
      ...nameDescription,
      related(
        "departmentId",
        "Department",
        "/departments",
        "departments",
        false,
      ),
    ],
    columns: [
      ["name", "Name"],
      ["department.name", "Department"],
      ["description", "Description"],
    ],
    edit: true,
    remove: true,
  },
  team: {
    title: "Team members",
    path: "/team-members",
    key: "teamMembers",
    columns: [
      ["employeeCode", "Employee"],
      ["talentProfile.user.firstName", "First name"],
      ["talentProfile.user.lastName", "Last name"],
      ["jobTitle", "Role"],
      ["status", "Status"],
    ],
    href: (row) => `/company/team/${row.id}`,
  },
  tasks: {
    title: "Tasks",
    path: "/tasks",
    key: "tasks",
    fields: [
      field("title", "Title"),
      field("description", "Description", "textarea", false),
      select("priority", "Priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]),
      field("dueDate", "Due date", "date", false),
      {
        ...related(
          "assigneeStaffAssignmentIds",
          "Assignees",
          "/team-members",
          "teamMembers",
          false,
        ),
        multiple: true,
      },
    ],
    columns: [
      ["title", "Title"],
      ["priority", "Priority"],
      ["dueDate", "Due"],
      ["status", "Status"],
    ],
    href: (row) => `/company/tasks/${row.id}`,
  },
  time: {
    title: "Time-entry review",
    path: "/time-entries",
    key: "timeEntries",
    columns: [
      ["staffAssignment.jobTitle", "Assignment"],
      ["workDate", "Work date"],
      ["ordinaryMinutes", "Regular minutes"],
      ["overtimeMinutes", "Overtime minutes"],
      ["description", "Work note"],
      ["status", "Status"],
    ],
    actions: [
      {
        label: "Approve",
        suffix: "/decision",
        body: { decision: "APPROVE" },
        states: ["SUBMITTED"],
        confirm: true,
      },
      {
        label: "Reject",
        suffix: "/decision",
        body: {
          decision: "REJECT",
          reason: "Returned for correction by the company reviewer.",
        },
        states: ["SUBMITTED"],
        confirm: true,
      },
    ],
  },
  performance: {
    href: (row) => `/company/performance/periods/${row.id}`,
    title: "Performance periods",
    path: "/performance/periods",
    key: "periods",
    fields: [field("name", "Name"), ...dates],
    columns: [
      ["name", "Name"],
      ["startDate", "Start"],
      ["endDate", "End"],
      ["status", "Status"],
    ],
    edit: true,
    actions: [
      {
        label: "Open",
        suffix: "/status",
        body: { status: "OPEN" },
        states: ["DRAFT"],
      },
      {
        label: "Close",
        suffix: "/status",
        body: { status: "CLOSED" },
        states: ["OPEN", "IN_REVIEW"],
        confirm: true,
      },
    ],
  },
  "compensation/agreements": {
    title: "Pay agreements",
    path: "/compensation/agreements",
    key: "agreements",
    fields: [
      { ...staff, immutable: true },
      {
        ...select("basis", "Pay basis", [
          "HOURLY",
          "DAILY",
          "WEEKLY",
          "MONTHLY",
          "ANNUAL",
        ]),
        immutable: true,
      },
      field("rateAmount", "Rate amount", "number"),
      {
        ...field("currency", "Currency"),
        immutable: true,
        defaultValue: "USD",
      },
      field("effectiveFrom", "Effective from", "date"),
    ],
    columns: [
      ["staffAssignment.jobTitle", "Assignment"],
      ["rateAmount", "Rate"],
      ["currency", "Currency"],
      ["basis", "Basis"],
      ["status", "Status"],
    ],
    edit: true,
    actions: [
      {
        label: "Activate",
        suffix: "/status",
        body: { status: "ACTIVE" },
        states: ["DRAFT", "SUSPENDED"],
      },
      {
        label: "End agreement",
        suffix: "/status",
        body: { status: "ENDED" },
        states: ["ACTIVE", "SUSPENDED"],
        confirm: true,
      },
    ],
  },
  "compensation/payroll": {
    title: "Payroll periods",
    path: "/payroll",
    key: "payrollPeriods",
    fields: [
      field("name", "Name"),
      ...dates,
      { ...field("currency", "Currency"), defaultValue: "USD" },
    ],
    columns: [
      ["name", "Name"],
      ["startDate", "Start"],
      ["endDate", "End"],
      ["currency", "Currency"],
      ["status", "Status"],
    ],
    actions: [
      {
        label: "Calculate",
        suffix: "/calculate",
        states: ["DRAFT", "CALCULATED"],
      },
      { label: "Submit", suffix: "/submit", states: ["CALCULATED"] },
      {
        label: "Approve",
        suffix: "/approve",
        states: ["PENDING_APPROVAL"],
        confirm: true,
      },
      { label: "Lock", suffix: "/lock", states: ["APPROVED"], confirm: true },
    ],
  },
  "compensation/payments": {
    title: "External payment records",
    description:
      "Record payments made outside Oreno. These actions do not transfer money.",
    path: "/payments",
    key: "payments",
    fields: [
      { ...staff, required: false },
      related(
        "payrollPeriodId",
        "Payroll period",
        "/payroll",
        "payrollPeriods",
        false,
      ),
      field("methodDescription", "Payment method"),
      field("externalReference", "External reference", "text", false),
      field("amount", "Amount", "number"),
      { ...field("currency", "Currency"), defaultValue: "USD" },
      field("paidAt", "Payment date", "date", false),
    ],
    columns: [
      ["amount", "Amount"],
      ["currency", "Currency"],
      ["methodDescription", "Method"],
      ["externalReference", "Reference"],
      ["status", "Status"],
    ],
    actions: [
      {
        label: "Mark paid",
        suffix: "/status",
        body: { status: "PAID" },
        states: ["PENDING", "AUTHORISED", "PARTIALLY_PAID"],
        confirm: true,
      },
      {
        label: "Reconcile",
        suffix: "/status",
        body: { status: "RECONCILED" },
        states: ["PAID"],
        confirm: true,
      },
    ],
  },
  placements: {
    title: "Placements",
    description:
      "Accepting an offer creates the placement and staff assignment automatically.",
    path: "/placements",
    key: "placements",
    columns: [
      ["reference", "Reference"],
      ["title", "Role"],
      ["startDate", "Start"],
      ["status", "Status"],
    ],
    actions: [
      {
        label: "Activate",
        suffix: "/status",
        body: { status: "ACTIVE" },
        states: ["PENDING", "SUSPENDED"],
      },
      {
        label: "Suspend",
        suffix: "/status",
        body: { status: "SUSPENDED" },
        states: ["ACTIVE"],
        confirm: true,
      },
    ],
    href: (row) => `/company/replacements/new?placement=${row.id}`,
  },
  replacements: {
    title: "Replacement requests",
    path: "/replacements",
    key: "replacements",
    fields: [
      related("placementId", "Placement", "/placements", "placements"),
      field("reason", "Reason (at least 10 characters)", "textarea"),
      select("reasonCategory", "Category", [
        "ROLE_FIT",
        "AVAILABILITY",
        "OTHER",
      ]),
    ],
    columns: [
      ["reason", "Reason"],
      ["status", "Status"],
      ["createdAt", "Requested"],
    ],
  },
  shortlists: {
    title: "Shortlists",
    path: "/shortlists",
    key: "shortlists",
    fields: [
      ...nameDescription,
      related("jobId", "Job", "/jobs", "jobs", false),
    ],
    columns: [
      ["name", "Name"],
      ["description", "Description"],
      ["job.title", "Job"],
    ],
    edit: true,
    href: (row) => `/company/shortlists/${row.id}`,
  },
};
const profileSources: Record<string, string> = {
  experience: "experiences",
  education: "education",
  certifications: "certifications",
  portfolio: "portfolioItems",
  skills: "skills",
};
export const profileResources: Record<string, Field[]> = {
  experience: [
    field("title", "Role"),
    field("company", "Company"),
    field("startDate", "Start date", "date"),
    field("endDate", "End date", "date", false),
    field("description", "Description", "textarea", false),
  ],
  education: [
    field("institution", "Institution"),
    field("degree", "Degree", "text", false),
    field("fieldOfStudy", "Field of study", "text", false),
    field("startDate", "Start date", "date", false),
    field("endDate", "End date", "date", false),
  ],
  certifications: [
    field("name", "Certification"),
    field("issuer", "Issuer"),
    field("credentialUrl", "Credential URL", "url", false),
    field("issuedAt", "Issued date", "date", false),
    field("expiresAt", "Expiry date", "date", false),
  ],
  portfolio: [
    field("title", "Title"),
    field("url", "Project URL", "url"),
    field("description", "Description", "textarea", false),
    field("category", "Category", "text", false),
  ],
  skills: [
    {
      ...related("skillId", "Skill", "/talents/skills", "skills"),
      source: { scope: "account", path: "/talents/skills", key: "skills" },
      immutable: true,
    },
    select("proficiency", "Proficiency", [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ]),
    {
      ...field("yearsExperience", "Years of experience", "number", false),
      number: true,
      min: 0,
      max: 80,
    },
  ],
};
export function ProfileRecords({ section }: { section: string }) {
  return (
    <ResourceScreen
      scope="talent"
      config={{
        title: section[0].toUpperCase() + section.slice(1),
        path: `/${section}`,
        key: profileSources[section],
        readPath: "/profile",
        readKey: "profile",
        fields: profileResources[section],
        columns:
          section === "skills"
            ? [
                ["skill.name", "Skill"],
                ["proficiency", "Proficiency"],
              ]
            : profileResources[section]
                .filter((item) => item.type !== "textarea")
                .map((item) => [item.name, item.label]),
        edit: true,
        remove: true,
      }}
    />
  );
}

export function TalentTimesheets() {
  const config: ResourceConfig = {
    title: "Time entries",
    editStates: ["DRAFT", "REJECTED"],
    path: "/time-entries",
    key: "timeEntries",
    fields: [
      {
        ...related(
          "staffAssignmentId",
          "Assignment",
          "/workforce/assignments",
          "assignments",
        ),
        immutable: true,
      },
      related("taskId", "Task", "/tasks", "tasks", false),
      field("workDate", "Work date", "date"),
      {
        ...field("ordinaryMinutes", "Regular minutes", "number"),
        number: true,
        min: 1,
        max: 1440,
      },
      {
        ...field("overtimeMinutes", "Overtime minutes", "number", false),
        number: true,
        min: 0,
        max: 1440,
        defaultValue: "0",
      },
      field("description", "Work note", "textarea", false),
    ],
    columns: [
      ["workDate", "Work date"],
      ["ordinaryMinutes", "Regular minutes"],
      ["overtimeMinutes", "Overtime minutes"],
      ["status", "Status"],
    ],
    edit: true,
    actions: [
      {
        label: "Submit for approval",
        suffix: "/submit",
        states: ["DRAFT", "REJECTED", "CORRECTED"],
      },
    ],
  };
  return <ResourceScreen scope="talent" config={config} />;
}
export function TalentCompensationLive() {
  const resource = useResource("talent", "/compensation");
  const data = asRecord(resource.data.compensation);
  return (
    <ProductPage
      title="Your compensation"
      description="Your pay agreements and external payment records."
    >
      <ResourceState resource={resource}>
        {["agreements", "payments"].map((key) => (
          <section className="detail-card" key={key}>
            <h3>{key === "agreements" ? "Pay agreements" : "Payments"}</h3>
            {asArray(data[key])
              .map(asRecord)
              .map((row) => (
                <article key={value(row, "id")}>
                  <strong>{value(row, "organisation.name")}</strong>
                  <p>
                    {value(row, "currency")}{" "}
                    {value(row, "rateAmount") || value(row, "amount")}{" "}
                    {value(row, "basis")}
                  </p>
                  <StatusChip status={value(row, "status")} />
                  <p>{value(row, "externalReference")}</p>
                </article>
              ))}
            {asArray(data[key]).length === 0 && <p>No records yet.</p>}
          </section>
        ))}
      </ResourceState>
    </ProductPage>
  );
}
export function NotificationsLive({ scope }: { scope: Scope }) {
  const [page, setPage] = useState(1);
  const resource = useResource(
    "account",
    `/notifications?page=${page}&pageSize=50`,
  );
  const [error, setError] = useState("");
  async function read(id?: string) {
    try {
      await apiRequest(
        id
          ? `/api/v1/notifications/${id}/read`
          : "/api/v1/notifications/read-all",
        { method: "POST", body: {} },
      );
      invalidateLive("account:notifications");
      await resource.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not mark notifications read.",
      );
    }
  }
  return (
    <ProductPage
      title="Notifications"
      actions={
        <button type="button" onClick={() => void read()}>
          Mark all read
        </button>
      }
    >
      {error && <p role="alert">{error}</p>}
      <ResourceState resource={resource}>
        <div className="notification-list">
          {asArray(resource.data.notifications)
            .map(asRecord)
            .map((row) => (
              <article key={value(row, "id")}>
                <h3>{value(row, "title")}</h3>
                <p>{value(row, "body")}</p>
                {!row.readAt && (
                  <button
                    type="button"
                    onClick={() => void read(value(row, "id"))}
                  >
                    Mark read
                  </button>
                )}
                <Link
                  href={
                    value(row, "actionUrl").startsWith(`/${scope}/`)
                      ? value(row, "actionUrl")
                      : `/${scope}`
                  }
                >
                  Open
                </Link>
              </article>
            ))}
        </div>
        <div className="workspace-pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            disabled={asArray(resource.data.notifications).length < 50}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </ResourceState>
    </ProductPage>
  );
}
export function PreferencesLive() {
  const resource = useResource("account", "/notifications/preferences");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function change(eventKey: string, enabled: boolean) {
    setPending(true);
    setError("");
    try {
      await apiRequest("/api/v1/notifications/preferences", {
        method: "PUT",
        body: { eventKey, enabled },
      });
      await resource.reload();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save preference.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <ProductPage
      title="Notification preferences"
      description="Security notifications remain enabled."
    >
      {error && <p role="alert">{error}</p>}
      <ResourceState resource={resource}>
        {asArray(resource.data.preferences)
          .map(asRecord)
          .map((row) => (
            <label className="account-toggle" key={value(row, "eventKey")}>
              <input
                type="checkbox"
                disabled={pending}
                checked={row.enabled !== false}
                onChange={(event) =>
                  void change(value(row, "eventKey"), event.target.checked)
                }
              />
              {value(row, "eventKey").replaceAll("_", " ").replaceAll(".", " ")}
            </label>
          ))}
      </ResourceState>
    </ProductPage>
  );
}
