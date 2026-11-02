// created by AI
// spec: Test Artifacts/Sites/Sites_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { newSiteData } = require('../../utils/sitedata')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Sites', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  // Creates a site that can't be deleted, with a new NPI and EIN on every run
  test('SI-001 Create a site with new valid data @sites @smoke @positive', async ({ page }) => {
    const site = newSiteData()
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

    // Verification through Stedi can take a few seconds
    await expect(sitesAfterSave.toast.filter({ hasText: 'Site created' })).toHaveText('Site created and verified', { timeout: 30000 })
    await expect(dialog.dialog).toBeHidden()
    // Other tests may add sites at the same time, so the count only has to go up
    await expect.poll(() => sitesAfterSave.getSiteCount()).toBeGreaterThan(countBefore)

    const row = sitesAfterSave.row(name)
    await expect(row).toBeVisible()
    await expect(row.getByRole('cell').nth(1)).toHaveText(site['Address'])
    await expect(row.getByRole('cell').nth(2)).toHaveText(site['City'])
    await expect(row.getByRole('cell').nth(3)).toHaveText(site['State'])
    await expect(row.getByRole('cell').nth(4)).toHaveText(site['ZIP Code'])
    await expect(sitesAfterSave.statusCell(row)).toHaveText('Active')

    const detailsPage = await sitesAfterSave.openSite(name)
    await detailsPage.verifyPageLoaded(name)
    await expect(detailsPage.status('Active')).toBeVisible()
    await expect(detailsPage.main.getByText('Verification failed')).toHaveCount(0)
  })
})
