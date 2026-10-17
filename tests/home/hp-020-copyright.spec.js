// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-020 Copyright text is visible @P2', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await expect(homePage.copyrightText).toBeVisible()
  })
})
