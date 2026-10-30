// created by AI
const { expect } = require('@playwright/test')

/** Sign up form at /app/signup. */
class SignUpPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Sign up', exact: true })
        this.emailInput = page.getByRole('textbox', { name: 'Enter your email address', exact: true })
        this.passwordInput = page.getByRole('textbox', { name: 'Enter Password', exact: true })
        this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm Password', exact: true })
        this.createAccountButton = page.getByRole('button', { name: 'Create Account', exact: true })
        this.logInLink = page.getByRole('link', { name: 'Log In', exact: true })

        // Both toggles have the same name, so each is scoped to its field
        this.passwordToggle = this.#group(this.passwordInput).getByRole('button', { name: /^(Show|Hide) password$/ })
        this.confirmPasswordToggle = this.#group(this.confirmPasswordInput).getByRole('button', { name: /^(Show|Hide) password$/ })

        // Password rule hints are removed once the rule is met
        this.specialCharacterRule = page.getByText('Must contain 1 special character', { exact: true })
        this.minLengthRule = page.getByText('Must be at least 8 characters', { exact: true })

        this.emailError = this.#group(this.emailInput).locator('.validation-message')
        this.confirmPasswordError = this.#group(this.confirmPasswordInput).locator('.validation-message')
        this.formError = page.getByRole('alert')
    }

    #group(input) {
        return this.page.locator('.form-group').filter({ has: input })
    }

    async goto() {
        await this.page.goto('/app/signup', { waitUntil: 'domcontentloaded' })
        await this.emailInput.waitFor({ state: 'visible' })
        return this
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/signup$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async fillEmail(email) {
        await this.emailInput.fill(email)
    }

    async fillPassword(password) {
        await this.passwordInput.fill(password)
    }

    async fillConfirmPassword(password) {
        await this.confirmPasswordInput.fill(password)
    }

    async submit() {
        await this.createAccountButton.click()
    }

    async signUp(email, password, confirmPassword = password) {
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.fillConfirmPassword(confirmPassword)
        await this.submit()
        return new CheckEmailPage(this.page)
    }

    // Required here, not at the top, because loginpage.js requires this file
    async clickLogIn() {
        const { LoginPage } = require('./loginpage')
        await this.logInLink.click()
        return new LoginPage(this.page)
    }

    async togglePasswordVisibility() {
        await this.passwordToggle.click()
    }

    async toggleConfirmPasswordVisibility() {
        await this.confirmPasswordToggle.click()
    }

    async getEmailError() {
        return (await this.emailError.innerText()).trim()
    }

    async getConfirmPasswordError() {
        return (await this.confirmPasswordError.innerText()).trim()
    }

    async getFormError() {
        return (await this.formError.innerText()).trim()
    }

    async isPasswordMasked() {
        return (await this.passwordInput.getAttribute('type')) === 'password'
    }

    async isConfirmPasswordMasked() {
        return (await this.confirmPasswordInput.getAttribute('type')) === 'password'
    }

    async isCreateAccountEnabled() {
        return await this.createAccountButton.isEnabled()
    }
}

/** "Check your email" page after sign up, /app/new-verify/<email>. */
class CheckEmailPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Check your email', exact: true })
        this.sentMessage = page.getByText(/^We sent a verification link to /)
        // A plain span, not a button or link
        this.resendLink = page.getByText('Click to resend', { exact: true })
        this.toast = page.getByRole('alert')
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/new-verify\//, { timeout: 60000 })
        await expect(this.heading).toBeVisible()
    }

    async getToastText() {
        return (await this.toast.innerText()).trim()
    }
}

/** Page the verification email link opens, /app/email/verified. */
class EmailVerifiedPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Email Verified!', exact: true })
        this.logInLink = page.getByRole('link', { name: 'Log in', exact: true })
    }

    async goto(link) {
        await this.page.goto(link, { waitUntil: 'domcontentloaded' })
        return this
    }

    // A link that was already used redirects to sign-in with an error toast
    async gotoUsedLink(link) {
        const { LoginPage } = require('./loginpage')
        await this.page.goto(link, { waitUntil: 'domcontentloaded' })
        return new LoginPage(this.page)
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/email\/verified$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async clickLogIn() {
        const { LoginPage } = require('./loginpage')
        await this.logInLink.click()
        return new LoginPage(this.page)
    }
}

module.exports = { SignUpPage, CheckEmailPage, EmailVerifiedPage }
