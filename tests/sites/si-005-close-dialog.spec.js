// created by AI
// spec: Test Artifacts/Sites/Sites_BDD_Scenarios.md
// seed: tests/seed.spec.js
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Sites', () => {
  test.skip(!process.env.WORKSPACE_EMAIL || !process.env.WORKSPACE_PASSWORD, 'WORKSPACE_EMAIL and WORKSPACE_PASSWORD are not set')

  for (const button of ['Cancel', 'Close']) {
    test(`SI-005 Closing the dialog does not create a site - ${button} @sites @positive`, async ({ page }) => {
      const name = `QA Discard ${Date.now()}`

      const loginPage = await new LoginPage(page).goto()
      const dashboardPage = await loginPage.login(process.env.WORKSPACE_EMAIL, process.env.WORKSPACE_PASSWORD)
      await dashboardPage.dismissTour()
      const settingsPage = await dashboardPage.clickSettings()
      const sitesPage = await settingsPage.openSites()
      await sitesPage.verifyPageLoaded()

      const dialog = await sitesPage.clickAdd()
      await dialog.fillField('Site Name', name)
      const sitesAfterClose = button === 'Cancel' ? await dialog.cancel() : await dialog.close()

      await expect(dialog.dialog).toBeHidden()
      await expect(sitesAfterClose.row(name)).toHaveCount(0)

      const reopened = await sitesAfterClose.clickAdd()
      await expect(reopened.input('Site Name')).toHaveValue('')
    })
  }
})
