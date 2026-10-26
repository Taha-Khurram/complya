// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  test('LG-006 Password is masked and the show/hide toggle works @login @positive', async ({ page }) => {
    const password = 'AnyPassword1!'
    const loginPage = await new LoginPage(page).goto()
    await loginPage.fillPassword(password)
    expect(await loginPage.isPasswordMasked()).toBe(true)

    await loginPage.togglePasswordVisibility()
    await expect.poll(() => loginPage.isPasswordMasked()).toBe(false)
    expect(await loginPage.getPasswordToggleLabel()).toBe('Hide password')

    await loginPage.togglePasswordVisibility()
    await expect.poll(() => loginPage.isPasswordMasked()).toBe(true)
    expect(await loginPage.getPasswordToggleLabel()).toBe('Show password')
    expect(await loginPage.getPasswordValue()).toBe(password)
  })
})
