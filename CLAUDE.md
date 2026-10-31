# CLAUDE.md

Playwright end-to-end test suite (JavaScript, CommonJS) that runs on Chromium, locally and in GitHub Actions.

## Working rules

- Don't write code before telling me what it will be.
- Don't make changes before telling me what they are.
- Always generate a plan before doing something.
- Implement only after I approve the plan.
- Follow the directory structure described below. Put new files where they belong.
- Never run `git commit`, `git push` or `git pull` (or `git fetch`/`git merge` from the remote) on your own. Stop after making changes, tell me they're ready, and let me commit, push and pull.

## Commands

- `npm test` / `npm run test:local`: local Chromium (`chromium-local` project)
- `npx playwright test tests/example.spec.js --project=chromium-local`: run a single file locally
- `npm run report`: open the Playwright HTML report
- `npm run allure:generate` then `npm run allure:open`: build and view the Allure report
- `npm run clean:allure`: delete Allure results and reports

## Setup

- `.env` holds `USER_EMAIL` and `USER_PASSWORD` (a dev test account on app.complya.dev, used by the login suite). It is gitignored, so never commit it or print its values. `playwright.config.js` loads it with `dotenv`.
- `.env` also holds `TESTMAIL_API_KEY` and `TESTMAIL_NAMESPACE` for [testmail.app](https://testmail.app), used by email tests through `utils/testmail.js`. Addresses look like `<namespace>.<tag>@inbox.testmail.app`. The free plan allows 100 emails a month and has no delete API, so tests keep emails apart with a unique tag and `receivedAfter`.

## CI (GitHub Actions)

- `.github/workflows/e2e.yml` ("E2E Tests"): the only workflow. It is manual only (`workflow_dispatch`), with no push or PR triggers. A **Suite** dropdown offers `all` or a single suite.
  - Job `plan` reads `.github/e2e-suites.json` and picks the suites to run.
  - Job `test` runs one matrix leg per suite, in parallel with `fail-fast: false`, in the `staging` environment. Each leg runs `npm test -- <path>` and uploads `playwright-report-<suite>`, `allure-results-<suite>` and a single-file `allure-report-<suite>` (open `index.html` directly).
  - Job `publish` runs only on `main`, one suite at a time (`max-parallel: 1`). It builds the Allure report with `allure awesome`, keeps the last 20 runs of history, and deploys it to the `gh-pages` branch under `<suite>/`.
- `.github/e2e-suites.json`: the suite list (`suite`, `path`, `name`). The test matrix and the report landing page are both built from it.
- `.github/pages/index.html`: landing page template. The publish job replaces `<!-- SUITES -->` with one link per suite from `e2e-suites.json`, so don't add links by hand.
- Reports: https://taha-khurram.github.io/complya/ (`/home/`, `/login/`).
- The publish job commits to `gh-pages` as the user who started the run (`github.actor`), not as `github-actions[bot]`, so the bot doesn't appear as a repo contributor.
- Secrets (`USER_EMAIL`, `USER_PASSWORD`, `TESTMAIL_API_KEY`, `TESTMAIL_NAMESPACE`) live in the GitHub `staging` environment. Login tests skip when `USER_EMAIL` or `USER_PASSWORD` is missing.
- **Every time a suite is added**, add a line for it to `.github/e2e-suites.json`, for example `{ "suite": "<flow>", "path": "tests/<flow>", "name": "<Flow> (E2E Tests)" }`. Also add `<flow>` to the `suite` dropdown `options` in `e2e.yml`, because GitHub can't build dropdown options from a file. Put the tests in `tests/<flow>/`. No new workflow file is needed.
- Commits and PRs must not list Claude as author or co-author.

## Structure

- `playwright.config.js`: projects, reporters (list, html, allure-playwright), and `trace`/`video`/`screenshot` all set to `on`.
- `tests/`: spec files (`**/*.spec.js`), one folder per suite. `tests/seed.spec.js` is the empty seed test the Playwright MCP agents start from.
- `pages/`: page objects. `basepage.js` holds the shared header, the footer and `verifyPageLoaded()`. `homepage.js` click methods return the destination page object. `productpage.js`, `solutionpage.js` and `legalpage.js` each cover a group of pages, keyed by path. `onboardingpage.js` has one class per onboarding screen, and `LoginPage.loginToOnboarding(email, password, step)` returns the screen the account resumes at.
- `utils/`: helpers that aren't page objects. `testmail.js` creates testmail.app addresses, waits for an email (`waitForEmail`), and pulls links and codes out of it (`getLinks`, `getCode`). `accounts.js` has `createVerifiedAccount(page)`, which signs up a new account and verifies its email (1 testmail email per call).
- `specs/`: Markdown test plans written by the playwright-test-planner agent.

## Conventions

- Tests import `test` and `expect` from `@playwright/test`. There is no custom fixture file.
- Generated output (`test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`) is gitignored. Don't edit it.
