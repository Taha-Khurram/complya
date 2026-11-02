// created by AI
const { expect } = require('@playwright/test')

// The sidebar expands while hovered and covers the left of the page, so move the mouse onto the page content first
const moveOffSidebar = async (page) => {
    await page.getByRole('main').hover()
}

/** Sites at /app/sites: the "Add" button and the sites table (newest site first). */
class SitesPage {
    constructor(page) {
        this.page = page

        this.main = page.getByRole('main')
        this.heading = this.main.getByRole('heading', { level: 6, name: 'Sites', exact: true })
        this.addButton = this.main.getByRole('button', { name: 'Add', exact: true })
        // "1-N / N sites" (shown as "Sites" through CSS)
        this.countHeading = this.main.getByRole('heading', { level: 6, name: /^\d+-\d+ \/ \d+ sites$/i })
        this.rows = this.main.getByRole('table').getByRole('rowgroup').nth(1).getByRole('row')
        this.firstRow = this.rows.first()
        // react-toastify message after Save
        this.toast = page.getByRole('alert')
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/sites$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
        await expect(this.countHeading).toBeVisible({ timeout: 60000 })
    }

    async getSiteCount() {
        const text = await this.countHeading.textContent()
        return Number(text.match(/\/ (\d+)/)[1])
    }

    row(name) {
        return this.rows.filter({ has: this.page.getByText(name, { exact: true }) })
    }

    // Name, Address, City, State, Zip Code, then Verification Status
    statusCell(row) {
        return row.getByRole('cell').last()
    }

    async clickAdd() {
        await moveOffSidebar(this.page)
        await this.addButton.click()
        const dialog = new NewSiteDialog(this.page)
        await dialog.verifyOpen()
        return dialog
    }

    async openSite(name) {
        await moveOffSidebar(this.page)
        await this.row(name).getByText(name, { exact: true }).click()
        return new SiteDetailsPage(this.page)
    }
}

/** The "New Site" dialog opened by Sites → Add. Fields are keyed by their input name. */
class NewSiteDialog {
    static FIELDS = {
        'Site Name': 'siteName',
        'NPI': 'npi',
        'EIN': 'ein',
        'Phone No': 'phoneNumber',
        'Billing Email': 'billingEmail',
        'Address': 'address',
        'City': 'city',
        'ZIP Code': 'zip',
        'State': 'state',
    }

    constructor(page) {
        this.page = page

        // The title is a div, not a heading
        this.dialog = page.getByRole('dialog').filter({ hasText: 'New Site' })
        this.title = this.dialog.getByText('New Site', { exact: true })
        this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true })
        this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true })
        this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true })
        this.errors = this.dialog.locator('.form-group .validation-message')
    }

    async verifyOpen() {
        await expect(this.title).toBeVisible()
    }

    // `field` is a label from FIELDS, e.g. 'Billing Email'
    input(field) {
        return this.dialog.locator(`input[name="${NewSiteDialog.FIELDS[field]}"]`)
    }

    // `has` is matched inside each .form-group, so the input locator can't start from the dialog
    error(field) {
        const input = this.page.locator(`input[name="${NewSiteDialog.FIELDS[field]}"]`)
        return this.dialog.locator('.form-group').filter({ has: input }).locator('.validation-message')
    }

    async fillField(field, value) {
        const input = this.input(field)
        if (field === 'Phone No') {
            // Masked input that starts with "+1": type the 10 digits after it
            await input.click()
            await input.press('End')
            await input.pressSequentially(value.replace(/\D/g, ''))
            return
        }
        await input.fill(value)
    }

    // `data` uses the FIELDS labels as keys, e.g. newSiteData() from utils/sitedata.js
    async fill(data) {
        for (const [field, value] of Object.entries(data)) {
            await this.fillField(field, value)
        }
    }

    // Clicks Save when the form is expected to stay open (validation errors)
    async submit() {
        await this.saveButton.click()
    }

    async save() {
        await this.saveButton.click()
        return new SitesPage(this.page)
    }

    async cancel() {
        await this.cancelButton.click()
        return new SitesPage(this.page)
    }

    async close() {
        await this.closeButton.click()
        return new SitesPage(this.page)
    }
}

/** A site's details at /app/sites-detail/:id, opened from its row in the sites table. */
class SiteDetailsPage {
    constructor(page) {
        this.page = page

        this.main = page.getByRole('main')
        this.breadcrumbLink = this.main.getByRole('link', { name: 'Site /', exact: true })
        this.verificationBanner = this.main.getByRole('status')
        this.retryButton = this.main.getByRole('button', { name: 'Retry', exact: true })
    }

    // Breadcrumb "Site / <name>"
    siteName(name) {
        return this.main.getByText(name, { exact: true }).first()
    }

    status(text) {
        return this.main.getByText(text, { exact: true }).first()
    }

    async verifyPageLoaded(name) {
        await expect(this.page).toHaveURL(/\/app\/sites-detail\/[^/]+$/, { timeout: 60000 })
        await expect(this.breadcrumbLink).toBeVisible({ timeout: 60000 })
        await expect(this.siteName(name)).toBeVisible()
    }
}

module.exports = { SitesPage, NewSiteDialog, SiteDetailsPage }
