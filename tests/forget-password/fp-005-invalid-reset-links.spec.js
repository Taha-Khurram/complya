// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { ForgetPasswordPage } = require('../../pages/forgetpasswordpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Forget Password', () => {
  test('FP-005 Invalid or missing reset code redirects to the forget-password page @forget-password @negative', async ({ page }) => {
    const forgetPasswordPage = await new ForgetPasswordPage(page).goto()

    // 1. Open the reset page with a bogus code
    await forgetPasswordPage.openResetLinkWithCode('?oobCode=bogus')
    await forgetPasswordPage.verifyPageLoaded()
    await expect(page).toHaveURL(/\/app\/forget-password$/)
    await expect(forgetPasswordPage.toast.filter({ hasText: 'This reset link is invalid or has already been used.' })).toBeVisible({ timeout: 60000 })
    await expect(forgetPasswordPage.heading).toBeVisible()

    // 2. Open the reset page with no code
    await forgetPasswordPage.openResetLinkWithCode('')
    await forgetPasswordPage.verifyPageLoaded()
    await expect(page).toHaveURL(/\/app\/forget-password$/)
    await expect(forgetPasswordPage.toast.filter({ hasText: 'Invalid password reset link. Please request a new one.' })).toBeVisible({ timeout: 60000 })
  })
})
