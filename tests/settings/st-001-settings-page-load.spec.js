// created by AI
// spec: Test Artifacts/Settings/Settings_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { SettingsPage } = require('../../pages/settingspage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Settings', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  test('ST-001 Settings opens from the sidebar @settings @smoke @positive', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
    await dashboardPage.dismissTour()

    const settingsPage = await dashboardPage.clickSettings()
    await settingsPage.verifyPageLoaded()
    await expect(settingsPage.cardTitles).toHaveText(Object.keys(SettingsPage.CARDS))
  })
})
