// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

const invalidEmails = ['user@', 'user.com']

test.describe('Signup', () => {
  for (const email of invalidEmails) {
    test(`SU-004 Invalid email format - ${email} @signup @validation`, async ({ page }) => {
      const signUpPage = await new SignUpPage(page).goto()
      await signUpPage.fillEmail(email)
      await signUpPage.fillPassword('QaSignup1!')
      await signUpPage.fillConfirmPassword('QaSignup1!')
      await signUpPage.submit()

      await expect(signUpPage.emailError).toBeVisible()
      expect(await signUpPage.getEmailError()).toBe('Invalid email address')
      await expect(page).toHaveURL(/\/app\/signup$/)
    })
  }
})
