// created by AI
const { SettingsPage } = require('./settingspage')

/** Complya app landing page after login (/app/, heading "Home"). */
class DashboardPage {
    constructor(page) {
        this.page = page

        this.homeHeading = page.getByRole('heading', { name: 'Home', exact: true })
        this.closeTourButton = page.getByRole('button', { name: 'Close Tour', exact: true })
        // The sidebar link is named "Settings icon" when collapsed and "Settings icon Settings" when expanded
        this.settingsLink = page.getByRole('link', { name: /^Settings icon/ })
    }

    // The product tour ("1 of 13") can open over Home and block clicks; close it whenever it shows
    async dismissTour() {
        await this.page.addLocatorHandler(this.closeTourButton, (button) => button.click())
        return this
    }

    async clickSettings() {
        await this.settingsLink.click()
        return new SettingsPage(this.page)
    }
}

module.exports = { DashboardPage }
