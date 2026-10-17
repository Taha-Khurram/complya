// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page', () => {
  test('HP-013 Footer Terms of Service link @P1', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.verifyPageLoaded()
    await homePage.clickTerms()
    await expect(page).toHaveURL(/\/home\/terms/)
  })
})
