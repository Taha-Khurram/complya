// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  for (const invalidEmail of ['user@', 'user.com']) {
    test(`LG-003 Invalid email format - ${invalidEmail} @login @validation`, async ({ page }) => {
      const loginPage = await new LoginPage(page).goto()
      await loginPage.login(invalidEmail, 'AnyPassword1!')
      expect(await loginPage.getEmailError()).toBe('Invalid email address')
      await expect(page).toHaveURL(/\/app\/sign-in$/)
    })
  }
})
