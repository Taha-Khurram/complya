// created by AI
const { expect } = require('@playwright/test')

/** Forget password form at /app/forget-password. */
class ForgetPasswordPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Forget Password', exact: true })
        this.emailInput = page.getByRole('textbox', { name: 'Enter your email address', exact: true })
        this.sendEmailButton = page.getByRole('button', { name: 'Send Email', exact: true })
        this.termsLink = page.getByRole('link', { name: 'Terms', exact: true })
        this.privacyLink = page.getByRole('link', { name: 'Privacy', exact: true })

        // Red alert inside the form; toasts are a separate element
        this.formError = page.locator('form').getByRole('alert')
        this.toast = page.locator('.Toastify__toast')
    }

    async goto() {
        await this.page.goto('/app/forget-password', { waitUntil: 'domcontentloaded' })
        await this.emailInput.waitFor({ state: 'visible' })
        return this
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/forget-password$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async fillEmail(email) {
        await this.emailInput.clear()
        await this.emailInput.fill(email)
    }

    async submit() {
        await this.sendEmailButton.click()
    }

    async submitWithEnter() {
        await this.emailInput.press('Enter')
    }

    // Only for an email the app accepts; the same URL then shows "Check your email"
    async requestReset(email) {
        await this.fillEmail(email)
        await this.submit()
        return new CheckResetEmailPage(this.page)
    }

    // A reset page URL with a bad or missing code ('?oobCode=bogus' or '') redirects back here
    async openResetLinkWithCode(query) {
        await this.page.goto(`/app/reset-password${query}`, { waitUntil: 'domcontentloaded' })
        return this
    }

    // Browser validation message, e.g. "Please fill out this field."
    async getEmailValidationMessage() {
        return await this.emailInput.evaluate((input) => input.validationMessage)
    }

    async getFormError() {
        return (await this.formError.innerText()).trim()
    }

    async getToastText() {
        return (await this.toast.last().innerText()).trim()
    }

    async getEmailValue() {
        return await this.emailInput.inputValue()
    }

    async isSendEmailEnabled() {
        return await this.sendEmailButton.isEnabled()
    }
}

/** "Check your email" state of /app/forget-password after a reset email is sent. */
class CheckResetEmailPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Check your email', exact: true })
        this.sentMessage = page.getByText('We sent a password reset link to your email', { exact: true })
        // A plain span, not a button or link
        this.resendLink = page.getByText('Click to resend', { exact: true })
        this.termsLink = page.getByRole('link', { name: 'Terms and Conditions', exact: true })
        this.privacyLink = page.getByRole('link', { name: 'Privacy Policy', exact: true })
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/forget-password$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    // Opened as a user would by clicking it in the email; redirects to /app/reset-password
    async openResetLink(link) {
        await this.page.goto(link, { waitUntil: 'domcontentloaded' })
        return new ResetPasswordPage(this.page)
    }

    // A link that was already used redirects to sign-in with an error toast
    async openUsedResetLink(link) {
        const { LoginPage } = require('./loginpage')
        await this.page.goto(link, { waitUntil: 'domcontentloaded' })
        return new LoginPage(this.page)
    }
}

/** Reset password form at /app/reset-password?oobCode=..., opened from the reset email. */
class ResetPasswordPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Reset Password', exact: true })
        this.emailText = page.getByText(/^for /)
        this.passwordInput = page.getByRole('textbox', { name: 'New password', exact: true })
        this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password', exact: true })
        this.resetButton = page.getByRole('button', { name: 'Reset Password', exact: true })

        // Both toggles have the same name, so each is scoped to its field
        this.passwordToggle = this.passwordInput.locator('..').getByRole('button', { name: /^(Show|Hide) password$/ })
        this.confirmPasswordToggle = this.confirmPasswordInput.locator('..').getByRole('button', { name: /^(Show|Hide) password$/ })

        // Hints change their text once the rule is met
        this.specialCharacterRule = page.getByText(/^(Must contain 1 special character|Password contains a special character)$/)
        this.minLengthRule = page.getByText(/^(Must be at least 8 characters|Password has at least 8 characters)$/)

        // Rule and mismatch errors are only shown as toasts
        this.toast = page.locator('.Toastify__toast')
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/reset-password\?oobCode=/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async fillPassword(password) {
        await this.passwordInput.fill(password)
    }

    async fillConfirmPassword(password) {
        await this.confirmPasswordInput.fill(password)
    }

    async submit() {
        await this.resetButton.click()
    }

    // Only for a valid password; the app then redirects to /app/sign-in
    async resetPassword(password, confirmPassword = password) {
        const { LoginPage } = require('./loginpage')
        await this.fillPassword(password)
        await this.fillConfirmPassword(confirmPassword)
        await this.submit()
        return new LoginPage(this.page)
    }

    async togglePasswordVisibility() {
        await this.passwordToggle.click()
    }

    async toggleConfirmPasswordVisibility() {
        await this.confirmPasswordToggle.click()
    }

    async isPasswordMasked() {
        return (await this.passwordInput.getAttribute('type')) === 'password'
    }

    async isConfirmPasswordMasked() {
        return (await this.confirmPasswordInput.getAttribute('type')) === 'password'
    }

    async getPasswordToggleLabel() {
        return await this.passwordToggle.getAttribute('aria-label')
    }

    async getConfirmPasswordToggleLabel() {
        return await this.confirmPasswordToggle.getAttribute('aria-label')
    }

    // Browser validation message, e.g. "Please fill out this field."
    async getPasswordValidationMessage() {
        return await this.passwordInput.evaluate((input) => input.validationMessage)
    }

    async getToastText() {
        return (await this.toast.last().innerText()).trim()
    }
}

module.exports = { ForgetPasswordPage, CheckResetEmailPage, ResetPasswordPage }
