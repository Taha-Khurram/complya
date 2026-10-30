// created by AI
const { expect } = require('@playwright/test')

/** First onboarding screen a new account sees after its first login, /app/review-terms. */
class OnboardingPage {
    constructor(page) {
        this.page = page

        this.heading = page.getByRole('heading', { name: 'Review our terms', exact: true })
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    }

    // The app bundle can take 30s+ to load, so allow a long wait
    async verifyPageLoaded() {
        await expect(this.page).toHaveURL(/\/app\/review-terms$/, { timeout: 60000 })
        await expect(this.heading).toBeVisible({ timeout: 60000 })
    }
}

module.exports = { OnboardingPage }
