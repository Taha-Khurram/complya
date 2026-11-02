// created by AI
// spec: Test Artifacts/Settings/Settings_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { SettingsPage } = require('../../pages/settingspage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

// Goals Library has no back button
const CARDS = Object.keys(SettingsPage.CARDS).filter((card) => card !== 'Goals Library')

test.describe('Settings', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  for (const card of CARDS) {
    test(`ST-003 Back button returns to Settings - ${card} @settings @positive`, async ({ page }) => {
      const loginPage = await new LoginPage(page).goto()
      const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
      await dashboardPage.dismissTour()
      const settingsPage = await dashboardPage.clickSettings()
      const cardPage = await settingsPage.openCard(card)
      await cardPage.verifyPageLoaded()

      const backToSettings = await cardPage.clickBack()
      await backToSettings.verifyPageLoaded()
    })
  }
})
