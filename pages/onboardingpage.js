// created by AI
const { expect } = require('@playwright/test')

/**
 * Onboarding of a new account, one class per screen:
 * /app/review-terms → /app/onboarding steps 1/4 to 4/4 (with the organization terms between 2/4 and 3/4)
 * → /app/add-signature → "Waiting for Approval" dialog.
 * Each saved step is kept, so signing in again resumes at the current screen.
 */

/** Parts shared by every onboarding screen: step number, Continue, toasts, inline errors and the footer Sign Out. */
class OnboardingStep {
    constructor(page) {
        this.page = page

        this.stepNumber = page.getByText(/^\d\/4$/)
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
        // A plain div in the footer list, not a button or link
        this.signOutLink = page.getByRole('listitem').getByText('Sign Out', { exact: true })
        this.errors = page.locator('.validation-message')
    }

    fieldGroup(input) {
        return this.page.locator('.form-group').filter({ has: input })
    }

    errorFor(input) {
        return this.fieldGroup(input).locator('.validation-message')
    }

    // Toasts stack (the "Sign-in successful!" toast is often still open), so match by text
    toast(text) {
        return this.page.getByRole('alert').filter({ hasText: text })
    }

    async submit() {
        await this.continueButton.click()
    }

    // Required here, not at the top, because loginpage.js requires this file
    async signOut() {
        const { LoginPage } = require('./loginpage')
        await this.signOutLink.click()
        return new LoginPage(this.page)
    }

    async isContinueEnabled() {
        return await this.continueButton.isEnabled()
    }

    // Texts of the inline errors currently shown
    async getErrors() {
        const texts = await this.errors.allInnerTexts()
        return texts.map((text) => text.trim()).filter(Boolean)
    }
}

/** A "Review our terms" screen: accordion sections, each with an optional "Read the full ..." link. */
class TermsStep extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Review our terms', exact: true })
        this.intro = page.getByText('Please agree to the terms below to continue.', { exact: true })
        // Only the links of the open section are visible
        this.documentLinks = page.getByRole('link', { name: /^Read the full / })
    }

    section(name) {
        return this.page.getByRole('button', { name, exact: true })
    }

    documentLink(name) {
        return this.page.getByRole('link', { name: `Read the full ${name}`, exact: true })
    }

    // Clicking the open section closes it
    async toggleSection(name) {
        await this.section(name).click()
    }

    async openSection(name) {
        if (!(await this.isSectionOpen(name))) await this.toggleSection(name)
    }

    async isSectionOpen(name) {
        return (await this.section(name).getAttribute('aria-expanded')) === 'true'
    }
}

/** First screen of onboarding, /app/review-terms: the user's own terms. */
class ReviewTermsPage extends TermsStep {
    static SECTIONS = ['Terms of Service', 'Privacy Policy', 'Electronic Signature Disclosure', 'AI Disclosure', 'HIPAA Acknowledgement']
    static CONSENTS = [
        'I have read and agree to the Terms of Service.',
        'I have read and agree to the Privacy Policy.',
        'I consent to sign and receive records electronically.',
        'I understand how Complya uses AI and will review AI-generated content.',
        'I acknowledge my responsibilities for protecting PHI under HIPAA.',
    ]

    constructor(page) {
        super(page)

        this.consents = page.getByRole('checkbox')
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/review-terms$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    consent(label) {
        return this.page.getByRole('checkbox', { name: label, exact: true })
    }

    async checkConsent(label) {
        await this.consent(label).check()
    }

    async uncheckConsent(label) {
        await this.consent(label).uncheck()
    }

    // The label text toggles its checkbox too
    async clickConsentLabel(label) {
        await this.page.getByText(label, { exact: true }).click()
    }

    async checkAllConsents() {
        for (const label of ReviewTermsPage.CONSENTS) await this.checkConsent(label)
    }

    // Saves the consents (PUT /api/users/consents)
    async acceptTerms() {
        await this.checkAllConsents()
        await this.submit()
        return new ProfileStepPage(this.page)
    }
}

/** Step 1/4 "Lets get to know you" at /app/onboarding. */
class ProfileStepPage extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Lets get to know you', exact: true })
        this.profilePictureInput = page.locator('input[type="file"]')
        this.firstNameInput = page.getByRole('textbox', { name: 'First name', exact: true })
        this.lastNameInput = page.getByRole('textbox', { name: 'Last name', exact: true })
        // Disabled, prefilled with the account email
        this.emailInput = page.getByRole('textbox', { name: 'Email', exact: true })

