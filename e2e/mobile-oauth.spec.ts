import { expect, test } from "@playwright/test";

test.describe("mobile OAuth return", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("unknown Google account stays responsive and offers explicit signup", async ({ page }) => {
    await page.goto("/auth/oauth-callback?oauth=failed&oauthProvider=google&oauthReason=account_not_found");
    await expect(page.getByRole("heading", { name: "No Oreno account was found" })).toBeVisible();
    await expect(page.getByText(/agree to the Terms and Privacy Policy/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Create a talent account with Google/i })).toBeDisabled();
    const width = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
  });

  test("homepage company navigation does not expose talent auth in its menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: "Open company account menu" }).click();
    await expect(page.getByRole("menuitem", { name: /Start hiring/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Company sign in/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Join as talent|Talent login/i })).toHaveCount(0);
  });
});
