// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-004 Nav Book a demo opens request demo page @P0', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await homePage.clickNavBookDemo()
    await expect(page).toHaveURL(/\/home\/requestdemo/)
  })
})