        this.firstNameError = this.errorFor(this.firstNameInput)
        this.lastNameError = this.errorFor(this.lastNameInput)
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/onboarding$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.stepNumber).toHaveText('1/4')
    }

    async fillFirstName(name) {
        await this.firstNameInput.fill(name)
    }

    async fillLastName(name) {
        await this.lastNameInput.fill(name)
    }

    async getFirstNameError() {
        return (await this.firstNameError.innerText()).trim()
    }

    async getLastNameError() {
        return (await this.lastNameError.innerText()).trim()
    }

    // Toast "Profile created Successfully"
    async saveProfile(firstName, lastName) {
        await this.fillFirstName(firstName)
        await this.fillLastName(lastName)
        await this.submit()
        return new WorkspaceStepPage(this.page)
    }
}

/** Step 2/4 "Create your workspace". Continue saves nothing; it opens the organization terms. */
class WorkspaceStepPage extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Create your workspace', exact: true })
        // maxlength 20, at least 4 characters after trimming
        this.companyNameInput = page.getByRole('textbox', { name: 'Company name', exact: true })
        this.companyNameError = this.errorFor(this.companyNameInput)
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/onboarding$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.stepNumber).toHaveText('2/4')
    }

    async fillCompanyName(name) {
        await this.companyNameInput.fill(name)
    }

    async getCompanyNameError() {
        return (await this.companyNameError.innerText()).trim()
    }

    async continueToTerms(companyName) {
        await this.fillCompanyName(companyName)
        await this.submit()
        return new OrganizationTermsPage(this.page)
    }
}

/**
 * Organization terms between steps 2/4 and 3/4 (same URL and heading as the first terms, no step number).
 * Nothing is saved until they are accepted, so signing in again returns to step 2/4 with an empty name.
 */
class OrganizationTermsPage extends TermsStep {
    static SECTIONS = ['Master Service Agreement', 'Privacy Policy', 'Business Associate Agreement', 'Terms of Service']

    constructor(page) {
        super(page)

        this.agreementCheckbox = page.getByRole('checkbox', { name: 'I have read and agreed to the Master Service Agreement, Privacy Policy, Business Associate Agreement, and Terms of Service.', exact: true })
        this.newsletterCheckbox = page.getByRole('checkbox', { name: 'Send me product updates and news from Complya', exact: true })
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/onboarding$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.section('Master Service Agreement')).toBeVisible()
    }

    async checkAgreement() {
        await this.agreementCheckbox.check()
    }

    async checkNewsletter() {
        await this.newsletterCheckbox.check()
    }

    // Creates the workspace (POST /api/workspaces), toast "WorkSpace Created Successfully!"
    async acceptTerms({ newsletter = false } = {}) {
        await this.checkAgreement()
        if (newsletter) await this.checkNewsletter()
        await this.submit()
        return new WorkspaceSetupStepPage(this.page)
    }
}

