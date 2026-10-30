// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-005 Password rules control the hints and Create Account @signup @validation', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()

    // Too short, no special character
    await signUpPage.fillPassword('abc')
    await expect(signUpPage.specialCharacterRule).toBeVisible()
    await expect(signUpPage.minLengthRule).toBeVisible()
    await expect(signUpPage.createAccountButton).toBeDisabled()

    // Long enough, no special character
    await signUpPage.fillPassword('abcdefgh')
    await expect(signUpPage.specialCharacterRule).toBeVisible()
    await expect(signUpPage.minLengthRule).toBeHidden()
    await expect(signUpPage.createAccountButton).toBeDisabled()

    // Special character, too short
    await signUpPage.fillPassword('abc!')
    await expect(signUpPage.specialCharacterRule).toBeHidden()
    await expect(signUpPage.minLengthRule).toBeVisible()
    await expect(signUpPage.createAccountButton).toBeDisabled()

    // Both rules met
    await signUpPage.fillPassword('QaSignup1!')
    await expect(signUpPage.specialCharacterRule).toBeHidden()
    await expect(signUpPage.minLengthRule).toBeHidden()
    await expect(signUpPage.createAccountButton).toBeEnabled()
  })
})
