// created by AI
// spec: Test Artifacts/Settings/Settings_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { SettingsPage } = require('../../pages/settingspage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Settings', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  for (const card of Object.keys(SettingsPage.CARDS)) {
    test(`ST-002 Settings card opens its page - ${card} @settings @smoke @positive`, async ({ page }) => {
      const loginPage = await new LoginPage(page).goto()
      const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
      await dashboardPage.dismissTour()
      const settingsPage = await dashboardPage.clickSettings()
      await settingsPage.verifyPageLoaded()

      const cardPage = await settingsPage.openCard(card)
      await cardPage.verifyPageLoaded()
    })
  }
})
