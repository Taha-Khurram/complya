// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-006 App Store link opens new tab with correct URL @P1', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    const appStorePage = await homePage.clickAppStore()
    await expect(appStorePage).toHaveURL(/apps\.apple\.com\/us\/app\/complya\/id6760423936/)
    await expect(page).toHaveURL(/\/home$/)
  })
})
