// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-002 Log In link returns to sign-in @signup @positive', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()
    const loginPage = await signUpPage.clickLogIn()

    await loginPage.verifyPageLoaded()
    await expect(page).toHaveURL(/\/app\/sign-in$/)
    await expect(loginPage.emailInput).toBeVisible()
  })
})
