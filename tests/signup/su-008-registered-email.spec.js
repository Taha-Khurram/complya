// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test.skip(!process.env.USER_EMAIL, 'USER_EMAIL is not set')

  test('SU-008 Registered email is rejected @signup @negative', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()
    await signUpPage.fillEmail(process.env.USER_EMAIL)
    await signUpPage.fillPassword('QaSignup1!')
    await signUpPage.fillConfirmPassword('QaSignup1!')
    await signUpPage.submit()

    await expect(signUpPage.formError).toBeVisible()
    expect(await signUpPage.getFormError()).toBe('An account with this email already exists')
    await expect(page).toHaveURL(/\/app\/signup$/)
    await expect(signUpPage.emailInput).toBeEmpty()
    await expect(signUpPage.passwordInput).toBeEmpty()
    await expect(signUpPage.confirmPasswordInput).toBeEmpty()
    await expect(signUpPage.createAccountButton).toBeDisabled()
  })
})
