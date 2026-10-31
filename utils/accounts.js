const { LoginPage } = require('../pages/loginpage')
const { EmailVerifiedPage } = require('../pages/signuppage')
const { generateEmailAddress, waitForEmail, getLinks } = require('./testmail')

// Signs up a new account through the sign-in page's Sign Up link and opens the verification link
// from its email, so it can sign in and start onboarding. Each call uses 1 testmail.app email and
// leaves a permanent dev account. `page` must have the app baseURL (https://app.complya.dev),
// e.g. browser.newPage({ baseURL })
const createVerifiedAccount = async (page, { prefix = 'qa', password = 'QaSignup1!' } = {}) => {
  const email = generateEmailAddress(prefix)

  const loginPage = await new LoginPage(page).goto()
  const signUpPage = await loginPage.clickSignUp()
  await signUpPage.verifyPageLoaded()
  const sentAt = new Date()
  const checkEmailPage = await signUpPage.signUp(email, password)
  await checkEmailPage.verifyPageLoaded()

  // Opened as a user would by clicking it in the email
  const mail = await waitForEmail(email, { receivedAfter: sentAt })
  const link = getLinks(mail).find((url) => url.includes('/app/auth/action?mode=verifyEmail'))
  if (!link) throw new Error(`No verification link in the email to ${email}`)

  const emailVerifiedPage = await new EmailVerifiedPage(page).goto(link)
  await emailVerifiedPage.verifyPageLoaded()
  return { email, password }
}

module.exports = { createVerifiedAccount }
