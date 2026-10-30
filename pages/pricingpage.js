// created by AI
const { BasePage } = require('./basepage')

class PricingPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/pricing'
        this.title = 'ABA Software Pricing: One Plan, AI Included | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: 'One plan. Every feature. AI included.', exact: true })
    }
}

module.exports = { PricingPage }
