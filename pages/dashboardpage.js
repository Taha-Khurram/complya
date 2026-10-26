// created by AI

/** Complya app landing page after login (/app/, heading "Home"). */
class DashboardPage {
    constructor(page) {
        this.page = page

        this.homeHeading = page.getByRole('heading', { name: 'Home', exact: true })
    }
}

module.exports = { DashboardPage }
