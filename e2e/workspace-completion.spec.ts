import { expect, test, type Page, type WebSocketRoute } from "@playwright/test";

test.setTimeout(90_000);
const organisationId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const jobId = "33333333-3333-4333-8333-333333333333";
const date = "2026-10-29T10:00:00.000Z";
type Row = Record<string, unknown>;
async function workspace(page: Page, role: "talent" | "company" = "talent") {
  const store = {
    authCalls: 0,
    authenticated: true,
    rejectWrites: false,
    writes: [] as Array<{
      path: string;
      method: string;
      body: Row;
      csrf: string | undefined;
    }>,
    saved: false,
    profile: {
      id: userId,
      updatedAt: date,
      headline: "Engineer",
      bio: "Build things",
      timeZone: "Africa/Lagos",
      experiences: [],
      education: [],
      certifications: [],
      portfolioItems: [],
      skills: [],
    } as Row,
    departments: [] as Row[],
    entries: [] as Row[],
  };
  await page
    .context()
    .addCookies([
      { name: "oreno_csrf", value: "test-csrf", url: test.info().project.use.baseURL ?? "http://127.0.0.1:3000" },
    ]);
  await page.route("**/api/v1/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname,
      method = req.method();
    const body = method === "GET" ? {} : ((req.postDataJSON() ?? {}) as Row);
    const reply = (data: unknown, status = 200) =>
      route.fulfill({ status, json: { data } });
    if (path.endsWith("/auth/me")) {
      store.authCalls++;
      return store.authenticated
        ? reply({
            user: {
              id: userId,
              email: "talent@example.test",
              firstName: "Ada",
              lastName: "Okafor",
              status: "ACTIVE",
              registrationIntent:
                role === "talent" ? "TALENT" : "COMPANY_OWNER",
              twoFactorEnabled: false,
            },
            context: {
              organisationId: role === "company" ? organisationId : null,
              organisationRole: role === "company" ? "COMPANY_OWNER" : null,
              isPlatformAdmin: false,
              platformRoles: [],
              permissions: [],
              mfaSatisfied: true,
              sessionExpiresAt: "2099-01-01T00:00:00Z",
            },
          })
        : route.fulfill({
            status: 401,
            json: {
              error: {
                code: "SESSION_EXPIRED",
                message: "Please sign in again.",
              },
            },
          });
    }
    if (method !== "GET") {
      store.writes.push({
        path,
        method,
        body,
        csrf: req.headers()["x-oreno-csrf"],
      });
      if (store.rejectWrites)
        return route.fulfill({
          status: 403,
          json: {
            error: {
              code: "RESOURCE_ACCESS_DENIED",
              message: "You do not have permission to make this change.",
            },
          },
        });
    }
    if (path.endsWith("/saved-jobs"))
      return reply({
        savedJobs: store.saved
          ? [
              {
                jobId,
                job: {
                  title: "Engineer",
                  status: "PUBLISHED",
                  organisation: { name: "Example Ltd" },
                },
              },
            ]
          : [],
      });
    if (path.includes("/saved-jobs/")) {
      store.saved = method === "PUT";
      return method === "DELETE"
        ? route.fulfill({ status: 204 })
        : reply({ savedJob: { jobId } });
    }
    if (path === "/api/v1/public/jobs")
      return reply({
        jobs: [
          {
            id: jobId,
            title: "Engineer",
            organisation: { name: "Example Ltd" },
            status: "PUBLISHED",
            skills: [],
            employmentType: "FULL_TIME",
            workArrangement: "REMOTE",
          },
        ],
      });
    if (path.endsWith("/me/profile")) {
      if (method === "PATCH") Object.assign(store.profile, body);
      return reply({ profile: store.profile });
    }
    if (path.endsWith("/workforce/assignments"))
      return reply({
        assignments: [{ id: jobId, jobTitle: "Engineer", status: "ACTIVE" }],
      });
    if (path.endsWith("/tasks")) return reply({ tasks: [] });
    if (path.endsWith("/time-entries")) {
      if (method === "POST")
        store.entries.push({
          id: jobId,
          status: "DRAFT",
          updatedAt: date,
          ...body,
        });
      return reply(
        method === "GET"
          ? { timeEntries: store.entries }
          : { timeEntry: store.entries.at(-1) },
      );
    }
    if (path.endsWith("/submit")) {
      store.entries[0].status = "SUBMITTED";
      return reply({ timeEntry: store.entries[0] });
    }
    if (path.endsWith("/departments")) {
      if (method === "POST")
        store.departments.push({ id: jobId, updatedAt: date, ...body });
      return reply(
        method === "GET"
          ? { departments: store.departments }
          : { department: store.departments.at(-1) },
      );
    }
    if (path.endsWith("/notifications/preferences"))
      return reply({ preferences: [] });
    if (path.endsWith("/notifications")) return reply({ notifications: [] });
    return reply({
      applications: [],
      interviews: [],
      offers: [],
      sessions: [],
      reviews: [],
      agreements: [],
      payments: [],
      compensation: { agreements: [], payments: [] },
      account: {},
      profile: store.profile,
    });
  });
  return store;
}

