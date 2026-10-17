# Complya Home Page Test Plan

## Application Overview

Scope: the Complya home page (base URL https://complya.dev, redirects to https://complya.dev/home), limited to the elements and methods in pages/homepage.js (class HomePage). Seed: tests/seed.spec.ts. Link names, link targets and new-tab behaviour were verified in a live browser with the Playwright MCP during home page exploration.

## Priority legend
- P0 = critical business flow (page load, redirect, hero heading, Login, Book a demo links)
- P1 = high (important links and features: store links, footer legal/support/download/docs links)
- P2 = medium/low (cosmetic or secondary: logo links, footer Homepage link, section heading, copyright)

Global preconditions: fresh browser context, no cookies, no login. Tests use the HomePage POM with baseURL https://complya.dev. Each test starts with HomePage.goto() unless stated.

## Summary
| ID | Title | Priority |
|---|---|---|
| HP-001 | Root URL redirects to /home and page loads | P0 |
| HP-002 | Hero heading is visible | P0 |
| HP-003 | Login link opens the app login | P0 |
| HP-004 | Nav Book a demo opens request demo page | P0 |
| HP-005 | Hero Book a demo opens request demo page | P0 |
| HP-006 | App Store link opens new tab with correct URL | P1 |
| HP-007 | Google Play link opens new tab with correct URL | P1 |
| HP-008 | Footer Download App link | P1 |
| HP-009 | Footer Support link | P1 |
| HP-010 | Footer MSA link | P1 |
| HP-011 | Footer BAA link | P1 |
| HP-012 | Footer Privacy link | P1 |
| HP-013 | Footer Terms of Service link | P1 |
| HP-014 | Footer Document link | P1 |
| HP-015 | Destination pages load without error | P1 |
| HP-016 | Nav logo link returns to /home | P2 |
| HP-017 | Footer logo link returns to /home | P2 |
| HP-018 | Footer Homepage link | P2 |
| HP-019 | Smarter Workflow Management heading is visible | P2 |
| HP-020 | Copyright text is visible | P2 |

## Test Scenarios

### 1. P0 - Critical

**Seed:** `tests/seed.spec.ts`

#### 1.1. HP-001 [P0] Root URL redirects to /home and page loads (POM: goto, verifyPageLoaded)

**File:** `tests/home/hp-001-load-redirect.spec.js`

**Steps:**
  1. Call HomePage.goto() to open https://complya.dev/
    - expect: Browser is redirected to https://complya.dev/home
  2. Call HomePage.verifyPageLoaded()
    - expect: URL matches /\/home/
    - expect: Hero heading is visible
    - expect: No error page is shown

#### 1.2. HP-002 [P0] Hero heading is visible (POM: goto, verifyPageLoaded; locator heroHeading)

**File:** `tests/home/hp-002-hero-heading.spec.js`

**Steps:**
  1. Call HomePage.goto()
    - expect: Home page loads
  2. Assert heroHeading is visible
    - expect: h1 'The All-in-One Platform for Modern Care Management' is visible with exact text

#### 1.3. HP-003 [P0] Login link opens the app login (POM: clickLogin)

**File:** `tests/home/hp-003-login.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickLogin()
    - expect: Browser navigates to https://app.complya.dev/app/ (login screen renders, no error)

#### 1.4. HP-004 [P0] Nav Book a demo opens request demo page (POM: clickNavBookDemo)

**File:** `tests/home/hp-004-nav-book-demo.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickNavBookDemo()
    - expect: URL is https://complya.dev/home/requestdemo
    - expect: Request demo page renders without error

#### 1.5. HP-005 [P0] Hero Book a demo opens request demo page (POM: clickHeroBookDemo)

**File:** `tests/home/hp-005-hero-book-demo.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickHeroBookDemo()
    - expect: URL is https://complya.dev/home/requestdemo
    - expect: Request demo page renders without error

### 2. P1 - High

**Seed:** `tests/seed.spec.ts`

#### 2.1. HP-006 [P1] App Store link opens new tab with correct URL (POM: clickAppStore)

**File:** `tests/home/hp-006-app-store.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickAppStore() and capture the returned popup
    - expect: A new tab opens
    - expect: Popup URL contains apps.apple.com/us/app/complya/id6760423936
    - expect: Original tab stays on /home

#### 2.2. HP-007 [P1] Google Play link opens new tab with correct URL (POM: clickGooglePlay)

**File:** `tests/home/hp-007-google-play.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickGooglePlay() and capture the returned popup
    - expect: A new tab opens
    - expect: Popup URL contains play.google.com/store/apps/details?id=com.complya
    - expect: Original tab stays on /home

#### 2.3. HP-008 [P1] Footer Download App link (POM: clickDownloadApp)

**File:** `tests/home/hp-008-footer-download.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickDownloadApp()
    - expect: URL is https://complya.dev/home/download

#### 2.4. HP-009 [P1] Footer Support link (POM: clickSupport)

**File:** `tests/home/hp-009-footer-support.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickSupport()
    - expect: URL is https://complya.dev/home/contact

#### 2.5. HP-010 [P1] Footer MSA link (POM: clickMsa)

**File:** `tests/home/hp-010-footer-msa.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickMsa()
    - expect: URL is https://complya.dev/home/msa

#### 2.6. HP-011 [P1] Footer BAA link (POM: clickBaa)

**File:** `tests/home/hp-011-footer-baa.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickBaa()
    - expect: URL is https://complya.dev/home/baa

#### 2.7. HP-012 [P1] Footer Privacy link (POM: clickPrivacy)

**File:** `tests/home/hp-012-footer-privacy.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickPrivacy()
    - expect: URL is https://complya.dev/home/privacy

#### 2.8. HP-013 [P1] Footer Terms of Service link (POM: clickTerms)

**File:** `tests/home/hp-013-footer-terms.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickTerms()
    - expect: URL is https://complya.dev/home/terms

#### 2.9. HP-014 [P1] Footer Document link (POM: clickDocument)

**File:** `tests/home/hp-014-footer-document.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickDocument()
    - expect: URL is https://complya.dev/home/docs

#### 2.10. HP-015 [P1] Destination pages load without error (POM: clickDownloadApp, clickSupport, clickMsa, clickBaa, clickPrivacy, clickTerms, clickDocument, clickNavBookDemo)

**File:** `tests/home/hp-015-destinations-load.spec.js`

**Steps:**
  1. For each destination (requestdemo, download, contact, msa, baa, privacy, terms, docs): goto(), click the matching link, and check the navigation response and page body
    - expect: Each response status is below 400
    - expect: Page body is non-empty with no 404 or error text
    - expect: No uncaught console errors that block rendering

### 3. P2 - Medium/Low

**Seed:** `tests/seed.spec.ts`

#### 3.1. HP-016 [P2] Nav logo link returns to /home (POM: clickNavLogo)

**File:** `tests/home/hp-016-nav-logo.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
    - expect: Nav is visible with the Complya logo
  2. Call HomePage.clickNavLogo()
    - expect: URL is https://complya.dev/home
    - expect: Hero heading is visible

#### 3.2. HP-017 [P2] Footer logo link returns to /home (POM: clickFooterLogo)

**File:** `tests/home/hp-017-footer-logo.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickFooterLogo()
    - expect: URL is https://complya.dev/home
    - expect: Hero heading is visible

#### 3.3. HP-018 [P2] Footer Homepage link (POM: clickFooterHomepage)

**File:** `tests/home/hp-018-footer-homepage.spec.js`

**Steps:**
  1. Call HomePage.goto() and verifyPageLoaded()
    - expect: Home page loaded
  2. Call HomePage.clickFooterHomepage()
    - expect: URL is https://complya.dev/home
    - expect: Hero heading is visible

#### 3.4. HP-019 [P2] Smarter Workflow Management heading is visible (POM: goto, workflowHeading locator)

**File:** `tests/home/hp-019-workflow-heading.spec.js`

**Steps:**
  1. Call HomePage.goto() and scroll to workflowHeading
    - expect: h2 'Smarter Workflow Management' is visible

#### 3.5. HP-020 [P2] Copyright text is visible (POM: goto, copyrightText locator)

**File:** `tests/home/hp-020-copyright.spec.js`

**Steps:**
  1. Call HomePage.goto() and scroll to the footer
    - expect: Text '© 2026 Complya' is visible in the footer
