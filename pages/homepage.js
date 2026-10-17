const { expect } = require('@playwright/test')

class HomePage {
    constructor(page) {
        this.page = page

        // Navigation
        this.navLogo = page.getByRole('navigation').getByRole('link', { name: 'Complya logo' })
        this.loginLink = page.getByRole('link', { name: 'Login' })
        this.navBookDemoLink = page.getByRole('navigation').getByRole('link', { name: 'Book a demo' })

        // Hero
        this.heroHeading = page.getByRole('heading', { name: 'The All-in-One Platform for Modern Care Management' })
        this.heroBookDemoLink = page.getByRole('main').getByRole('link', { name: 'Book a demo' })

        // Smarter Workflow Management
        this.workflowHeading = page.getByRole('heading', { name: 'Smarter Workflow Management' })
        this.appStoreLink = page.getByRole('link', { name: 'Download on the App Store' })
        this.googlePlayLink = page.getByRole('link', { name: 'Get Complya on Google Play' })

        // Footer
        this.footerLogo = page.getByRole('contentinfo').getByRole('link', { name: 'Complya logo' })
        this.footerHomepageLink = page.getByRole('link', { name: 'Homepage' })
        this.footerDownloadAppLink = page.getByRole('link', { name: 'Download App' })
        this.footerSupportLink = page.getByRole('link', { name: 'Support' })
        this.footerMsaLink = page.getByRole('link', { name: 'MSA - Master Service Agreement' })
        this.footerBaaLink = page.getByRole('link', { name: 'BAA - Business Associate Agreement' })
        this.footerPrivacyLink = page.getByRole('link', { name: 'Privacy' })
        this.footerTermsLink = page.getByRole('link', { name: 'Terms of Service' })
        this.footerDocumentLink = page.getByRole('link', { name: 'Document' })
        this.copyrightText = page.getByText('© 2026 Complya')
    }

    async goto() {
        await this.page.goto('/')
    }

    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/home/)
        await expect(this.heroHeading).toBeVisible()
    }

    // Navigation
    async clickNavLogo() {
        await this.navLogo.click()
    }

    async clickLogin() {
        await this.loginLink.click()
    }

    async clickNavBookDemo() {
        await this.navBookDemoLink.click()
    }

    // Hero
    async clickHeroBookDemo() {
        await this.heroBookDemoLink.click()
    }

    // Smarter Workflow Management (these open a new tab and return it)
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

    // Footer
    async clickFooterLogo() {
        await this.footerLogo.click()
    }

    async clickFooterHomepage() {
        await this.footerHomepageLink.click()
    }

    async clickDownloadApp() {
        await this.footerDownloadAppLink.click()
    }

    async clickSupport() {
        await this.footerSupportLink.click()
    }

    async clickMsa() {
        await this.footerMsaLink.click()
    }

    async clickBaa() {
        await this.footerBaaLink.click()
    }

    async clickPrivacy() {
        await this.footerPrivacyLink.click()
    }

    async clickTerms() {
        await this.footerTermsLink.click()
    }

    async clickDocument() {
        await this.footerDocumentLink.click()
    }
}

module.exports = { HomePage }
