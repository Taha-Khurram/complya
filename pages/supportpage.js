// created by AI
const { BasePage } = require('./basepage')

class SupportPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/contact/support'
        this.title = 'Contact Support | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: "We're here to help.", exact: true })
    }
}

module.exports = { SupportPage }
