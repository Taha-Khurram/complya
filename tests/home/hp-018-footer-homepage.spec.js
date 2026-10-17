// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-018 Footer Homepage link @P2', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await homePage.clickFooterHomepage()
    await expect(page).toHaveURL(/\/home$/)
    await expect(homePage.heroHeading).toBeVisible()
  })
})
