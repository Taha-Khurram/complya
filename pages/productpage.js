// created by AI
const { BasePage } = require('./basepage')

/** Platform overview and product-area pages. Pass the page path, e.g. new ProductPage(page, '/product/ai'). */
class ProductPage extends BasePage {
    static PAGES = {
        '/platform': { title: 'The AI-Native ABA Practice Platform | Complya', heading: 'One record for the whole practice.' },
        '/product/ai': { title: 'AI Session Notes & Progress Reports for ABA | Complya', heading: 'Notes and reports, drafted in minutes.' },
        '/product/ai/agents': { title: 'Complya AI Agents for ABA Practices | Complya', heading: 'The answer, and the next step.' },
        '/product/clinical': { title: 'ABA Data Collection, Goals & Live Supervision | Complya', heading: 'Great care runs on great data.' },
        '/product/compliance': { title: 'ABA Compliance: Approvals, Audits & Credentials | Complya', heading: 'Compliance should be continuous.' },
        '/product/revenue': { title: 'ABA Billing, Benefits Verification & Claims | Complya', heading: 'Every hour delivered. Every hour paid.' },
        '/product/operations': { title: 'ABA Scheduling & Practice Operations | Complya', heading: 'Scheduling, records and teams, in one place.' },
        '/product/insights': { title: 'ABA Reporting & Practice Analytics | Complya', heading: 'Your whole practice, in ten reports.' },
    }

    constructor(page, path) {
        super(page)

        const { title, heading } = ProductPage.PAGES[path]
        this.path = path
        this.title = title
        this.heading = page.getByRole('heading', { level: 1, name: heading, exact: true })
    }
}

module.exports = { ProductPage }
