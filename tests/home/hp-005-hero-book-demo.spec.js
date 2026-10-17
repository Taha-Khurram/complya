// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-005 Hero Book a demo opens request demo page @P0', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await homePage.clickHeroBookDemo()
    await expect(page).toHaveURL(/\/home\/requestdemo/)
  })
})
