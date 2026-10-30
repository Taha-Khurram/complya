// created by AI
const { BasePage } = require('./basepage')

class RequestDemoPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/requestdemo'
        this.title = 'Book a Demo | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: 'Tell us about your practice.', exact: true })
    }
}

module.exports = { RequestDemoPage }