/** Step 3/4 "Workspace Setup". Fax is the only optional field. */
class WorkspaceSetupStepPage extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Workspace Setup', exact: true })
        // Disabled, prefilled with the company name
        this.organizationNameInput = page.getByRole('textbox', { name: 'Organization Name', exact: true })

        // Keys used by fillDetails(), fillField() and getError()
        this.fields = {
            // Its label isn't linked to the input, and the input is prefilled with "+1"
            phone: page.locator('input[name="phoneNumber"]'),
            fax: page.getByRole('textbox', { name: 'Fax', exact: true }),
            npi: page.getByRole('textbox', { name: 'National Provider Identifier *', exact: true }),
            ein: page.getByRole('textbox', { name: 'Employer Identification Number *', exact: true }),
            billingEmail: page.getByRole('textbox', { name: 'Billing Email *', exact: true }),
            address: page.getByRole('textbox', { name: 'Address *', exact: true }),
            city: page.getByRole('textbox', { name: 'City *', exact: true }),
            zip: page.getByRole('textbox', { name: 'ZIP Code *', exact: true }),
            state: page.getByRole('textbox', { name: 'State *', exact: true }),
        }
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/onboarding$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.stepNumber).toHaveText('3/4')
    }

    // Phone, fax, NPI, EIN and ZIP are masked as you type, e.g. phone 7025550123 → "+1 (702) 555-0123".
    // fill() over an existing phone number keeps its digits, so the phone is emptied and typed instead
    async fillField(field, value) {
        if (field !== 'phone') return await this.fields[field].fill(value)
        await this.fields.phone.fill('')
        await this.fields.phone.pressSequentially(value)
    }

    // Fills only the keys given, e.g. { phone: '7025550123', zip: '73301' }
    async fillDetails(details) {
        for (const [field, value] of Object.entries(details)) await this.fillField(field, value)
    }

    async getError(field) {
        return (await this.errorFor(this.fields[field]).innerText()).trim()
    }

    // Saves with PATCH /api/workspaces/:id, toast "Save Successfully!"
    async saveDetails(details) {
        await this.fillDetails(details)
        await this.submit()
        return new InviteTeamStepPage(this.page)
    }
}

/** Step 4/4 "Collaborate with your team". There is deliberately no method that sends invites. */
class InviteTeamStepPage extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Collaborate with your team', exact: true })
        this.emailInput = page.getByRole('textbox', { name: 'email@example.com', exact: true })
        this.roleButton = page.locator('.dropdown-collaborate .dropdown-toggle')
        this.roleMenu = page.locator('.dropdown-collaborate .dropdown-menu')
        this.roleOptions = this.roleMenu.locator('.dropdown-item')
        this.roleHint = page.getByText(/^Press enter to add more /)
        // Each added email is a badge "<email><role>"; clicking it removes it
        this.invites = page.locator('span.badge.bg-secondary')
        this.sendInvitesButton = page.getByRole('button', { name: 'Send invites', exact: true })
        this.skipButton = page.getByRole('button', { name: 'Skip for now', exact: true })
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/onboarding$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.stepNumber).toHaveText('4/4')
    }

    // Invalid and duplicate emails are ignored without a message
    async addEmail(email) {
        await this.emailInput.fill(email)
        await this.emailInput.press('Enter')
    }

    async openRoleMenu() {
        await this.roleButton.click()
    }

    // Clicking the toggle while the menu is open closes it, so open it only when needed
    async chooseRole(role) {
        if (!(await this.roleMenu.isVisible())) await this.openRoleMenu()
        await this.roleMenu.getByRole('button', { name: role, exact: true }).click()
    }

    // The items are in the page even while the menu is closed
    async getRoleOptions() {
        return (await this.roleOptions.allTextContents()).map((text) => text.trim())
    }

    invite(email) {
        return this.invites.filter({ hasText: email })
    }

    // [{ email, role }] in the order shown; the role is lower case, e.g. "staff"
    async getInvites() {
        return await this.invites.evaluateAll((badges) => badges.map((badge) => {
            const role = badge.querySelector('.badge')?.textContent.trim() ?? ''
            return { email: badge.firstChild.textContent.trim(), role }
        }))
    }

    async removeInvite(email) {
        await this.invite(email).click()
    }

    // Only for the empty list check: toast "Please add atleast one email"
    async clickSendInvites() {
        await this.sendInvitesButton.click()
    }

    async skip() {
        await this.skipButton.click()
        return new AddSignaturePage(this.page)
    }
}

