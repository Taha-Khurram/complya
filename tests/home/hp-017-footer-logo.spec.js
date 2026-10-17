// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-017 Footer logo link returns to /home @P2', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await homePage.clickFooterLogo()
    await expect(page).toHaveURL(/\/home$/)
    await expect(homePage.heroHeading).toBeVisible()
  })
})
