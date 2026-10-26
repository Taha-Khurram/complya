// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  test('LG-007 Pressing Enter submits the login form @login @positive', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    await loginPage.fillEmail(`qa.notregistered.${Date.now()}@example.com`)
    await loginPage.fillPassword('AnyPassword1!')
    await loginPage.submitWithEnter()
    expect(await loginPage.getFormError()).toBe('Invalid email or password. Please try again.')
  })
})
