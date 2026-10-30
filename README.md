# Complya E2E Tests

[![E2E Tests](https://github.com/Taha-Khurram/complya/actions/workflows/e2e.yml/badge.svg)](https://github.com/Taha-Khurram/complya/actions/workflows/e2e.yml)
[![Allure reports](https://img.shields.io/badge/reports-Allure-orange)](https://taha-khurram.github.io/complya/)
![Playwright](https://img.shields.io/badge/Playwright-1.61-2EAD33?logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)

End-to-end test suite for [Complya](https://complya.dev), the AI-native practice platform for ABA. It tests the marketing site and the web app using Playwright (JavaScript, CommonJS) and the Page Object Model. Tests run on Chromium, locally and in GitHub Actions. Allure reports are published to GitHub Pages.

---

## Contents

- [Overview](#overview)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running tests](#running-tests)
- [Reports](#reports)
- [CI/CD](#cicd)
- [Writing tests](#writing-tests)
- [Test artifacts and AI agents](#test-artifacts-and-ai-agents)
- [Troubleshooting](#troubleshooting)

---

## Overview

| | |
|---|---|
| **Framework** | [Playwright Test](https://playwright.dev) 1.61 |
| **Language** | JavaScript (CommonJS) |
| **Pattern** | Page Object Model, fluent style: navigation methods return the next page object |
| **Browser** | Chromium |
| **Reporting** | Playwright HTML report and [Allure](https://allurereport.org) (`allure awesome`) |
| **CI** | GitHub Actions, run manually; reports published to GitHub Pages |

### Test suites

| Suite | Folder | Target | Test cases | Test runs |
|---|---|---|---|---|
| Home | `tests/home` | https://complya.dev | 9 | 55 |
| Login | `tests/login` | https://app.complya.dev | 7 | 10 |

- **Home** checks that every link on the home page opens the correct page and that the page loads (URL, title and h1). This covers the header, menus, main content, platform cards, footer and app store links.
- **Login** covers email and password sign-in: a successful login, required-field and email-format validation, a wrong password, an unregistered email, password masking, and submitting with Enter.

---

## Project structure

```text
complya/
├── .github/
│   ├── workflows/e2e.yml      # The single CI workflow (manual, with a suite picker)
│   ├── e2e-suites.json        # Suite list: drives the CI matrix and the report landing page
│   └── pages/index.html       # Template for the GitHub Pages landing page
├── .claude/agents/            # Playwright planner, generator and healer agents
├── pages/                     # Page objects
│   ├── basepage.js            # Shared header, footer and verifyPageLoaded()
│   ├── homepage.js            # Home page; click methods return the destination page
│   ├── productpage.js         # /platform and /product/* pages (keyed by path)
│   ├── solutionpage.js        # /solutions/* pages (keyed by path)
│   ├── legalpage.js           # /legal and legal documents (keyed by path)
│   ├── loginpage.js           # App sign-in
│   └── ...                    # About, Contact, Support, Download, Pricing, and others
├── tests/
│   ├── home/                  # hp-0xx-*.spec.js
│   ├── login/                 # lg-0xx-*.spec.js
│   └── seed.spec.js           # Seed used by the Playwright MCP agents
├── utils/
│   └── testmail.js            # testmail.app inbox helper for email tests
├── Test Artifacts/            # Test plans and Gherkin feature files per suite
├── specs/                     # Raw test plans from the planner agent
└── playwright.config.js       # Project, reporters, baseURL, trace, video and screenshots
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22 or later, with npm
- Git

### Install

```bash
git clone https://github.com/Taha-Khurram/complya.git
cd complya
npm ci
npm run install:browsers   # installs Playwright's Chromium
```

### Environment variables

Create a `.env` file in the project root. It is gitignored, so never commit it or share its values.

```dotenv
USER_EMAIL=
USER_PASSWORD=
TESTMAIL_API_KEY=
TESTMAIL_NAMESPACE=
```

| Variable | Required for | Notes |
|---|---|---|
| `USER_EMAIL` | Login suite | Test account on **app.complya.dev**. Login tests skip without it |
| `USER_PASSWORD` | Login suite | Password for `USER_EMAIL` |
| `TESTMAIL_API_KEY` | Email tests | API key from the [testmail.app](https://testmail.app) console |
| `TESTMAIL_NAMESPACE` | Email tests | Your testmail.app namespace. Addresses look like `<namespace>.<tag>@inbox.testmail.app` |
| `APP_URL` | Optional | Overrides the app host for the login suite (default `https://app.complya.dev`) |

The Home suite needs none of these.

---

## Running tests

| Command | What it does |
|---|---|
| `npm test` | Run every test on local Chromium |
| `npx playwright test tests/home` | Run one suite |
| `npx playwright test tests/home/hp-001-home-load.spec.js` | Run one file |
| `npx playwright test --grep @P0` | Run by tag (`@P0`, `@P1`, `@login`, `@smoke`, ...) |
| `npx playwright test tests/home --headed` | Watch the browser |
| `npx playwright test tests/home --debug` | Step through with the Playwright Inspector |
| `npx playwright test --ui` | Interactive UI mode |
| `npx playwright test --list` | List tests without running them |

`npm test` and `npm run test:local` both use the `chromium-local` project with 3 workers. Every run records a trace, a video and screenshots, which appear in the reports.

---

## Reports

| Report | Command | Location |
|---|---|---|
| Playwright HTML | `npm run report` | `playwright-report/` |
| Allure (local) | `npm run allure:generate`, then `npm run allure:open` | `allure-report/` |
| Allure (published) | Run the CI workflow on `main` | https://taha-khurram.github.io/complya/ |

Clear old Allure data with `npm run clean:allure`. Generated folders (`test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`) are gitignored.

---

## CI/CD

All CI runs through one workflow, **E2E Tests** (`.github/workflows/e2e.yml`). It runs only when started by hand.

### Run it

1. Open **Actions → E2E Tests → Run workflow**.
2. Pick the branch and a **Suite**: `all`, `home` or `login`.
3. Click **Run workflow**.

### What happens

```text
plan  ──►  test (one runner per suite, in parallel)  ──►  publish (one suite at a time, main only)
```

| Job | Purpose |
|---|---|
| `plan` | Reads `.github/e2e-suites.json` and picks the suites to run |
| `test` | Runs `npm test -- <path>` for each suite in the `staging` environment. One suite failing doesn't stop the others |
| `publish` | Runs on `main` only. Builds the Allure report with the last 20 runs of history and deploys it to the `gh-pages` branch under `<suite>/`. The landing page is rebuilt from the suite list |

**Artifacts per run (kept 14 days):** `playwright-report-<suite>`, `allure-results-<suite>`, and `allure-report-<suite>`, a single-file report you can open as `index.html` directly.

**Secrets:** `USER_EMAIL`, `USER_PASSWORD`, `TESTMAIL_API_KEY` and `TESTMAIL_NAMESPACE` live in the GitHub `staging` environment.

**Report commits:** the publish job commits to `gh-pages` as the user who started the run, not as `github-actions[bot]`.

### Adding a suite

1. Put the specs in `tests/<flow>/`.
2. Add a line to `.github/e2e-suites.json`:
   ```json
   { "suite": "<flow>", "path": "tests/<flow>", "name": "<Flow> (E2E Tests)" }
   ```
3. Add `<flow>` to the `suite` dropdown `options` in `e2e.yml`. GitHub can't build dropdown options from a file.

You don't need a new workflow file, and you don't need to edit the landing page by hand.

---

## Writing tests

### Conventions

- **Imports.** Import `test` and `expect` from `@playwright/test`.
- **Fluent page objects.** A method that navigates returns the next page object. Specs only create the entry page; they never create destination pages themselves.
- **No raw locators in specs.** Locators live in `pages/`.
- **Scoped locators.** Many link names repeat across the site, such as "Book a demo", "AI" and "Pricing". Scope every locator to a landmark (`banner`, the `Primary` or `Footer` navigation, `main` or `contentinfo`) or to a section.
- **Naming.** One test case ID per file, named `<prefix>-<nnn>-<short-name>.spec.js` (for example `hp-008-footer-links.spec.js`). Data-driven cases loop over a table inside the file.
- **Tags.** Use priority tags `@P0` (critical), `@P1` (high) and `@P2` (medium/low) on `test.describe`. Add suite tags such as `@login` and `@smoke` where useful.

### Example

```js
const { test } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page @P1', () => {
  test('HP-008 Footer "Pricing" link opens the correct page', async ({ page }) => {
    const homePage = await new HomePage(page).goto()
    const pricingPage = await homePage.clickFooterLink('Pricing')   // returns PricingPage
    await pricingPage.verifyPageLoaded()                            // URL, title, h1, header, footer
  })
})
```

### Adding a page object

Extend `BasePage` and set `path`, `title` and `heading`. `goto()` and `verifyPageLoaded()` then work automatically:

```js
const { BasePage } = require('./basepage')

class PricingPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/pricing'
        this.title = 'ABA Software Pricing: One Plan, AI Included | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: 'One plan. Every feature. AI included.', exact: true })
    }
}
```

---

## Test artifacts and AI agents

### Test Artifacts

`Test Artifacts/<Suite>/` holds the human-readable test design for each suite:

| File | Contents |
|---|---|
| `Home/Home_Test_Plan.md` | Scope, test cases, steps, expected URLs, titles and headings |
| `Home/home.feature` | Gherkin BDD scenarios for the same cases |
| `Login/Login_BDD_Scenarios.md` | Login test design |
| `Login/login.feature` | Gherkin BDD scenarios for login |

The `.feature` files are documentation only. The project has no Cucumber runner.

### Playwright agents

`.claude/agents/` defines three Playwright MCP agents. They run through the `playwright-test` MCP server configured in `.mcp.json`:

| Agent | Role |
|---|---|
| `playwright-test-planner` | Explores the live site and drafts a test plan |
| `playwright-test-generator` | Turns plan items into spec files |
| `playwright-test-healer` | Runs failing tests, finds the cause, and fixes locators and timing |

`tests/seed.spec.js` is the seed page the agents start from.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| A local run hangs before printing `Running N tests` | A stale Playwright worker, often from an MCP agent session, is holding files in `test-results/`. End the stray `node` process, or run with `--output=<another folder>` |
| The login test is slow or times out | The app bundle on app.complya.dev can take 30s or more to load. `LoginPage.verifyPageLoaded()` already waits up to 60s |
| Login tests show as skipped | `USER_EMAIL` or `USER_PASSWORD` isn't set (in `.env` locally, or in the `staging` environment in CI) |
| Valid credentials are rejected | The test account exists on **app.complya.dev** (dev), not app.complya.com |
| `strict mode violation` on a link | The link name is repeated on the page. Scope the locator to a landmark or section in the page object |
| The `/contact` heading can't be found by name | Known site accessibility bug: its accessible name is letter-spaced ("H o w c a n ..."). `ContactPage` matches the heading by text instead |