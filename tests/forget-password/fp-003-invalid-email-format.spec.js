// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { ForgetPasswordPage } = require('../../pages/forgetpasswordpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Forget Password', () => {
  test('FP-003 Invalid email formats @forget-password @validation @negative', async ({ page }) => {
    const resetRequests = []
    page.on('request', (request) => {
      if (request.url().includes('accounts:sendOobCode')) resetRequests.push(request.url())
    })
    const isResetResponse = (response) => response.url().includes('accounts:sendOobCode')

    // 1. Open /app/forget-password, enter user.com and click Send Email
    const forgetPasswordPage = await new ForgetPasswordPage(page).goto()
    await forgetPasswordPage.fillEmail('user.com')
    await forgetPasswordPage.submit()

    expect(await forgetPasswordPage.getEmailValidationMessage()).toBe("Please include an '@' in the email address. 'user.com' is missing an '@'.")
    expect(resetRequests).toHaveLength(0)

    // 2. Enter user@domain and click Send Email
    await forgetPasswordPage.fillEmail('user@domain')
    const [firstResponse] = await Promise.all([
      page.waitForResponse(isResetResponse),
      forgetPasswordPage.submit(),
    ])

    expect(firstResponse.status()).toBe(400)
    await expect(forgetPasswordPage.formError).toBeVisible()
    expect(await forgetPasswordPage.getFormError()).toBe('Please enter a valid email address.')
    await expect(page).toHaveURL(/\/app\/forget-password$/)

    // 3. Type more characters into the field
    await forgetPasswordPage.emailInput.pressSequentially('.com')
    await expect(forgetPasswordPage.formError).toBeVisible()
    expect(await forgetPasswordPage.getFormError()).toBe('Please enter a valid email address.')

    // 4. Replace the value with other@domain and press Enter in the field
    await forgetPasswordPage.fillEmail('other@domain')
    const [secondResponse] = await Promise.all([
      page.waitForResponse(isResetResponse),
      forgetPasswordPage.submitWithEnter(),
    ])

    expect(secondResponse.status()).toBe(400)
    await expect(forgetPasswordPage.formError).toHaveCount(1)
    await expect(forgetPasswordPage.formError).toHaveText('Please enter a valid email address.')
    await expect(page).toHaveURL(/\/app\/forget-password$/)
  })
})
