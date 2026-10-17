# Home Page: POM Plan

Status: **waiting for approval**. Nothing in `pages/homepage.js` has been changed yet.

## What was explored

- Base URL from `playwright.config.js`: `https://complya.dev`
- Opening it redirects to `https://complya.dev/home` (page title: `Complya`)
- The page has 4 parts: top navigation, hero section, "Smarter Workflow Management" section, and the footer.

### Things to know

- **"Book a demo"** appears twice (navigation and hero). Each locator is scoped to its section so it matches exactly one element.
- **The Complya logo link** appears twice (navigation and footer). It is also scoped to its section.
- **App Store** and **Google Play** links open in a **new tab** (`target="_blank"`). Their methods wait for the new tab and return it.
- **Login** goes to another site: `https://app.complya.dev/app/`.

## File changes

### `pages/homepage.js`

1. Replace the current line `import {expect} from 'playwright/test'` with `const { expect } = require('@playwright/test')`.
   Reason: the project uses CommonJS (`require`), and CLAUDE.md says to import `expect` from `@playwright/test`. The `import` syntax would fail.
2. Add a `HomePage` class and export it with `module.exports = { HomePage }`.

No other files are changed.

## Locators

All locators use `getByRole` with the visible name, as Playwright codegen generates them.

### Navigation (top bar)

| Property | Locator | Element |
|---|---|---|
| `navLogo` | `page.getByRole('navigation').getByRole('link', { name: 'Complya logo' })` | Logo link → `/home` |
| `loginLink` | `page.getByRole('link', { name: 'Login' })` | Login → `https://app.complya.dev/app/` |
| `navBookDemoLink` | `page.getByRole('navigation').getByRole('link', { name: 'Book a demo' })` | Book a demo (top bar) → `/home/requestdemo` |

### Hero section

| Property | Locator | Element |
|---|---|---|
| `heroHeading` | `page.getByRole('heading', { name: 'The All-in-One Platform for Modern Care Management' })` | Main h1 heading |
| `heroBookDemoLink` | `page.getByRole('main').getByRole('link', { name: 'Book a demo' })` | Book a demo (hero button) → `/home/requestdemo` |

### Smarter Workflow Management section

| Property | Locator | Element |
|---|---|---|
| `workflowHeading` | `page.getByRole('heading', { name: 'Smarter Workflow Management' })` | Section h2 heading |
| `appStoreLink` | `page.getByRole('link', { name: 'Download on the App Store' })` | App Store (new tab) |
| `googlePlayLink` | `page.getByRole('link', { name: 'Get Complya on Google Play' })` | Google Play (new tab) |

### Footer

| Property | Locator | Element |
|---|---|---|
| `footerLogo` | `page.getByRole('contentinfo').getByRole('link', { name: 'Complya logo' })` | Logo link → `/home` |
| `footerHomepageLink` | `page.getByRole('link', { name: 'Homepage' })` | Homepage → `/home` |
| `footerDownloadAppLink` | `page.getByRole('link', { name: 'Download App' })` | Download App → `/home/download` |
| `footerSupportLink` | `page.getByRole('link', { name: 'Support' })` | Support → `/home/contact` |
| `footerMsaLink` | `page.getByRole('link', { name: 'MSA - Master Service Agreement' })` | MSA → `/home/msa` |
| `footerBaaLink` | `page.getByRole('link', { name: 'BAA - Business Associate Agreement' })` | BAA → `/home/baa` |
| `footerPrivacyLink` | `page.getByRole('link', { name: 'Privacy' })` | Privacy → `/home/privacy` |
| `footerTermsLink` | `page.getByRole('link', { name: 'Terms of Service' })` | Terms of Service → `/home/terms` |
| `footerDocumentLink` | `page.getByRole('link', { name: 'Document' })` | Document → `/home/docs` |
| `copyrightText` | `page.getByText('© 2026 Complya')` | Copyright text |

## Methods

Each method does one thing.

| Method | What it does |
|---|---|
| `constructor(page)` | Saves `page` and creates all the locators above |
| `goto()` | `await this.page.goto('/')` (uses the base URL) |
| `verifyPageLoaded()` | Checks the URL contains `/home` and `heroHeading` is visible |
| `clickNavLogo()` | Clicks `navLogo` |
| `clickLogin()` | Clicks `loginLink` |
| `clickNavBookDemo()` | Clicks `navBookDemoLink` |
| `clickHeroBookDemo()` | Clicks `heroBookDemoLink` |
| `clickAppStore()` | Clicks `appStoreLink`, waits for the new tab, and returns it |
| `clickGooglePlay()` | Clicks `googlePlayLink`, waits for the new tab, and returns it |
| `clickFooterLogo()` | Clicks `footerLogo` |
| `clickFooterHomepage()` | Clicks `footerHomepageLink` |
| `clickDownloadApp()` | Clicks `footerDownloadAppLink` |
| `clickSupport()` | Clicks `footerSupportLink` |
| `clickMsa()` | Clicks `footerMsaLink` |
| `clickBaa()` | Clicks `footerBaaLink` |
| `clickPrivacy()` | Clicks `footerPrivacyLink` |
| `clickTerms()` | Clicks `footerTermsLink` |
| `clickDocument()` | Clicks `footerDocumentLink` |

`clickAppStore()` and `clickGooglePlay()` use Playwright's standard new-tab pattern:

```js
const popupPromise = this.page.waitForEvent('popup')
await this.appStoreLink.click()
return await popupPromise
```

## Code preview

```js
const { expect } = require('@playwright/test')

class HomePage {
  constructor(page) {
    this.page = page

    // Navigation
    this.navLogo = page.getByRole('navigation').getByRole('link', { name: 'Complya logo' })
    this.loginLink = page.getByRole('link', { name: 'Login' })
    this.navBookDemoLink = page.getByRole('navigation').getByRole('link', { name: 'Book a demo' })

    // Hero
    this.heroHeading = page.getByRole('heading', { name: 'The All-in-One Platform for Modern Care Management' })
    this.heroBookDemoLink = page.getByRole('main').getByRole('link', { name: 'Book a demo' })

    // ...remaining locators from the tables above
  }

  async goto() {
    await this.page.goto('/')
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/home/)
    await expect(this.heroHeading).toBeVisible()
  }

  async clickLogin() {
    await this.loginLink.click()
  }

  // ...remaining click methods from the table above
}

module.exports = { HomePage }
```

## Out of scope

- No spec file. Tests that use `HomePage` can be added in a later step.
- The pages that the links go to (request demo, download, contact, and so on) are not explored here.
