import { expect, test } from "@playwright/test";

test("agreement prompt is red, focuses on blocked OAuth signup, and clears on acceptance", async ({ page }) => {
  await page.route("**/api/v1/**", route => route.fulfill({ status: 401, json: { error: { code: "UNAUTHENTICATED", message: "Please sign in." } } }));
  for (const path of ["/company/signup", "/auth/talent-signup"]) {
    await page.goto(path);
    const prompt = page.locator(".auth-consent-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toHaveCSS("color", "rgb(180, 35, 24)");
    await page.getByRole("button", {name: "Sign up with Google"}).click();
    await expect(page.locator("input[data-terms-consent]")).toBeFocused();
    await page.locator("input[data-terms-consent]").check();
    await expect(prompt).toHaveCount(0);
  }
});

test("old catalogue browsing links lead into company hiring", async ({ page }) => {
  await page.route("**/api/v1/**", route => route.fulfill({ status: 401, json: { error: { code: "UNAUTHENTICATED", message: "Please sign in." } } }));
  await page.goto("/talent-catalogue");
  await expect(page).toHaveURL(/\/company\/signup$/);
  await expect(page.getByRole("heading", {name: "Sign Up"})).toBeVisible();
});

test("released candidate profile displays inside the company workspace with a contextual back link", async ({ page }) => {
  let withdrawn = false;
  const companyId = "11111111-1111-4111-8111-111111111111";
  const profileId = "22222222-2222-4222-8222-222222222222";
  await page.routeWebSocket("**/socket.io/**", socket => socket.close());
  await page.route("**/api/v1/**", route => {
    const path = new URL(route.request().url()).pathname;
    if (withdrawn && path.endsWith(profileId)) return route.fulfill({status: 404, json: {error: {code: "NOT_FOUND", message: "This candidate is no longer available."}}});
    const data = path.endsWith("/auth/me") ? {
      user: {id: "owner", email: "owner@example.test", firstName: "Owner", status: "ACTIVE", registrationIntent: "COMPANY_OWNER"},
      context: {organisationId: companyId, organisationRole: "COMPANY_OWNER", membershipStatus: "ACTIVE", permissions: ["talent:read"], platformRoles: [], mfaSatisfied: true},
    } : path.endsWith(profileId) ? {profile: {
      id: profileId, user: {firstName: "Ada", lastName: "Okafor"}, headline: "Product designer", bio: "Designing accessible products", yearsExperience: 5,
      skills: [{skill: {id: "design", name: "Product design"}}], experiences: [{id: "experience", title: "Designer", company: "Example team"}],
    }} : {notifications: [], organisation: {id: companyId, name: "Example company"}};
    return route.fulfill({json: {data}});
  });
  await page.goto(`/company/candidates/${profileId}?applicationId=application-a`);
  await expect(page.getByRole("heading", {name: "Ada Okafor"})).toBeVisible();
  await expect(page.getByText("Example team", {exact: true})).toBeVisible();
  await expect(page.getByRole("link", {name: "Back to applications"})).toHaveAttribute("href", "/company/applications/application-a");
  await expect(page.getByRole("link", {name: "Discover talent"})).toHaveCount(0);
  withdrawn = true;
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("oreno:api-error", {detail: {status: 503, message: "Refresh needed"}})));
  await page.getByRole("button", {name: "Refresh data", exact: true}).click();
  await expect(page.locator(".platform-content").getByText("This candidate is no longer available.").first()).toBeVisible();
  await expect(page.getByRole("heading", {name: "Ada Okafor"})).toHaveCount(0);
  await expect(page.getByText("Example team", {exact: true})).toHaveCount(0);
});
