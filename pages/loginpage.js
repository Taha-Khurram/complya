//Created By AI
const { DashboardPage } = require('./dashboardpage')

class LoginPage {
    constructor(page) {
        this.page = page

        this.emailInput = page.getByRole('textbox', { name: 'Enter your email address', exact: true })
        this.passwordInput = page.getByRole('textbox', { name: 'Enter Password', exact: true })
        this.loginButton = page.getByRole('button', { name: 'Sign In', exact: true })
        this.passwordToggle = page.getByRole('button', { name: /^(Show|Hide) password$/ })

        this.emailError = page.locator('.form-group').filter({ has: this.emailInput }).locator('.validation-message')
        this.passwordError = page.locator('.form-group').filter({ has: this.passwordInput }).locator('.validation-message')

        this.formError = page.getByRole('alert')
    }

    async goto() {
        await this.page.goto('/app/sign-in', { waitUntil: 'domcontentloaded' })
        await this.emailInput.waitFor({ state: 'visible' })
        return this
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

    async login(email, password) {
        await this.fillEmail(email)
        await this.fillPassword(password)
        await this.submit()
        return new DashboardPage(this.page)
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
