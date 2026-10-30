// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-001 Sign Up link opens the signup form @signup @smoke @positive', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    const signUpPage = await loginPage.clickSignUp()

    await signUpPage.verifyPageLoaded()
    await expect(signUpPage.emailInput).toBeVisible()
    await expect(signUpPage.emailInput).toBeEmpty()
    await expect(signUpPage.passwordInput).toBeVisible()
    await expect(signUpPage.passwordInput).toBeEmpty()
    await expect(signUpPage.confirmPasswordInput).toBeVisible()
    await expect(signUpPage.confirmPasswordInput).toBeEmpty()
    await expect(signUpPage.specialCharacterRule).toBeVisible()
    await expect(signUpPage.minLengthRule).toBeVisible()
    await expect(signUpPage.createAccountButton).toBeDisabled()
  })
})
