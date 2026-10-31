// created by AI
// spec: specs/forget-password-plan.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { waitForEmail, getLinks } = require('../../utils/testmail')

const baseURL = process.env.APP_URL || 'https://app.complya.dev'
test.use({ baseURL })

// Each run swaps the account's password between these two
const PASSWORDS = ['QaReset1!', 'QaReset2!']

// Signs in from a separate context, so the test page stays signed out
const findCurrentPassword = async (browser, email) => {
  for (const password of PASSWORDS) {
    const page = await browser.newPage({ baseURL })
    const loginPage = await new LoginPage(page).goto()
    await loginPage.login(email, password)
    await Promise.race([page.waitForURL(/\/app\/$/, { timeout: 60000 }), loginPage.formError.waitFor({ timeout: 60000 })])
    const signedIn = /\/app\/$/.test(page.url())
    await page.close()
    if (signedIn) return password
  }
  throw new Error(`Neither ${PASSWORDS.join(' nor ')} signs in to ${email}, so reset its password by hand`)
}

test.describe('Forget Password', () => {
  test.skip(!process.env.TESTMAIL_API_KEY || !process.env.TESTMAIL_NAMESPACE, 'TESTMAIL_API_KEY and TESTMAIL_NAMESPACE are not set')

  // Sends one reset email and changes the password of the "QA Onboard 984491" account, so the whole journey is one test
  test('FP-006 Full password reset by email: reset page, validation, success, old and new password, reused link @forget-password @smoke @positive @email', async ({ page, browser }) => {
    const email = `${process.env.TESTMAIL_NAMESPACE}.onboarding.1793444984776if5o@inbox.testmail.app`

    // 1. Find which password works now and pick the other one
    const currentPassword = await findCurrentPassword(browser, email)
    const newPassword = PASSWORDS.find((password) => password !== currentPassword)

    const resetRequests = []
    page.on('request', (request) => {
      if (request.url().includes('accounts:resetPassword') && request.postData()?.includes('newPassword')) resetRequests.push(request)
    })

    // 2. Request a reset email from the Forget password link
    const loginPage = await new LoginPage(page).goto()
    const forgetPasswordPage = await loginPage.clickForgetPassword()
    await forgetPasswordPage.verifyPageLoaded()
    // testmail's clock can run slightly behind this machine's
    const receivedAfter = new Date(Date.now() - 10000)
    const checkEmailPage = await forgetPasswordPage.requestReset(email)
    await checkEmailPage.verifyPageLoaded()
    await expect(checkEmailPage.sentMessage).toBeVisible()
    await expect(checkEmailPage.resendLink).toBeVisible()
    await expect(checkEmailPage.termsLink).toBeVisible()
    await expect(checkEmailPage.privacyLink).toBeVisible()

    // 3. Read the reset email
    const mail = await waitForEmail(email, { receivedAfter })
    expect(mail.from).toBe('noreply@complya.dev')
    expect(mail.subject).toBe('Reset your password for complya.dev')
    expect(mail.text).toContain(`Follow this link to reset your complya.dev password for your ${email} account.`)
    const links = getLinks(mail).filter((url) => url.includes('/app/auth/action?mode=resetPassword&oobCode='))
    expect(links).toHaveLength(1)
    const [link] = links

    // 4. Open the link
    const resetPasswordPage = await checkEmailPage.openResetLink(link)
    await resetPasswordPage.verifyPageLoaded()
    await expect(resetPasswordPage.emailText).toHaveText(`for ${email}`)
    await expect(resetPasswordPage.passwordInput).toBeEmpty()
    await expect(resetPasswordPage.confirmPasswordInput).toBeEmpty()
    expect(await resetPasswordPage.isPasswordMasked()).toBe(true)
    expect(await resetPasswordPage.isConfirmPasswordMasked()).toBe(true)
    await expect(resetPasswordPage.specialCharacterRule).toHaveText('Must contain 1 special character')
    await expect(resetPasswordPage.minLengthRule).toHaveText('Must be at least 8 characters')
    await expect(resetPasswordPage.resetButton).toBeEnabled()

    // 5. Empty fields are blocked by the browser
    await resetPasswordPage.submit()
    expect(await resetPasswordPage.getPasswordValidationMessage()).toBe('Please fill out this field.')

    // 6. Each Show password toggle only affects its own field
    await resetPasswordPage.fillPassword(newPassword)
    await resetPasswordPage.fillConfirmPassword(newPassword)
    await resetPasswordPage.togglePasswordVisibility()
    expect(await resetPasswordPage.isPasswordMasked()).toBe(false)
    expect(await resetPasswordPage.getPasswordToggleLabel()).toBe('Hide password')
    expect(await resetPasswordPage.isConfirmPasswordMasked()).toBe(true)
    await resetPasswordPage.toggleConfirmPasswordVisibility()
    expect(await resetPasswordPage.isConfirmPasswordMasked()).toBe(false)
    expect(await resetPasswordPage.getConfirmPasswordToggleLabel()).toBe('Hide password')
    await resetPasswordPage.togglePasswordVisibility()
    await resetPasswordPage.toggleConfirmPasswordVisibility()
    expect(await resetPasswordPage.isPasswordMasked()).toBe(true)
    expect(await resetPasswordPage.isConfirmPasswordMasked()).toBe(true)

    // 7. The hints change text as each rule is met
    await resetPasswordPage.fillPassword('abcdefgh')
    await expect(resetPasswordPage.specialCharacterRule).toHaveText('Must contain 1 special character')
    await expect(resetPasswordPage.minLengthRule).toHaveText('Password has at least 8 characters')
    await resetPasswordPage.fillPassword('abc!')
    await expect(resetPasswordPage.specialCharacterRule).toHaveText('Password contains a special character')
    await expect(resetPasswordPage.minLengthRule).toHaveText('Must be at least 8 characters')
    await resetPasswordPage.fillPassword(newPassword)
    await expect(resetPasswordPage.specialCharacterRule).toHaveText('Password contains a special character')
    await expect(resetPasswordPage.minLengthRule).toHaveText('Password has at least 8 characters')

    // 8. Invalid passwords are rejected with a toast and nothing is sent
    const invalidCases = [
      ['abcdefgh', 'abcdefgh', 'Must contain 1 special character'],
      ['abc!', 'abc!', 'Must be at least 8 characters'],
      [newPassword, 'Different1!', 'Passwords do not match'],
    ]
    for (const [password, confirmPassword, message] of invalidCases) {
      await resetPasswordPage.fillPassword(password)
      await resetPasswordPage.fillConfirmPassword(confirmPassword)
      await resetPasswordPage.submit()
      await expect(resetPasswordPage.toast.filter({ hasText: message })).toBeVisible()
    }
    expect(resetRequests).toHaveLength(0)
    await expect(page).toHaveURL(/\/app\/reset-password\?oobCode=/)

    // 9. Reset with a valid password
    const signInPage = await resetPasswordPage.resetPassword(newPassword)
    await expect(resetPasswordPage.toast.filter({ hasText: 'Password reset successfully! You can now sign in with your new password.' })).toBeVisible()
    await signInPage.verifyPageLoaded()
    expect(resetRequests).toHaveLength(1)
    // The sign-in page reads a single alert, so wait for every toast to close
    await expect(resetPasswordPage.toast).toHaveCount(0, { timeout: 30000 })

    // 10. The same link can't be used again (checked while still signed out)
    const usedLinkPage = await checkEmailPage.openUsedResetLink(link)
    await usedLinkPage.verifyPageLoaded()
    expect(await usedLinkPage.getFormError()).toBe('This link is invalid. It may have already been used.')
    await expect(resetPasswordPage.toast).toHaveCount(0, { timeout: 30000 })

    // 11. The old password is rejected
    await usedLinkPage.login(email, currentPassword)
    expect(await usedLinkPage.getFormError()).toBe('Invalid email or password. Please try again.')
    await expect(page).toHaveURL(/\/app\/sign-in$/)
    await expect(resetPasswordPage.toast).toHaveCount(0, { timeout: 30000 })

    // 12. The new password signs in to Home
    const dashboardPage = await usedLinkPage.login(email, newPassword)
    await expect(page).toHaveURL(/\/app\/$/, { timeout: 60000 })
    await expect(dashboardPage.homeHeading).toBeVisible({ timeout: 60000 })
  })
})
