import { expect, test } from "@playwright/test";
test.setTimeout(90_000);
for (const width of [390, 1366, 1440])
  for (const route of [
    "/company/login",
    "/company/signup",
    "/auth/talent-login",
    "/auth/talent-signup",
  ]) {
    test(`Figma authentication ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 1366 ? 768 : 1024 });
      await page.goto(route);
      await expect(page.locator(".auth-screen--figma")).toBeVisible();
      await expect(
        page.getByLabel("Email address", { exact: true }),
      ).toBeVisible();
      if (width === 1366) {
        await page.evaluate(() => document.fonts.ready);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(768);
      }
      const password = page.getByLabel("Password", { exact: true });
      await password.fill("test-password-only");
      await page
        .getByRole("button", { name: "Show password", exact: true })
        .click();
      await expect(password).toHaveAttribute("type", "text");
      await expect(page.locator(".oreno-logo__letter")).toHaveCount(4);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await password.evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        ),
      ).toBeGreaterThanOrEqual(16);
      if (width === 1440)
        for (const image of await page.locator(".auth-art img").all()) {
          await expect(image).toBeVisible();
          expect(
            await image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
          ).toBeGreaterThan(0);
        }
    });
  }
for (const role of ["company", "talent"] as const) {
  test(`${role} staged signup preserves credentials, terms and registration payload`, async ({
    page,
  }) => {
    const writes: Record<string, unknown>[] = [];
    await page.route("**/api/v1/**", (route) => {
      if (route.request().url().endsWith("/auth/register"))
        writes.push(route.request().postDataJSON());
      return route.fulfill({ json: { data: { nextStep: "VERIFY_EMAIL" } } });
    });
    await page.goto(
      role === "company" ? "/company/signup" : "/auth/talent-signup",
    );
    await page
      .getByLabel("Email address", { exact: true })
      .fill("new@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("TestOnlyPassword123!");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    expect(writes).toHaveLength(0);
    await page.getByLabel("First name", { exact: true }).fill("Ada");
    await page.getByLabel("Last name", { exact: true }).fill("Test");
    if (role === "company")
      await page
        .getByLabel("Company name", { exact: true })
        .fill("Example Ltd");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Sign up", exact: true }).click();
    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0]).toMatchObject({
      email: "new@example.test",
      password: "TestOnlyPassword123!",
      firstName: "Ada",
      lastName: "Test",
      acceptTerms: true,
      accountType: role === "company" ? "COMPANY_OWNER" : "TALENT",
    });
    if (role === "company") await expect(page).toHaveURL(/verify-email/);
    else
      await expect(
        page.getByRole("heading", { name: "Verify your email" }),
      ).toBeVisible();
  });
}
test("talent MFA retry retains credentials and remembered email never saves the password", async ({
  page,
}) => {
  const attempts: Record<string, unknown>[] = [];
  await page.route("**/api/v1/auth/login", (route) => {
    attempts.push(route.request().postDataJSON());
    return route.fulfill({
      status: 401,
      json: {
        error: { code: "TWO_FACTOR_REQUIRED", message: "Enter a code." },
      },
    });
  });
  await page.goto("/auth/talent-login");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("person@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("TestOnlyPassword123!");
  await page.getByLabel("Remember email").check();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByLabel("Two-factor code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect.poll(() => attempts.length).toBe(2);
  expect(attempts[1]).toMatchObject({
    email: "person@example.test",
    password: "TestOnlyPassword123!",
    twoFactorCode: "123456",
  });
  expect(
    await page.evaluate(() => localStorage.getItem("oreno:remembered-email")),
  ).toBe("person@example.test");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "TestOnlyPassword123!",
  );
});
