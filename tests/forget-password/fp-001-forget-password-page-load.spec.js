// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Forget Password', () => {
  test('FP-001 Forget password link opens the form @forget-password @smoke @positive', async ({ page }) => {
    // 1. Open /app/sign-in and click "Forget password"
    const loginPage = await new LoginPage(page).goto()
    const forgetPasswordPage = await loginPage.clickForgetPassword()
    await forgetPasswordPage.verifyPageLoaded()
    await expect(page).toHaveURL(/\/app\/forget-password$/)
    await expect(forgetPasswordPage.heading).toBeVisible()
    await expect(forgetPasswordPage.emailInput).toBeVisible()
    await expect(forgetPasswordPage.emailInput).toHaveValue('')
    await expect(forgetPasswordPage.emailInput).toHaveAttribute('type', 'email')
    await expect(forgetPasswordPage.sendEmailButton).toBeVisible()
    expect(await forgetPasswordPage.isSendEmailEnabled()).toBe(true)
    await expect(page.getByRole('link', { name: /back|log ?in|sign ?in/i })).toHaveCount(0)
    await expect(forgetPasswordPage.termsLink).toBeVisible()
    await expect(forgetPasswordPage.privacyLink).toBeVisible()

    // 2. Press browser Back
    await page.goBack()
    await loginPage.verifyPageLoaded()
    await expect(page).toHaveURL(/\/app\/sign-in$/)
    await expect(loginPage.emailInput).toBeVisible()

    // 3. Open /app/forget-password directly
    await forgetPasswordPage.goto()
    await forgetPasswordPage.verifyPageLoaded()
    await expect(forgetPasswordPage.heading).toBeVisible()
    await expect(forgetPasswordPage.emailInput).toHaveValue('')
    await expect(forgetPasswordPage.emailInput).toHaveAttribute('type', 'email')
    expect(await forgetPasswordPage.isSendEmailEnabled()).toBe(true)
    await expect(forgetPasswordPage.termsLink).toBeVisible()
    await expect(forgetPasswordPage.privacyLink).toBeVisible()
  })
})
