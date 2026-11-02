//Created By AI
const { expect } = require('@playwright/test')
const { DashboardPage } = require('./dashboardpage')
const { ForgetPasswordPage } = require('./forgetpasswordpage')
const { ONBOARDING_STEPS } = require('./onboardingpage')
const { SignUpPage } = require('./signuppage')

class LoginPage {
    // Temporary Firebase errors that the app shows as a toast, e.g. "Firebase: Error (auth/the-service-is-currently-unavailable.)."
    static TRANSIENT_AUTH_ERROR = /auth\/(the-service-is-currently-unavailable|network-request-failed)/

    constructor(page) {
        this.page = page

        this.emailInput = page.getByRole('textbox', { name: 'Enter your email address', exact: true })
        this.passwordInput = page.getByRole('textbox', { name: 'Enter Password', exact: true })
        this.loginButton = page.getByRole('button', { name: 'Sign In', exact: true })
        this.passwordToggle = page.getByRole('button', { name: /^(Show|Hide) password$/ })

        this.emailError = page.locator('.form-group').filter({ has: this.emailInput }).locator('.validation-message')
        this.passwordError = page.locator('.form-group').filter({ has: this.passwordInput }).locator('.validation-message')

        this.formError = page.getByRole('alert')
        this.toastCloseButton = page.getByRole('button', { name: 'close', exact: true })
        this.validationMessages = page.locator('.form-group .validation-message')
        // Inline message when an account that hasn't verified its email signs in
        this.emailNotVerifiedMessage = page.getByText('Email not verified.')

        this.signUpLink = page.getByRole('link', { name: 'Sign Up', exact: true })
        this.forgetPasswordLink = page.getByRole('link', { name: 'Forget password', exact: true })
    }

    async goto() {
        await this.page.goto('/app/sign-in', { waitUntil: 'domcontentloaded' })
        await this.emailInput.waitFor({ state: 'visible' })
        return this
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/sign-in/, { timeout: 60000 })
        await expect(this.emailInput).toBeVisible({ timeout: 60000 })
    }

    async fillEmail(email) {
        await this.emailInput.clear()
        await this.emailInput.fill(email)
    }

    async fillPassword(password) {
        await this.passwordInput.clear()
        await this.passwordInput.fill(password)
    }

    async submit() {
        await this.loginButton.click()
    }

    async submitWithEnter() {
        await this.passwordInput.press('Enter')
    }

    // Clicks Sign In and waits for the first result: leaving the sign-in page, a toast, an inline error or
    // "Email not verified.". A temporary Firebase error toast is closed and Sign In clicked again (3 attempts in all),
    // so it fails here with a clear message instead of the next page timing out. Other results are left to the caller
    async submitWithRetry(attempts = 3) {
        const timeout = 60000
        for (let attempt = 1; attempt <= attempts; attempt++) {
            await this.submit()
            // Each wait catches its own timeout, so the ones that lose the race can't reject later
            const outcome = await Promise.race([
                this.page.waitForURL((url) => !url.pathname.startsWith('/app/sign-in'), { timeout }).then(() => 'signedIn', () => 'none'),
                this.formError.first().waitFor({ state: 'visible', timeout }).then(() => 'toast', () => 'none'),
                this.validationMessages.first().waitFor({ state: 'visible', timeout }).then(() => 'invalid', () => 'none'),
                this.emailNotVerifiedMessage.waitFor({ state: 'visible', timeout }).then(() => 'notVerified', () => 'none'),
            ])
            if (outcome !== 'toast') return

            const message = (await this.formError.first().textContent()) || ''
            if (!LoginPage.TRANSIENT_AUTH_ERROR.test(message)) return
            if (attempt === attempts) throw new Error(`Firebase auth unavailable after ${attempts} attempts: ${message}`)

            // The toast closes itself after ~5s, so it may already be gone
            await this.toastCloseButton.first().click({ timeout: 5000 }).catch(() => {})
            await this.formError.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
            await this.page.waitForTimeout(2000)
        }
    }

    async login(email, password) {
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.submitWithRetry()
        return new DashboardPage(this.page)
    }

    // An account that hasn't finished onboarding opens it instead of Home, at the step it reached:
    // 'terms' (first login), 'profile', 'workspace', 'workspaceSetup', 'invite' or 'signature'
    async loginToOnboarding(email, password, step = 'terms') {
        const StepPage = ONBOARDING_STEPS[step]
        if (!StepPage) throw new Error(`Unknown onboarding step "${step}"`)
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.submitWithRetry()
        return new StepPage(this.page)
    }

    async clickSignUp() {
        await this.signUpLink.click()
        return new SignUpPage(this.page)
    }

    async clickForgetPassword() {
        await this.forgetPasswordLink.click()
        return new ForgetPasswordPage(this.page)
    }

    async togglePasswordVisibility() {
        await this.passwordToggle.click()
    }

    async getEmailError() {
        return (await this.emailError.innerText()).trim()
    }

    async getPasswordError() {
        return (await this.passwordError.innerText()).trim()
    }

    async getFormError() {
        return (await this.formError.innerText()).trim()
    }

    async getEmailValue() {
        return await this.emailInput.inputValue()
    }

    async getPasswordValue() {
        return await this.passwordInput.inputValue()
    }

    async getPasswordToggleLabel() {
        return await this.passwordToggle.getAttribute('aria-label')
    }

    async isPasswordMasked() {
        return (await this.passwordInput.getAttribute('type')) === 'password'
    }

    async isLoginButtonEnabled() {
        return await this.loginButton.isEnabled()
    }
}

module.exports = { LoginPage }
