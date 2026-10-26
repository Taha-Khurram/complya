// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  test('LG-005 Unregistered email does not reveal whether the account exists @login @negative', async ({ page }) => {
    const email = `qa.notregistered.${Date.now()}@example.com`
    const password = 'AnyPassword1!'
    const loginPage = await new LoginPage(page).goto()
    await loginPage.login(email, password)

    // Same text as LG-004 (registered email), so it doesn't reveal whether the account exists
    expect(await loginPage.getFormError()).toBe('Invalid email or password. Please try again.')
    await expect(page).toHaveURL(/\/app\/sign-in$/)
    expect(await loginPage.getEmailValue()).toBe(email)
    expect(await loginPage.getPasswordValue()).toBe(password)
  })
})
