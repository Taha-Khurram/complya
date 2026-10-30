// created by AI
const { BasePage } = require('./basepage')

/** Legal hub and legal documents. Pass the page path, e.g. new LegalPage(page, '/msa'). */
class LegalPage extends BasePage {
    static PAGES = {
        '/legal': { title: 'Legal: Agreements and Policies | Complya', heading: 'Agreements and policies' },
        '/msa': { title: 'Master Service Agreement | Complya', heading: 'Master Service Agreement' },
        '/baa': { title: 'Business Associate Agreement | Complya', heading: 'Business Associate Agreement' },
        '/terms': { title: 'Terms of Service | Complya', heading: 'Terms of Service' },
        '/privacy': { title: 'Privacy Policy | Complya', heading: 'Privacy Policy' },
        '/legal/subprocessors': { title: 'Subprocessors | Complya', heading: 'Subprocessors' },
        '/legal/cookies': { title: 'Cookie Policy | Complya', heading: 'Cookie Policy' },
    }

    constructor(page, path) {
        super(page)

        const { title, heading } = LegalPage.PAGES[path]
        this.path = path
        this.title = title
        this.heading = page.getByRole('heading', { level: 1, name: heading, exact: true })
    }
}

module.exports = { LegalPage }
