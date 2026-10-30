const { expect } = require('@playwright/test')
const { BasePage } = require('./basepage')
const { LoginPage } = require('./loginpage')
const { RequestDemoPage } = require('./requestdemopage')
const { PricingPage } = require('./pricingpage')
const { AboutPage } = require('./aboutpage')
const { SecurityPage } = require('./securitypage')
const { ContactPage } = require('./contactpage')
const { SupportPage } = require('./supportpage')
const { DownloadPage } = require('./downloadpage')
const { DocsPage } = require('./docspage')
const { ProductPage } = require('./productpage')
const { SolutionPage } = require('./solutionpage')
const { LegalPage } = require('./legalpage')

class HomePage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/'
        this.title = 'Complya | AI-Native ABA Practice Management Software'
        this.heading = page.getByRole('heading', { level: 1, name: 'Built for the people who provide care.', exact: true })

        // Header
        this.headerLogo = this.header.getByRole('link', { name: 'Complya home' })
        this.logInLink = this.header.getByRole('link', { name: 'Log in' })
        this.headerBookDemoLink = this.header.getByRole('link', { name: 'Book a demo' })

        // Main content ("Book a demo" appears in several sections, so those are scoped to their section)
        this.main = page.getByRole('main')
        this.heroSection = this.main.locator('section').filter({ has: this.heading })
        this.platformSection = this.main.locator('section')
            .filter({ has: page.getByRole('heading', { name: 'One system for the clinical work and the business.' }) })
        this.closingSection = this.main.locator('section')
            .filter({ has: page.getByRole('heading', { name: 'See Complya with sessions like yours.' }) })
        this.heroBookDemoLink = this.heroSection.getByRole('link', { name: 'Book a demo' })
        this.closingBookDemoLink = this.closingSection.getByRole('link', { name: 'Book a demo' })

        // Footer
        this.footerLogo = this.footer.getByRole('link', { name: 'Complya home' })
        this.appStoreLink = this.footer.getByRole('link', { name: 'Download Complya on the App Store' })
        this.googlePlayLink = this.footer.getByRole('link', { name: 'Get Complya on Google Play' })
    }

    // Clicks an internal link and returns the page object for its href
    async #follow(link) {
        const path = await link.getAttribute('href')
        await link.click()
        return pageFor(this.page, path)
    }

    // Header
    async clickHeaderLogo() {
        return this.#follow(this.headerLogo)
    }

    async clickHeaderLink(name) {
        return this.#follow(this.primaryNav.getByRole('link', { name, exact: true }))
    }

    async clickHeaderBookDemo() {
        return this.#follow(this.headerBookDemoLink)
    }

    async clickLogIn() {
        await this.logInLink.click()
        return new LoginPage(this.page)
    }

    // Product, Solutions and Company menus open on hover; closed panels are hidden
    async clickMenuLink(menu, name) {
        const menuButton = this.primaryNav.getByRole('button', { name: menu, exact: true })
        await menuButton.hover()
        await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
        return this.#follow(this.primaryNav.getByRole('link', { name }))
    }

    // Main content
    async clickHeroBookDemo() {
        return this.#follow(this.heroBookDemoLink)
    }

    async clickClosingBookDemo() {
        return this.#follow(this.closingBookDemoLink)
    }

    async clickMainLink(name) {
        return this.#follow(this.main.getByRole('link', { name, exact: true }))
    }

    async clickPlatformCard(path) {
        return this.#follow(this.platformSection.locator(`a[href="${path}"]`))
    }

    // Footer
    async clickFooterLogo() {
        return this.#follow(this.footerLogo)
    }

    async clickFooterLink(name) {
        return this.#follow(this.footerNav.getByRole('link', { name, exact: true }))
    }

    // App store links open a new tab and return it
    async clickAppStore() {
        const popupPromise = this.page.waitForEvent('popup')
        await this.appStoreLink.click()
        return await popupPromise
    }

    async clickGooglePlay() {
        const popupPromise = this.page.waitForEvent('popup')
        await this.googlePlayLink.click()
        return await popupPromise
    }
}

// Page object for each internal path the home page links to
function pageFor(page, path) {
    const pages = {
        '/': HomePage,
        '/requestdemo': RequestDemoPage,
        '/pricing': PricingPage,
        '/about': AboutPage,
        '/security': SecurityPage,
        '/contact': ContactPage,
        '/contact/support': SupportPage,
        '/download': DownloadPage,
        '/docs': DocsPage,
    }
    if (pages[path]) return new pages[path](page)
    for (const PageClass of [ProductPage, SolutionPage, LegalPage]) {
        if (path in PageClass.PAGES) return new PageClass(page, path)
    }
    throw new Error(`No page object for ${path}`)
}

module.exports = { HomePage }
