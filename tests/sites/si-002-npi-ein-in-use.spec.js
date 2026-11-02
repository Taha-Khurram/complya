// created by AI
// spec: Test Artifacts/Sites/Sites_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { newSiteData, DUPLICATE_NPI, DUPLICATE_EIN } = require('../../utils/sitedata')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

const FAILED_REASON = 'Another Complya organization already uses this NPI + EIN. Give this site its own NPI and EIN.'

test.describe('Sites', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  // Creates a site that can't be deleted
  test('SI-002 A site with an NPI and EIN already in use is created but not verified @sites @positive', async ({ page }) => {
    const site = { ...newSiteData(), 'NPI': DUPLICATE_NPI, 'EIN': DUPLICATE_EIN }
    const name = site['Site Name']

    const loginPage = await new LoginPage(page).goto()
    const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
    await dashboardPage.dismissTour()
    const settingsPage = await dashboardPage.clickSettings()
    const sitesPage = await settingsPage.openSites()
    await sitesPage.verifyPageLoaded()
    const countBefore = await sitesPage.getSiteCount()

    const dialog = await sitesPage.clickAdd()
    await dialog.fill(site)
    const sitesAfterSave = await dialog.save()

    await expect(sitesAfterSave.toast.filter({ hasText: 'Site created' })).toHaveText(`Site created, but verification failed: ${FAILED_REASON}`, { timeout: 30000 })
    await expect(dialog.dialog).toBeHidden()
    // Other tests may add sites at the same time, so the count only has to go up
    await expect.poll(() => sitesAfterSave.getSiteCount()).toBeGreaterThan(countBefore)

    const row = sitesAfterSave.row(name)
    await expect(row).toBeVisible()
    await expect(sitesAfterSave.statusCell(row)).toHaveText('Verification failed')

    const detailsPage = await sitesAfterSave.openSite(name)
    await detailsPage.verifyPageLoaded(name)
    await expect(detailsPage.status('Verification failed')).toBeVisible()
    await expect(detailsPage.verificationBanner).toContainText(FAILED_REASON)
    await expect(detailsPage.verificationBanner.getByRole('listitem')).toHaveText([
      /^NPI\s*is already used by another site$/,
      /^EIN\s*is already used by another site$/,
    ])
    await expect(detailsPage.retryButton).toBeVisible()
  })
})
