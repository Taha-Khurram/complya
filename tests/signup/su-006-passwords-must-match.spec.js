// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-006 Passwords must match @signup @smoke @validation', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()
    await signUpPage.fillEmail('qa.user@example.com')
    await signUpPage.fillPassword('QaSignup1!')
    await signUpPage.fillConfirmPassword('Different1!')
    await signUpPage.submit()

    await expect(signUpPage.confirmPasswordError).toBeVisible()
    expect(await signUpPage.getConfirmPasswordError()).toBe('Passwords must match')
    await expect(page).toHaveURL(/\/app\/signup$/)
  })
})
