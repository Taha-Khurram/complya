// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-007 Google Play link opens new tab with correct URL @P1', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    const googlePlayPage = await homePage.clickGooglePlay()
    await expect(googlePlayPage).toHaveURL(/play\.google\.com\/store\/apps\/details\?id=com\.complya/)
    await expect(page).toHaveURL(/\/home$/)
  })
})
