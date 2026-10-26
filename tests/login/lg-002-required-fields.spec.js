// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

const cases = [
  { name: 'both fields empty', email: '', password: '', emailError: 'Email is required', passwordError: 'Password is required' },
  { name: 'email empty', email: '', password: 'AnyPassword1!', emailError: 'Email is required', passwordError: null },
  { name: 'password empty', email: 'qa.user@example.com', password: '', emailError: null, passwordError: 'Password is required' },
]

test.describe('Login', () => {
  for (const c of cases) {
    test(`LG-002 Required-field validation - ${c.name} @login @smoke @validation`, async ({ page }) => {
      const loginPage = await new LoginPage(page).goto()
      await loginPage.fillEmail(c.email)
      await loginPage.fillPassword(c.password)
      await loginPage.submit()

      if (c.emailError) expect(await loginPage.getEmailError()).toBe(c.emailError)
      else await expect(loginPage.emailError).toBeHidden()
      if (c.passwordError) expect(await loginPage.getPasswordError()).toBe(c.passwordError)
      else await expect(loginPage.passwordError).toBeHidden()

      await expect(page).toHaveURL(/\/app\/sign-in$/)
    })
  }
})
