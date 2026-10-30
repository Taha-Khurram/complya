# Complya Home Page - Navigation and Page Load Test Plan

| | |
|---|---|
| **Feature** | Home page navigation: every link on the home page opens the correct page, and that page loads |
| **URL tested** | https://complya.dev/ (staging marketing site, the global `baseURL`) |
| **Automation** | `tests/home/hp-00x-*.spec.js` using `pages/homepage.js` and the destination page objects in `pages/` |
| **Date** | 2026-10-30 |
| **Scope** | In: home page load, the legacy `/home` redirect, header, header menus, main content and footer links, App Store and Google Play links. Out: forms, role tabs, FAQ, demo widget, pricing slider, mobile menu, visual/layout, content of destination pages beyond their heading. |
| **Feature file** | `Test Artifacts/Home/home.feature` |

The site was explored with the Playwright planner agent on the date above. Every URL, title, heading and link below was then checked again in a live browser.

## What "page loads properly" means

Every destination page object has a `verifyPageLoaded()` that checks:

1. The URL is the expected path on complya.dev, with no redirect to another page and no 404.
2. The browser tab title is the expected title.
3. The page h1 is visible with the expected text.
4. The shared header (`banner`) is visible and the footer (`contentinfo`) is present.

The app login page is checked differently. Its URL must contain `/app/sign-in` and the email field must be visible.

## Priority legend

- P0: critical business flow (home page load, Log in, Book a demo)
- P1: high (every other navigation path from the home page)

## Summary

| ID | Test case | Priority | Runs |
|---|---|---|---|
| HP-001 | Home page loads at the root URL | P0 | 1 |
| HP-002 | Legacy `/home` URL redirects to the home page | P1 | 1 |
| HP-003 | Header links open the correct page | P0 | 4 |
| HP-004 | Header "Log in" opens the app sign-in page | P0 | 1 |
| HP-005 | Header menu links (Product, Solutions, Company) open the correct page | P1 | 3 |
| HP-006 | Main content links open the correct page | P1 | 11 |
| HP-007 | Platform cards open the product pages | P1 | 6 |
| HP-008 | Footer logo and footer links open the correct page | P1 | 26 |
| HP-009 | App Store and Google Play open the store in a new tab | P1 | 2 |

9 test cases, 55 test runs once the data rows are counted.

Global preconditions: a fresh browser context (no cookies, not signed in), 1280x720 viewport, and every test starts with `HomePage.goto()` on `/`.

## Test cases

### HP-001 Home page loads at the root URL (P0)

**File:** `tests/home/hp-001-home-load.spec.js`

1. Open https://complya.dev/.
   - The URL stays on `/`. It does not redirect.
   - The title is "Complya | AI-Native ABA Practice Management Software".
   - The h1 "Built for the people who provide care." is visible.
   - The header and footer are present.

### HP-002 Legacy /home URL redirects to the home page (P1)

**File:** `tests/home/hp-002-legacy-home-redirect.spec.js`

1. Open https://complya.dev/home, the URL used before the restructure.
   - The browser is redirected to `/`.
   - The home page loads, with the same checks as HP-001.

### HP-003 Header links open the correct page (P0)

**File:** `tests/home/hp-003-header-links.spec.js`

1. Click the header link from the table below.
   - The destination page loads, with its URL, title and h1 as listed.

| Header link | Destination | Title | h1 |
|---|---|---|---|
| Complya home (logo) | `/` | Complya \| AI-Native ABA Practice Management Software | Built for the people who provide care. |
| AI | `/product/ai` | AI Session Notes & Progress Reports for ABA \| Complya | Notes and reports, drafted in minutes. |
| Pricing | `/pricing` | ABA Software Pricing: One Plan, AI Included \| Complya | One plan. Every feature. AI included. |
| Book a demo | `/requestdemo` | Book a Demo \| Complya | Tell us about your practice. |

