// created by AI
const { BasePage } = require('./basepage')

class SecurityPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/security'
        this.title = 'Security & HIPAA Compliance | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: "Your clients' records, protected.", exact: true })
    }
}

module.exports = { SecurityPage }
