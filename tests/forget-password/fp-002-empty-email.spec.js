// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { ForgetPasswordPage } = require('../../pages/forgetpasswordpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Forget Password', () => {
  test('FP-002 Empty email is blocked by native validation @forget-password @validation', async ({ page }) => {
    const resetRequests = []
    page.on('request', (request) => {
      if (request.url().includes('accounts:sendOobCode')) resetRequests.push(request.url())
    })

    // 1. Open /app/forget-password and click Send Email with the field empty
    const forgetPasswordPage = await new ForgetPasswordPage(page).goto()
    await forgetPasswordPage.submit()

    expect(await forgetPasswordPage.getEmailValidationMessage()).toBe('Please fill out this field.')
    expect(resetRequests).toHaveLength(0)
    await expect(forgetPasswordPage.formError).toHaveCount(0)
    await expect(page).toHaveURL(/\/app\/forget-password$/)
  })
})
