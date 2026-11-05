import { expect, test, type Page } from "@playwright/test";
test.setTimeout(60000);
const session = {
  user: {
    id: "user-a",
    email: "talent@example.test",
    firstName: "Ada",
    lastName: "Test",
    status: "ACTIVE",
    registrationIntent: "TALENT",
  },
  context: {
    organisationId: null,
    organisationRole: null,
    mfaSatisfied: true,
    permissions: [],
    platformRoles: [],
  },
};
async function stub(page: Page) {
  await page.routeWebSocket("**/socket.io/**", (socket) => socket.close());
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/auth/me")
      ? session
      : path.endsWith("/saved-jobs")
        ? { savedJobs: [] }
        : path.endsWith("/conversations")
          ? { conversations: [] }
          : path.endsWith("/contacts")
            ? { contacts: [] }
            : {
                jobs: [],
                applications: [],
                offers: [],
                interviews: [],
                entries: [],
                notifications: [],
              };
    return route.fulfill({ json: { data } });
  });
}
test("chat contacts distinguish loading, error, retry and a successful empty result", async ({
  page,
}) => {
  await stub(page);
  let requests = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/conversations/contacts", async (route) => {
    requests++;
    if (requests === 1) {
      await held;
      return route.fulfill({
        status: 500,
        json: {
          error: {
            code: "INTERNAL_ERROR",
            message: "Contacts could not be loaded.",
          },
        },
      });
    }
    return route.fulfill({ json: { data: { contacts: [] } } });
  });
  await page.goto("/talent/messages");
  await page
    .locator(".messages-workspace__empty")
    .getByRole("button", { name: "New conversation" })
    .click();
  const modal = page.getByRole("dialog", { name: "New conversation" });
  await expect(modal.getByText("Loading available contacts…")).toBeVisible();
  await expect(modal.getByText(/No eligible contacts/)).toHaveCount(0);
  release();
  await expect(
    modal.getByRole("button", { name: "Retry contacts" }),
  ).toBeVisible();
  await expect(modal.getByText(/No eligible contacts/)).toHaveCount(0);
  await expect(
    modal.getByRole("button", { name: "Start conversation" }),
  ).toBeDisabled();
  await modal.getByRole("button", { name: "Retry contacts" }).click();
  await expect(modal.getByText(/No eligible contacts/)).toBeVisible();
  await expect(modal.getByRole("alert")).toHaveCount(0);
});
test("chat populated contacts enable only a selected conversation", async ({
  page,
}) => {
  await stub(page);
  await page.route("**/conversations/contacts", (route) =>
    route.fulfill({
      json: {
        data: {
          contacts: [
            {
              id: "contact",
              firstName: "Eligible",
              lastName: "Person",
              groupEligible: false,
            },
          ],
        },
      },
    }),
  );
  await page.goto("/talent/messages");
  await page
    .locator(".messages-workspace__empty")
    .getByRole("button", { name: "New conversation" })
    .click();
  const modal = page.getByRole("dialog", { name: "New conversation" });
  await expect(
    modal.getByRole("button", { name: "Start conversation" }),
  ).toBeDisabled();
  await modal.getByRole("radio").check();
  await expect(
    modal.getByRole("button", { name: "Start conversation" }),
  ).toBeEnabled();
});
for (const width of [390, 1440])
  test(`new-conversation icon stays centred at ${width}px`, async ({
    page,
  }) => {
    await stub(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/talent/messages");
    const button =
      width < 768
        ? page
            .locator(".messages-workspace__sidebar")
            .getByRole("button", { name: "Start conversation" })
        : page.locator(".messages-workspace__empty button");
    await expect(button).toBeVisible();
    const sizes = await button.evaluate((el) => {
      const b = el.getBoundingClientRect();
      const s = el.querySelector("svg")!.getBoundingClientRect();
      return {
        dy: Math.abs(s.top + s.height / 2 - (b.top + b.height / 2)),
        display: getComputedStyle(el).display,
        height: b.height,
      };
    });
    expect(["inline-flex", "flex", "grid", "inline-grid"]).toContain(
      sizes.display,
    );
    expect(sizes.dy).toBeLessThan(2);
    expect(sizes.height).toBeGreaterThanOrEqual(44);
  });
test("jobs listing alone exposes talent account navigation", async ({
  page,
}) => {
  await stub(page);
  await page.goto("/jobs");
  await page.locator('header button[aria-haspopup="menu"]').hover();
  await expect(
    page.getByRole("menuitem", { name: /Talent login/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /Company sign in/ }),
  ).toHaveCount(0);
  await page.goto("/");
  await page.locator(".navbar__hiring-trigger").hover();
  await expect(
    page.getByRole("menuitem", { name: /Company sign in/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /Talent login/ }),
  ).toHaveCount(0);
});
for (const provider of ["Google", "LinkedIn"])
  test(`company signup starts ${provider} with explicit consent`, async ({
    page,
  }) => {
    await stub(page);
    let start: URL | undefined;
    await page.route("**/auth/oauth/*/start?*", (route) => {
      start = new URL(route.request().url());
      return route.fulfill({
        json: {
          data: {
            authorizationUrl: new URL(
              "/company/signup?provider-started=true",
              page.url(),
            ).toString(),
          },
        },
      });
    });
    await page.goto("/company/signup");
    await page
      .getByRole("button", { name: `Sign up with ${provider}` })
      .click();
    expect(start).toBeUndefined();
    await expect(
      page.locator(".auth-screen--figma").getByRole("alert"),
    ).toContainText(/terms/i);
    await page.getByRole("checkbox").first().check();
    await page
      .getByRole("button", { name: `Sign up with ${provider}` })
      .click();
    await expect(page).toHaveURL(/provider-started/);
    expect(start?.searchParams.get("mode")).toBe("company_signup");
    expect(start?.searchParams.get("audience")).toBe("company");
    expect(start?.searchParams.get("acceptTerms")).toBe("true");
  });
test("company login without a workspace offers signup instead of a 403", async ({
  page,
}) => {
  await stub(page);
  await page.goto(
    "/auth/oauth-callback?oauth=failed&oauthAudience=company&oauthReason=company_account_required&oauthProvider=google",
  );
  await expect(
    page.getByText("Create your company account", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create company account with Google" }),
  ).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(
    page.getByRole("button", { name: "Create company account with Google" }),
  ).toBeEnabled();
  await expect(page.getByText("403", { exact: true })).toHaveCount(0);
});
test("blocked company access cannot be changed into signup", async ({
  page,
}) => {
  await stub(page);
  await page.goto(
    "/auth/oauth-callback?oauth=failed&oauthAudience=company&oauthReason=company_access_unavailable&oauthProvider=google",
  );
  await expect(
    page.getByText(/Contact your company administrator/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Create company account/ }),
  ).toHaveCount(0);
});
test("company onboarding sends details, consent, MFA and cookie-bound CSRF", async ({
  page,
}) => {
  await stub(page);
  let submitted: Record<string, unknown> | undefined;
  let csrf: string | undefined;
  await page.route("**/auth/oauth/company-registration", (route) => {
    if (route.request().method() === "POST") {
      submitted = route.request().postDataJSON();
      csrf = route.request().headers()["x-oreno-registration-csrf"];
      return route.fulfill({
        status: 409,
        json: { error: { code: "TEST_STOP", message: "Submission checked." } },
      });
    }
    return route.fulfill({
      json: {
        data: {
          email: "verified@example.test",
          requiresTwoFactor: true,
          csrfToken: "signup-csrf",
          displayName: "Ada",
          expiresAt: "2099-01-01",
        },
      },
    });
  });
  await page.goto(
    "/auth/oauth-callback?companySignup=pending&oauthAudience=company",
  );
  await expect(
    page.getByText("Verified email: verified@example.test"),
  ).toBeVisible();
  await page.getByLabel("First name", { exact: true }).fill("Ada");
  await page.getByLabel("Last name", { exact: true }).fill("Test");
  await page.getByLabel("Company name", { exact: true }).fill("Example");
  await page.getByLabel("Two-factor code").fill("123456");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create company account", exact: true })
    .click();
  await expect(
    page.locator(".auth-screen--figma").getByRole("alert"),
  ).toContainText("Submission checked.");
  expect(csrf).toBe("signup-csrf");
  expect(submitted).toMatchObject({
    firstName: "Ada",
    organisationName: "Example",
    acceptTerms: true,
    twoFactorCode: "123456",
  });
});
test("dashboard sidebar survives route changes and revisits use cached content", async ({
  page,
}) => {
  await stub(page);
  await page.goto("/talent/saved-jobs");
  await expect(page.getByText(/No saved jobs/i)).toBeVisible();
  await page
    .locator(".platform-sidebar")
    .evaluate((el) => el.setAttribute("data-persistent-test", "yes"));
  await page
    .getByRole("navigation", { name: "talent navigation" })
    .getByRole("link", { name: "Find jobs", exact: true })
    .click();
  await expect(page).toHaveURL(/talent\/jobs/);
  await expect(page.locator(".platform-sidebar")).toHaveAttribute(
    "data-persistent-test",
    "yes",
  );
  await page
    .getByRole("navigation", { name: "talent navigation" })
    .getByRole("link", { name: "Saved jobs", exact: true })
    .click();
  await expect(page.getByText(/No saved jobs/i)).toBeVisible();
  await expect(page.locator(".platform-sidebar")).toHaveAttribute(
    "data-persistent-test",
    "yes",
  );
  await expect(page.locator(".workspace-skeleton")).toHaveCount(0);
});
for (const url of ["/company/login", "/jobs", "/talent/messages"])
  test(`entire wordmark moves on hover at ${url}`, async ({ page }) => {
    await stub(page);
    await page.goto(url);
    const logo = page.locator(".oreno-logo").first();
    await expect(logo).toBeVisible();
    await expect(logo.locator(".oreno-logo__letter")).toHaveCount(4);
    await logo.hover();
    await expect
      .poll(() => logo.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe("none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const animations = await logo
      .locator(".oreno-logo__letter")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).animationName),
      );
    expect(animations.every((name) => name === "none")).toBe(true);
  });

test('an access-denied refresh removes previously cached private content', async ({page})=>{
 await stub(page);let denied=false;
 await page.route('**/api/v1/talents/me/saved-jobs*',route=>denied?route.fulfill({status:403,json:{error:{code:'RESOURCE_ACCESS_DENIED',message:'This workspace access has ended.'}}}):route.fulfill({json:{data:{savedJobs:[{jobId:'job-a',job:{id:'job-a',title:'Previously visible role',status:'PUBLISHED',organisation:{name:'Example'}}}]}}}));
 await page.goto('/talent/saved-jobs');await expect(page.getByText('Previously visible role')).toBeVisible();denied=true;
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('oreno:api-error',{detail:{status:503,message:'Refresh needed'}})));
 await page.getByRole('button',{name:'Refresh data',exact:true}).click();
 await expect(page.locator('.platform-content').getByText('This workspace access has ended.').first()).toBeVisible();await expect(page.getByText('Previously visible role')).toHaveCount(0);
});