/** /app/add-signature: signature and time zone, the last onboarding screen. */
class AddSignaturePage extends OnboardingStep {
    constructor(page) {
        super(page)

        this.heading = page.getByRole('heading', { name: 'Add your signature', exact: true })
        this.addSignatureButton = page.getByRole('button', { name: 'Add signature', exact: true })
        this.editSignatureButton = page.getByRole('button', { name: 'Edit signature', exact: true })
        // Preselected from the browser time zone; the value is the IANA name, e.g. "America/Chicago"
        this.timeZoneSelect = page.getByRole('combobox', { name: 'Time zone', exact: true })
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/add-signature$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async openSignatureDialog() {
        await this.addSignatureButton.click()
        return new SignatureDialog(this.page)
    }

    async editSignature() {
        await this.editSignatureButton.click()
        return new SignatureDialog(this.page)
    }

    async getTimeZone() {
        return await this.timeZoneSelect.inputValue()
    }

    async selectTimeZone(timeZone) {
        await this.timeZoneSelect.selectOption(timeZone)
    }

    // Submitting the dialog only enables Continue; finishOnboarding() saves the signature
    async addTypedSignature(text) {
        const dialog = await this.openSignatureDialog()
        await dialog.typeSignature(text)
        return await dialog.submit()
    }

    // Saves the signature and time zone (PUT /api/users/signature)
    async finishOnboarding() {
        await this.submit()
        return new WaitingForApprovalDialog(this.page)
    }
}

/** "Signature" dialog on /app/add-signature, with Draw and Type tabs. */
class SignatureDialog {
    constructor(page) {
        this.page = page

        this.dialog = page.getByRole('dialog')
        this.drawTab = this.dialog.getByRole('tab', { name: 'Draw', exact: true })
        this.typeTab = this.dialog.getByRole('tab', { name: 'Type', exact: true })
        this.selectedTab = this.dialog.getByRole('tab', { selected: true })
        this.canvas = this.dialog.locator('canvas')
        // Its "Name" label isn't linked to the input
        this.typeInput = this.dialog.getByPlaceholder('Type your signature', { exact: true })
        this.preview = this.dialog.locator('.font-preview')
        this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true })
        this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true })
        this.resetButton = this.dialog.getByRole('button', { name: 'Reset', exact: true })
        this.submitButton = this.dialog.getByRole('button', { name: 'Submit', exact: true })
    }

    async verifyLoaded() {
        await expect(this.dialog).toBeVisible()
        await expect(this.drawTab).toBeVisible()
    }

    // One zigzag stroke across the canvas
    async draw() {
        await this.drawTab.click()
        const box = await this.canvas.boundingBox()
        const y = box.y + box.height / 2
        await this.page.mouse.move(box.x + 30, y)
        await this.page.mouse.down()
        for (let i = 1; i <= 10; i++) await this.page.mouse.move(box.x + 30 + i * 20, y + (i % 2 ? 15 : -15))
        await this.page.mouse.up()
    }

    async typeSignature(text) {
        await this.typeTab.click()
        await this.typeInput.fill(text)
    }

    async reset() {
        await this.resetButton.click()
    }

    async isSubmitEnabled() {
        return await this.submitButton.isEnabled()
    }

    async submit() {
        await this.submitButton.click()
        return new AddSignaturePage(this.page)
    }

    async cancel() {
        await this.cancelButton.click()
        return new AddSignaturePage(this.page)
    }

    async close() {
        await this.closeButton.click()
        return new AddSignaturePage(this.page)
    }
}

/** Dialog shown once onboarding is complete, on /app/add-signature. */
class WaitingForApprovalDialog {
    constructor(page) {
        this.page = page

        this.dialog = page.getByRole('dialog')
        this.heading = this.dialog.getByRole('heading', { name: 'Waiting for Approval', exact: true })
        this.message = this.dialog.getByText("Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email.", { exact: true })
        this.signOutButton = this.dialog.getByRole('button', { name: 'Sign Out', exact: true })
        this.checkAgainButton = this.dialog.getByRole('button', { name: 'Check Again', exact: true })
    }

    workspaceName(name) {
        return this.dialog.getByText(name, { exact: true })
    }

    async verifyLoaded() {
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }
}

// Screen a signed-in account resumes at, keyed for LoginPage.loginToOnboarding()
const ONBOARDING_STEPS = {
    terms: ReviewTermsPage,
    profile: ProfileStepPage,
    workspace: WorkspaceStepPage,
    workspaceSetup: WorkspaceSetupStepPage,
    invite: InviteTeamStepPage,
    signature: AddSignaturePage,
}

module.exports = {
    ReviewTermsPage,
    ProfileStepPage,
    WorkspaceStepPage,
    OrganizationTermsPage,
    WorkspaceSetupStepPage,
    InviteTeamStepPage,
    AddSignaturePage,
    SignatureDialog,
    WaitingForApprovalDialog,
    ONBOARDING_STEPS,
}
