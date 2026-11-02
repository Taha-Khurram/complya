// created by AI
// spec: Test Artifacts/Sites/Sites_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

// In the order the fields appear in the New Site dialog
const REQUIRED_MESSAGES = [
  'Site Name is required',
  'NPI is required',
  'EIN is required',
  'Phone No is required',
  'Billing email is required',
  'Address is required',
  'City is required',
  'ZIP is required',
  'State is required',
]

test.describe('Sites', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  test('SI-003 Required fields are enforced @sites @smoke @negative', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
    await dashboardPage.dismissTour()
    const settingsPage = await dashboardPage.clickSettings()
    const sitesPage = await settingsPage.openSites()
    await sitesPage.verifyPageLoaded()

    const dialog = await sitesPage.clickAdd()
    await dialog.submit()

    await expect(dialog.errors).toHaveText(REQUIRED_MESSAGES)
    await expect(dialog.title).toBeVisible()

    await dialog.cancel()
    await expect(dialog.dialog).toBeHidden()
  })
})
