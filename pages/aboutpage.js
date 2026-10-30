// created by AI
const { BasePage } = require('./basepage')

class AboutPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/about'
        this.title = 'Our Story & Principles | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: "Built by people who've run care organizations.", exact: true })
    }
}

module.exports = { AboutPage }
