// created by AI
// spec: Test Artifacts/Sites/Sites_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

const INVALID_VALUES = [
  { field: 'NPI', value: '123', message: 'NPI must be exactly 10 digits' },
  { field: 'EIN', value: '12', message: 'EIN must be in the format XX-XXXXXXX' },
  { field: 'Billing Email', value: 'not-an-email', message: 'Billing email must be a valid email' },
]

test.describe('Sites', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  for (const { field, value, message } of INVALID_VALUES) {
    test(`SI-004 Invalid format is rejected - ${field} @sites @negative`, async ({ page }) => {
      const loginPage = await new LoginPage(page).goto()
      const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
      await dashboardPage.dismissTour()
      const settingsPage = await dashboardPage.clickSettings()
      const sitesPage = await settingsPage.openSites()
      await sitesPage.verifyPageLoaded()

      const dialog = await sitesPage.clickAdd()
      await dialog.fillField(field, value)
      await dialog.submit()

      await expect(dialog.error(field)).toHaveText(message)
      await expect(dialog.title).toBeVisible()
    })
  }
})
