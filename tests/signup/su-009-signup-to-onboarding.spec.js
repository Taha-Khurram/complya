// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { EmailVerifiedPage } = require('../../pages/signuppage')
const { generateEmailAddress, waitForEmail, getLinks } = require('../../utils/testmail')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Signup', () => {
  test.skip(!process.env.TESTMAIL_API_KEY || !process.env.TESTMAIL_NAMESPACE, 'TESTMAIL_API_KEY and TESTMAIL_NAMESPACE are not set')

  // Creates a dev account and sends one email per run, so the whole journey is one test
  test('SU-009 New account signs up, verifies its email and reaches onboarding @signup @smoke @positive', async ({ page }) => {
    const email = generateEmailAddress('signup')
    const password = 'QaSignup1!'

    const loginPage = await new LoginPage(page).goto()
    const signUpPage = await loginPage.clickSignUp()
    await signUpPage.verifyPageLoaded()

    const sentAt = new Date()
    const checkEmailPage = await signUpPage.signUp(email, password)
    await checkEmailPage.verifyPageLoaded()
    expect(await checkEmailPage.getToastText()).toBe('Account created Successfully! Please check your email for verification.')
    await expect(checkEmailPage.sentMessage).toHaveText(`We sent a verification link to ${email}`)

    const mail = await waitForEmail(email, { receivedAfter: sentAt })
    expect(mail.subject).toBe('Verify your email for complya.dev')
    const link = getLinks(mail).find((url) => url.includes('/app/auth/action?mode=verifyEmail'))
    expect(link).toBeTruthy()

    // Signing in before verifying is blocked
    const unverifiedLoginPage = await new LoginPage(page).goto()
    await unverifiedLoginPage.login(email, password)
    expect(await unverifiedLoginPage.getFormError()).toBe('Please verify your email before signing in. Check your inbox for the verification link.')
    await expect(unverifiedLoginPage.emailNotVerifiedMessage).toBeVisible()
    await expect(page).toHaveURL(/\/app\/sign-in$/)

    const emailVerifiedPage = await new EmailVerifiedPage(page).goto(link)
    await emailVerifiedPage.verifyPageLoaded()

    // The link only works once
    const signInPage = await emailVerifiedPage.gotoUsedLink(link)
    await signInPage.verifyPageLoaded()
    expect(await signInPage.getFormError()).toBe('This link is invalid. It may have already been used.')

    const onboardingPage = await signInPage.loginToOnboarding(email, password)
    await onboardingPage.verifyPageLoaded()
  })
})