### HP-004 Header "Log in" opens the app sign-in page (P0)

**File:** `tests/home/hp-004-header-log-in.spec.js`

1. Click "Log in" in the header.
   - The browser goes to https://app.complya.dev/app/ and then to `/app/sign-in`.
   - The email field "Enter your email address" is visible.
   - The app bundle can take 30s or more to load, so allow up to 60s.

### HP-005 Header menu links open the correct page (P1)

**File:** `tests/home/hp-005-header-menus.spec.js`

1. Hover the menu button.
   - The button has `aria-expanded="true"`.
2. Click the menu link from the table below.
   - The destination page loads.

| Menu | Link | Destination |
|---|---|---|
| Product | 02 Clinical | `/product/clinical` |
| Solutions | Owners | `/solutions/owners` |
| Company | Contact | `/contact` |

The menus open on hover. Clicking the button after hovering closes the menu again. Only one link per menu is tested, because HP-008 covers every destination.

### HP-006 Main content links open the correct page (P1)

**File:** `tests/home/hp-006-main-links.spec.js`

1. Click the link from the table below.
   - The destination page loads.

| Section | Link | Destination |
|---|---|---|
| Hero | New Meet Complya AI agents | `/product/ai/agents` |
| Hero | Book a demo | `/requestdemo` |
| Hero | Explore the platform | `/platform` |
| For the whole care team (default tab "RBTs & BTs") | See Complya for RBTs | `/solutions/therapists` |
| Our mission | Read our story | `/about` |
| Complya AI | Explore Complya AI | `/product/ai` |
| Complya AI | See it on your data | `/requestdemo` |
| Compliance & security | Security, HIPAA and our BAA | `/security` |
| Pricing | See pricing details | `/pricing` |
| Closing call to action | Book a demo | `/requestdemo` |
| Closing call to action | See pricing | `/pricing` |

### HP-007 Platform cards open the product pages (P1)

**File:** `tests/home/hp-007-platform-cards.spec.js`

1. In "One system for the clinical work and the business.", click the card from the table below.
   - The product page loads.

| Card | Destination | Title | h1 |
|---|---|---|---|
| 01 AI | `/product/ai` | AI Session Notes & Progress Reports for ABA \| Complya | Notes and reports, drafted in minutes. |
| 02 Clinical | `/product/clinical` | ABA Data Collection, Goals & Live Supervision \| Complya | Great care runs on great data. |
| 03 Compliance | `/product/compliance` | ABA Compliance: Approvals, Audits & Credentials \| Complya | Compliance should be continuous. |
| 04 Revenue | `/product/revenue` | ABA Billing, Benefits Verification & Claims \| Complya | Every hour delivered. Every hour paid. |
| 05 Operations | `/product/operations` | ABA Scheduling & Practice Operations \| Complya | Scheduling, records and teams, in one place. |
| 06 Insights | `/product/insights` | ABA Reporting & Practice Analytics \| Complya | Your whole practice, in ten reports. |

### HP-008 Footer logo and footer links open the correct page (P1)

**File:** `tests/home/hp-008-footer-links.spec.js`

1. Click the footer link from the table below.
   - The destination page loads.

