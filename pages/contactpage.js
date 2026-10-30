// created by AI
const { BasePage } = require('./basepage')

class ContactPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/contact'
        this.title = 'Contact Sales & Support | Complya'
        // The h1 is split into letters, so its accessible name is "H o w c a n w e h e l p ?"; match its text instead
        this.heading = page.getByRole('heading', { level: 1 }).filter({ hasText: 'How can we help?' })
    }
}

module.exports = { ContactPage }
