// created by AI
// spec: Test Artifacts/Settings/Settings_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { SettingsPage } = require('../../pages/settingspage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Settings', () => {
  // The only Settings test that opens a URL directly: a signed-out user can't reach Settings from the UI
  test('ST-004 Settings is not available when signed out @settings @smoke @negative', async ({ page }) => {
    const settingsPage = new SettingsPage(page)
    const loginPage = await settingsPage.gotoSignedOut()

    await loginPage.verifyPageLoaded()
    await expect(settingsPage.heading).toHaveCount(0)
  })
})
