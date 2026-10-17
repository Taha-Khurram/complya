require('dotenv').config()
const base = require('@playwright/test')
const path = require('path')
const cp = require('child_process')
const { createInbox, deleteInbox } = require('./utils/mailslurp')

const playwrightClientVersion = cp
  .execSync('npx playwright --version').toString().trim().split(' ')[1]

const capabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: 'Windows 10',
    build: 'My Playwright Build',
    name: 'Playwright Test',
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false,
    playwrightClientVersion
  }
}

const modifyCapabilities = (projectName, testName) => {
  const [browserName, browserVersion, platform] =
    projectName.split('@lambdatest')[0].split(':')
  if (browserName) capabilities.browserName = browserName
  if (browserVersion) capabilities.browserVersion = browserVersion
  if (platform) capabilities['LT:Options'].platform = platform
  capabilities['LT:Options'].name = testName
}

// Config values can be a string ('on') or an object ({ mode: 'on' })
const modeOf = (option) => (typeof option === 'string' ? option : option?.mode) || 'off'

// Should this artifact be recorded for this attempt?
const shouldRecord = (mode, testInfo) =>
  mode === 'on' ||
  mode === 'retain-on-failure' ||
  mode === 'only-on-failure' ||
  (mode === 'on-first-retry' && testInfo.retry === 1) ||
  (mode === 'on-all-retries' && testInfo.retry > 0)

// Once the test has finished, should the recording be kept?
const shouldKeep = (mode, testInfo) => {
  const failed = testInfo.status !== testInfo.expectedStatus
  if (mode === 'retain-on-failure' || mode === 'only-on-failure') return failed
  return true
}

exports.test = base.test.extend({
  page: async ({ playwright, baseURL }, use, testInfo) => {
    const isLambdaTest = testInfo.project.name.includes('@lambdatest')
    const { viewport, headless } = testInfo.project.use
    const videoMode = modeOf(testInfo.project.use.video)
    // Playwright video needs ffmpeg on the machine running the browser, which LambdaTest
    // doesn't have, so it's local only. LambdaTest records its own video (`video: true` above).
    const recordVideo = !isLambdaTest && shouldRecord(videoMode, testInfo)

    // LambdaTest projects connect to the cloud; anything else runs on local Chromium
    let browser
    if (isLambdaTest) {
      modifyCapabilities(
        testInfo.project.name,
        `${testInfo.title} - ${testInfo.file.split(path.sep).pop()}`
      )
      browser = await playwright.chromium.connect(
        `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
      )
    } else {
      browser = await playwright.chromium.launch({ headless: headless ?? true })
    }

    // `finally` blocks make sure the context and browser are closed even if a step fails,
    // so LambdaTest sessions don't stay open until they time out
    try {
      const context = await browser.newContext({
        viewport,
        baseURL,
        ...(recordVideo && { recordVideo: { dir: testInfo.outputPath('videos'), size: viewport } })
      })
      // Traces and screenshots are recorded by Playwright itself from the `trace` and `screenshot` config options
      const page = await context.newPage()

      try {
        await use(page)

        // Send pass/fail to the LambdaTest dashboard
        if (isLambdaTest) {
          const testStatus = {
            action: 'setTestStatus',
            arguments: {
              status: testInfo.status,
              remark: testInfo.error?.stack || testInfo.error?.message
            }
          }
          await page.evaluate(() => {}, `lambdatest_action: ${JSON.stringify(testStatus)}`)
        }
      } finally {
        // The video file is only complete once the context is closed
        await context.close()
      }

      if (recordVideo) {
        const video = page.video()
        if (shouldKeep(videoMode, testInfo)) {
          try {
            const videoPath = testInfo.outputPath('video.webm')
            await video.saveAs(videoPath)
            await testInfo.attach('video', { path: videoPath, contentType: 'video/webm' })
          } catch (error) {
            console.warn(`Could not save video: ${error.message}`)
          }
        }
        await video.delete().catch(() => {})
      }
    } finally {
      await browser.close()
    }
  },

  // Fresh MailSlurp inbox per test, deleted afterwards even if the test fails.
  // Only created when a test asks for `inbox`, so other tests use no quota.
  inbox: async ({}, use) => {
    const inbox = await createInbox()
    try {
      await use(inbox)
    } finally {
      await deleteInbox(inbox.id)
    }
  }
})
