// created by AI
const { expect } = require('@playwright/test')

/**
 * Shared header and footer of every complya.dev page.
 * Subclasses set `path`, `title` and `heading` (the page h1) for goto() and verifyPageLoaded().
 */
class BasePage {
    constructor(page) {
        this.page = page

        // Header
        this.header = page.getByRole('banner')
        this.primaryNav = page.getByRole('navigation', { name: 'Primary' })

        // Footer
        this.footer = page.getByRole('contentinfo')
        this.footerNav = page.getByRole('navigation', { name: 'Footer' })
    }

    async goto(path = this.path) {
        await this.page.goto(path)
        return this
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(this.path)
        await expect(this.page).toHaveTitle(this.title)
        await expect(this.heading).toBeVisible()
        await expect(this.header).toBeVisible()
        await expect(this.footer).toBeAttached()
    }
}

module.exports = { BasePage }
