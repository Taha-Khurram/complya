// created by AI
const { expect } = require('@playwright/test')
const { SitesPage } = require('./sitespage')

// The sidebar expands while hovered and covers the left of the page (the first card and the back button),
// and the mouse is often left over it after a click, so move it onto the page content first
const moveOffSidebar = async (page) => {
    await page.getByRole('main').hover()
}

/** Settings at /app/settings: one card per settings page. */
class SettingsPage {
    // Card name → the URL its page opens at (each page's heading is the card name)
    static CARDS = {
        'Sites': /\/app\/sites$/,
        'Plans': /\/app\/plans$/,
        'Legal & Compliance': /\/app\/legal-compliance$/,
        'Services': /\/app\/servicetypes$/,
        'Goals Library': /\/app\/catalog\?tab=private$/,
        'Note Templates': /\/app\/note-templates\?tab=SESSION_NOTE&page=1&limit=20$/,
        'Notifications': /\/app\/notification-settings$/,
        'Audit Logs': /\/app\/activity$/,
        'Prompt Library': /\/app\/prompt-library\?page=1&limit=20$/,
        'Copilot': /\/app\/settings\/copilot$/,
    }

    constructor(page) {
        this.page = page

        this.main = page.getByRole('main')
        this.heading = this.main.getByRole('heading', { level: 6, name: 'Settings', exact: true })
        // Cards are plain divs (no link role), so each one is found by its h5 title
        this.cardTitles = this.main.getByRole('heading', { level: 5 })
    }

    // Only for checking signed-out access, which redirects to the login page: the tests reach Settings from the sidebar
    async gotoSignedOut() {
        // Required here because loginpage → dashboardpage → settingspage would be circular at load time
        const { LoginPage } = require('./loginpage')
        await this.page.goto('/app/settings', { waitUntil: 'domcontentloaded' })
        return new LoginPage(this.page)
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/settings$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    card(name) {
        return this.main.getByRole('heading', { level: 5, name, exact: true })
    }

    async openCard(name) {
        await moveOffSidebar(this.page)
        await this.card(name).click()
        return new SettingsSubPage(this.page, name)
    }

    async openSites() {
        await moveOffSidebar(this.page)
        await this.card('Sites').click()
        return new SitesPage(this.page)
    }
}

/** A page opened from a Settings card, e.g. new SettingsSubPage(page, 'Sites'). */
class SettingsSubPage {
    constructor(page, name) {
        this.page = page

        this.name = name
        this.url = SettingsPage.CARDS[name]
        this.heading = page.getByRole('main').getByRole('heading', { level: 6, name, exact: true })
        // Arrow button next to the heading; it has no accessible name. Goals Library has none
        this.backButton = page.locator('main .back-btn-wrapper button')
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(this.url, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }

    async clickBack() {
        await moveOffSidebar(this.page)
        await this.backButton.click()
        return new SettingsPage(this.page)
    }
}

module.exports = { SettingsPage, SettingsSubPage }
