// created by AI
const { BasePage } = require('./basepage')

class DocsPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/docs'
        this.title = 'Help Docs: Overview | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: 'Overview', exact: true })
    }
}

module.exports = { DocsPage }
