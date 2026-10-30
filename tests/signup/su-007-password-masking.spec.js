// created by AI
const { test, expect } = require('@playwright/test')
const { SignUpPage } = require('../../pages/signuppage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test('SU-007 Passwords are masked and each toggle works on its own field @signup @positive', async ({ page }) => {
    const signUpPage = await new SignUpPage(page).goto()
    await signUpPage.fillPassword('QaSignup1!')
    await signUpPage.fillConfirmPassword('QaSignup1!')
    expect(await signUpPage.isPasswordMasked()).toBe(true)
    expect(await signUpPage.isConfirmPasswordMasked()).toBe(true)

    // Password toggle only affects the password field
    await signUpPage.togglePasswordVisibility()
    await expect.poll(() => signUpPage.isPasswordMasked()).toBe(false)
    await expect(signUpPage.passwordToggle).toHaveAttribute('aria-label', 'Hide password')
    expect(await signUpPage.isConfirmPasswordMasked()).toBe(true)

    // Confirm toggle shows the second field
    await signUpPage.toggleConfirmPasswordVisibility()
    await expect.poll(() => signUpPage.isConfirmPasswordMasked()).toBe(false)
    expect(await signUpPage.isPasswordMasked()).toBe(false)

    // Both toggles again mask both fields
    await signUpPage.togglePasswordVisibility()
    await signUpPage.toggleConfirmPasswordVisibility()
    await expect.poll(() => signUpPage.isPasswordMasked()).toBe(true)
    await expect.poll(() => signUpPage.isConfirmPasswordMasked()).toBe(true)
    await expect(signUpPage.passwordToggle).toHaveAttribute('aria-label', 'Show password')
    await expect(signUpPage.confirmPasswordToggle).toHaveAttribute('aria-label', 'Show password')
  })
})