| Column | Footer link | Destination | Title | h1 |
|---|---|---|---|---|
| (logo) | Complya home | `/` | Complya \| AI-Native ABA Practice Management Software | Built for the people who provide care. |
| Product | Platform | `/platform` | The AI-Native ABA Practice Platform \| Complya | One record for the whole practice. |
| Product | AI | `/product/ai` | AI Session Notes & Progress Reports for ABA \| Complya | Notes and reports, drafted in minutes. |
| Product | Clinical | `/product/clinical` | ABA Data Collection, Goals & Live Supervision \| Complya | Great care runs on great data. |
| Product | Compliance | `/product/compliance` | ABA Compliance: Approvals, Audits & Credentials \| Complya | Compliance should be continuous. |
| Product | Revenue | `/product/revenue` | ABA Billing, Benefits Verification & Claims \| Complya | Every hour delivered. Every hour paid. |
| Product | Operations | `/product/operations` | ABA Scheduling & Practice Operations \| Complya | Scheduling, records and teams, in one place. |
| Product | Insights | `/product/insights` | ABA Reporting & Practice Analytics \| Complya | Your whole practice, in ten reports. |
| Product | Pricing | `/pricing` | ABA Software Pricing: One Plan, AI Included \| Complya | One plan. Every feature. AI included. |
| Solutions | Owners | `/solutions/owners` | ABA Practice Software for Owners & Executives \| Complya | Grow your practice and get paid for every hour. |
| Solutions | Clinicians | `/solutions/clinical-leaders` | ABA Software for BCBAs & Clinical Directors \| Complya | Lead care with every session in view. |
| Solutions | Therapists | `/solutions/therapists` | ABA Data Collection App for RBTs & Therapists \| Complya | Stay present with your client. |
| Solutions | Billing | `/solutions/billing` | ABA Billing Software for Revenue Teams \| Complya | Clean claims, followed to payment. |
| Company | About | `/about` | Our Story & Principles \| Complya | Built by people who've run care organizations. |
| Company | Security | `/security` | Security & HIPAA Compliance \| Complya | Your clients' records, protected. |
| Company | Contact | `/contact` | Contact Sales & Support \| Complya | How can we help? |
| Company | Support | `/contact/support` | Contact Support \| Complya | We're here to help. |
| Company | Download | `/download` | Download the App for iPhone & Android \| Complya | Complya for iPhone and Android. |
| Company | Docs | `/docs` | Help Docs: Overview \| Complya | Overview |
| Legal | Master Service Agreement | `/msa` | Master Service Agreement \| Complya | Master Service Agreement |
| Legal | Business Associate Agreement | `/baa` | Business Associate Agreement \| Complya | Business Associate Agreement |
| Legal | Terms of Service | `/terms` | Terms of Service \| Complya | Terms of Service |
| Legal | Privacy Policy | `/privacy` | Privacy Policy \| Complya | Privacy Policy |
| Legal | Subprocessors | `/legal/subprocessors` | Subprocessors \| Complya | Subprocessors |
| Legal | Cookie Policy | `/legal/cookies` | Cookie Policy \| Complya | Cookie Policy |
| Legal | All legal documents | `/legal` | Legal: Agreements and Policies \| Complya | Agreements and policies |

### HP-009 App Store and Google Play open the store in a new tab (P1)

**File:** `tests/home/hp-009-app-store-links.spec.js`

1. Click the store link in the footer.
   - A new tab opens on the store URL from the table below.
   - The original tab stays on the home page.

| Footer link | New tab URL contains |
|---|---|
| Download Complya on the App Store | `apps.apple.com/us/app/complya/id6760423936` |
| Get Complya on Google Play | `play.google.com/store/apps/details?id=com.complya` |

## Notes for automation

- Many link names repeat across the header, the body and the footer. Examples are "Book a demo" (3 or more per page), "AI", "Pricing", "Security", "Support", "Download" and "Complya home". The page objects scope every locator to a landmark (`banner`, the `Primary` or `Footer` navigation, `main`, `contentinfo`) or to its section.
- A `HomePage` click method reads the link's `href` and returns the page object for that path, so specs never create destination pages themselves.

## Issues found during exploration

| Issue | Impact |
|---|---|
| The `/contact` h1 reads "How can we help?" on screen, but screen readers announce it letter by letter ("H o w c a n w e h e l p ?"). | Accessibility defect. The page object matches the h1 by text instead. Raise it with the product team. |
| `/home/*` URLs from before the restructure now redirect to root paths, for example `/home/requestdemo` to `/requestdemo`. | Not a bug. Old bookmarks still work, and HP-002 covers the redirect. |