test("saved jobs persist through refresh and never claim success on a forbidden write", async ({
  page,
}) => {
  const store = await workspace(page);
  await page.goto("/talent/jobs");
  await page.getByRole("button", { name: "Save job", exact: true }).click();
  expect(store.saved).toBe(true);
  await page.goto("/talent/saved-jobs");
  await expect(
    page.getByRole("heading", { name: "Engineer", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Engineer", exact: true }),
  ).toBeVisible();
  store.rejectWrites = true;
  await page.getByRole("button", { name: "Remove saved job" }).click();
  await expect(page.getByRole("alert").first()).toContainText("permission");
  expect(store.saved).toBe(true);
  store.rejectWrites = false;
  await page.getByRole("button", { name: "Remove saved job" }).click();
  await expect(
    page.getByText("You have no saved jobs yet.", { exact: false }),
  ).toBeVisible();
  expect(store.writes[0].csrf).toBe("test-csrf");
});
test("profile edits persist and use the server revision", async ({ page }) => {
  const store = await workspace(page);
  await page.goto("/talent/profile");
  await page.getByLabel("Professional headline").fill("Senior engineer");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(() => store.profile.headline).toBe("Senior engineer");
  await page.reload();
  await expect(page.getByLabel("Professional headline")).toHaveValue(
    "Senior engineer",
  );
  expect(store.writes[0].body.expectedUpdatedAt).toBe(date);
});
test("company department creation persists and displays permission failures", async ({
  page,
}) => {
  const store = await workspace(page, "company");
  await page.goto("/company/departments");
  await page.getByRole("button", { name: "Add departments" }).click();
  await page.getByLabel("Name", { exact: false }).fill("Engineering");
  store.rejectWrites = true;
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("alert").first()).toContainText("permission");
  expect(store.departments).toHaveLength(0);
  store.rejectWrites = false;
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Engineering", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Engineering", exact: true }),
  ).toBeVisible();
  expect(store.writes.at(-1)?.path).toBe(
    `/api/v1/organisations/${organisationId}/departments`,
  );
});
test("time entry is persisted and submitted, then cannot be edited", async ({
  page,
}) => {
  const store = await workspace(page);
  await page.goto("/talent/time");
  await page.getByRole("button", { name: "Add time entries" }).click();
  await page.getByLabel("Assignment").selectOption(jobId);
  await page.getByLabel("Work date").fill("2026-10-29");
  await page.getByLabel("Regular minutes").fill("240");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "DRAFT", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await expect(
    page.getByRole("cell", { name: "SUBMITTED", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "240", exact: true }),
  ).toBeVisible();
  expect(store.entries[0].ordinaryMinutes).toBe(240);
});
test("session survives navigation without another account guard and expiry redirects", async ({
  page,
}) => {
  const store = await workspace(page);
  await page.goto("/talent/saved-jobs");
  await expect(
    page.getByRole("heading", { name: "Saved jobs", exact: true }).last(),
  ).toBeVisible();
  await expect(page.getByText(/No saved jobs/i)).toBeVisible();
  const calls = store.authCalls;
  await page
    .getByRole("navigation", { name: "talent navigation" })
    .getByRole("link", { name: "Time entries" })
    .click();
  await expect(
    page.getByRole("button", { name: "Add time entries" }),
  ).toBeVisible();
  expect(store.authCalls).toBe(calls);
  await expect(page.getByText(/Checking your.*account/)).toHaveCount(0);
  store.authenticated = false;
  await page.evaluate(() =>
    window.dispatchEvent(new Event("oreno:session-expired")),
  );
  await expect(page).toHaveURL(/auth\/talent-login/);
});
for (const width of [360, 390, 768, 1024, 1440])
  test(`workspace navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await workspace(page);
    await page.goto("/talent/profile");
    await expect(page.getByLabel("Professional headline")).toBeVisible();
    const trigger = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    if (await trigger.isVisible()) {
      await trigger.click();
      const drawer = page.getByRole("dialog", { name: "Workspace navigation" });
      await expect(
        drawer.getByRole("link", { name: "Professional profile" }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.body.style.overflow)).toBe(
        "hidden",
      );
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

test("chat in two sessions handles typing, delivery, editing, deletion, pagination and retries", async ({
  browser,
}) => {
  const a = await browser.newContext(),
    b = await browser.newContext();
  const sender = await a.newPage(),
    recipient = await b.newPage();
  try {
    await workspace(sender, "company");
    await workspace(recipient);
    const sockets: WebSocketRoute[] = [];
    const messages: Row[] = [];
    let failSend = false;
    let previousKey = "";
    const conversationId = organisationId;
    for (const [page, mine, other] of [
      [sender, userId, jobId],
      [recipient, jobId, userId],
    ] as const) {
      await page.routeWebSocket("**/socket.io/**", (socket) => {
        sockets.push(socket);
        socket.send(
          "0" +
            JSON.stringify({
              sid: mine,
              upgrades: [],
              pingInterval: 60000,
              pingTimeout: 60000,
            }),
        );
        socket.onMessage((raw) => {
          const message = String(raw);
          if (message === "40")
            socket.send("40" + JSON.stringify({ sid: mine }));
          const match = message.match(/^42(\d*)(\[.*)$/);
          if (match) {
            const [event, payload] = JSON.parse(match[2]);
            if (event === "typing:start" || event === "typing:stop")
              sockets
                .filter((item) => item !== socket)
                .forEach((item) =>
                  item.send(
                    "42" +
                      JSON.stringify([event, { ...payload, userId: mine }]),
                  ),
                );
            if (match[1]) socket.send("43" + match[1] + '[{"ok":true}]');
          }
        });
      });
      await page.route("**/api/v1/conversations**", async (route) => {
        const req = route.request(),
          url = new URL(req.url()),
          path = url.pathname;
        const reply = (data: unknown, meta = {}) =>
          route.fulfill({ json: { data, meta } });
        if (path.endsWith("/contacts"))
          return reply({
            contacts: [
              {
                id: other,
                firstName: other === userId ? "Ada" : "Ben",
                lastName: "Contact",
                groupEligible: true,
              },
            ],
          });
        if (path.endsWith("/read")) {
          sockets.forEach((socket) =>
            socket.send(
              "42" +
                JSON.stringify([
                  "message:read",
                  {
                    conversationId,
                    userId: mine,
                    readAt: new Date().toISOString(),
                  },
                ]),
            ),
          );
          return reply({});
        }
        if (path.endsWith("/archive") || path.endsWith("/leave"))
          return reply({});
        if (path.endsWith("/messages")) {
          if (req.method() === "GET")
            return reply(
              { messages: [...messages].reverse() },
              url.searchParams.has("cursor")
                ? {}
                : { nextCursor: messages.length ? "older" : null },
            );
          const key = req.headers()["idempotency-key"] ?? "";
          if (failSend) {
            previousKey = key;
            return route.fulfill({
              status: 503,
              json: { error: { code: "UNAVAILABLE", message: "Try again." } },
            });
          }
          if (previousKey) expect(key).toBe(previousKey);
          const message = {
            id: crypto.randomUUID(),
            conversationId,
            senderId: mine,
            sender: {
              firstName: mine === userId ? "Ada" : "Ben",
              lastName: "Contact",
            },
            body: req.postDataJSON().body,
            createdAt: new Date().toISOString(),
            updatedAt: date,
            attachments: [],
            receipts: [{ userId: other, deliveredAt: date }],
          };
          messages.push(message);
          sockets.forEach((socket) =>
            socket.send("42" + JSON.stringify(["message:new", message])),
          );
          return reply({ message });
        }
        if (path.includes("/messages/")) {
          const row = messages.find(
            (item) => item.id === path.split("/").at(-1),
          )!;
          if (req.method() === "PATCH") {
            row.body = req.postDataJSON().body;
            row.editedAt = date;
          } else row.deletedAt = date;
          sockets.forEach((socket) =>
            socket.send(
              "42" +
                JSON.stringify([
                  req.method() === "PATCH"
                    ? "message:updated"
                    : "message:deleted",
                  { message: row },
                ]),
            ),
          );
          return reply({ message: row });
        }
        return reply({
          conversations: [
            {
              id: conversationId,
              type: "GROUP",
              title: "Project team",
              members: [
                {
                  role: "OWNER",
                  user: { id: userId, firstName: "Ada", lastName: "Contact" },
                  unreadCount: 0,
                },
                {
                  role: "MEMBER",
                  user: { id: jobId, firstName: "Ben", lastName: "Contact" },
                  unreadCount: 1,
                },
              ],
              messages: messages.slice(-1),
              updatedAt: date,
            },
          ],
        });
      });
      // Override only this session's identity; all other requests remain intercepted.
      if (mine === jobId)
        await page.route("**/api/v1/auth/me", (route) =>
          route.fulfill({
            json: {
              data: {
                user: {
                  id: mine,
                  status: "ACTIVE",
                  registrationIntent: "TALENT",
                  firstName: "Ben",
                  lastName: "Contact",
                },
                context: { mfaSatisfied: true, platformRoles: [] },
              },
            },
          }),
        );
      await page.goto(
        mine === userId ? "/company/messages" : "/talent/messages",
      );
      await page.getByRole("button", { name: /Project team/ }).click();
      await expect(page.getByText("Live", { exact: true })).toBeVisible();
    }
    await sender
      .getByRole("textbox", { name: "Message", exact: true })
      .fill("Hello team");
    await expect(recipient.getByText("Ada Contact is typing…")).toBeVisible();
    await sender.getByRole("button", { name: "Send message" }).click();
    await expect(recipient.locator(".message-bubble.is-theirs")).toContainText(
      "Hello team",
    );
    await expect(sender.locator(".message-bubble.is-mine")).toHaveCount(1);
    await sender.getByRole("button", { name: "Edit message" }).click();
    await sender.locator(".message-bubble textarea").fill("Edited greeting");
    await sender.getByRole("button", { name: "Save", exact: true }).click();
    await expect(recipient.locator(".message-bubble")).toContainText(
      "Edited greeting",
    );
    await recipient.reload();
    await recipient.getByRole("button", { name: /Project team/ }).click();
    await recipient
      .getByRole("button", { name: "Load older messages" })
      .click();
    await expect(recipient.locator(".message-bubble")).toHaveCount(1);
    failSend = true;
    await sender
      .getByRole("textbox", { name: "Message", exact: true })
      .fill("Retry me");
    await sender.getByRole("button", { name: "Send message" }).click();
    await expect(
      sender.getByRole("button", { name: "Retry", exact: true }),
    ).toBeVisible();
    failSend = false;
    await sender.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(recipient.locator(".message-bubble")).toHaveCount(2);
    sender.on("dialog", (dialog) => dialog.accept());
    await sender
      .getByRole("button", { name: "Delete message" })
      .first()
      .click();
    await expect(
      recipient.getByText("This message was deleted.", { exact: true }),
    ).toBeVisible();
  } finally {
    await a.close();
    await b.close();
  }
});
