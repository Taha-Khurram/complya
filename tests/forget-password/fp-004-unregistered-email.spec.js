// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { ForgetPasswordPage } = require('../../pages/forgetpasswordpage')
const { generateEmailAddress } = require('../../utils/testmail')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Forget Password', () => {
  test.skip(!process.env.TESTMAIL_API_KEY || !process.env.TESTMAIL_NAMESPACE, 'TESTMAIL_API_KEY and TESTMAIL_NAMESPACE are not set')

  test('FP-004 Unregistered email @forget-password @negative', async ({ page }) => {
    // 1. Open /app/forget-password, enter a fresh unregistered address and click Send Email
    const forgetPasswordPage = await new ForgetPasswordPage(page).goto()
    const checkResetEmailPage = await forgetPasswordPage.requestReset(generateEmailAddress('fp-unknown'))

    // The result depends on the backend: the "Check your email" screen or a failure alert
    await expect(checkResetEmailPage.heading.or(forgetPasswordPage.formError)).toBeVisible({ timeout: 60000 })

    if (await checkResetEmailPage.heading.isVisible()) {
      test.info().annotations.push({ type: 'outcome', description: 'Check your email screen shown' })
      await expect(checkResetEmailPage.sentMessage).toBeVisible()
      await expect(page).toHaveURL(/\/app\/forget-password$/)
    } else {
      test.info().annotations.push({ type: 'outcome', description: 'Form alert shown' })
      expect(await forgetPasswordPage.getFormError()).toBe('Failed to send reset email. Please try again.')
      await expect(page).toHaveURL(/\/app\/forget-password$/)
    }

    // Not signed in either way
    await expect(page).not.toHaveURL(/\/app\/?$/)
  })
})
