// created by AI
const { BasePage } = require('./basepage')

/** Solutions (role) pages. Pass the page path, e.g. new SolutionPage(page, '/solutions/owners'). */
class SolutionPage extends BasePage {
    static PAGES = {
        '/solutions/owners': { title: 'ABA Practice Software for Owners & Executives | Complya', heading: 'Grow your practice and get paid for every hour.' },
        '/solutions/clinical-leaders': { title: 'ABA Software for BCBAs & Clinical Directors | Complya', heading: 'Lead care with every session in view.' },
        '/solutions/therapists': { title: 'ABA Data Collection App for RBTs & Therapists | Complya', heading: 'Stay present with your client.' },
        '/solutions/billing': { title: 'ABA Billing Software for Revenue Teams | Complya', heading: 'Clean claims, followed to payment.' },
    }

    constructor(page, path) {
        super(page)

        const { title, heading } = SolutionPage.PAGES[path]
        this.path = path
        this.title = title
        this.heading = page.getByRole('heading', { level: 1, name: heading, exact: true })
    }
}

module.exports = { SolutionPage }
