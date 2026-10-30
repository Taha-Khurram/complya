// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  test.skip(!process.env.USER_EMAIL, 'USER_EMAIL is not set')

  test('LG-004 Registered email with a wrong password @login @smoke @negative', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    await loginPage.login(process.env.USER_EMAIL, `Wrong-${Date.now()}!`)
    expect(await loginPage.getFormError()).toBe('Invalid email or password. Please try again.')
    await expect(page).toHaveURL(/\/app\/sign-in$/)
  })
})
