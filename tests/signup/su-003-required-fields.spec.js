// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-003 Required-field validation @signup @smoke @validation', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()
    await signUpPage.fillPassword('QaSignup1!')
    await signUpPage.submit()

    await expect(signUpPage.emailError).toBeVisible()
    expect(await signUpPage.getEmailError()).toBe('Email is required')
    await expect(signUpPage.confirmPasswordError).toBeVisible()
    expect(await signUpPage.getConfirmPasswordError()).toBe('Confirm password is required')
    await expect(page).toHaveURL(/\/app\/signup$/)
  })
})
