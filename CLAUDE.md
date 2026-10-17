# CLAUDE.md

Playwright end-to-end test suite (JavaScript, CommonJS) that runs on the LambdaTest cloud grid, with an option to run on local Chromium.

## Working rules

- Don't write code before telling me what it will be.
- Don't make changes before telling me what they are.
- Always generate a plan before doing something.
- Implement only after I approve the plan.
- Follow the directory structure described below. Put new files where they belong.

## LambdaTest status: paused

- The 3 `@lambdatest` projects are commented out in `playwright.config.js`, so every run uses `chromium-local` only.
- Their scripts are renamed `paused:test:lambdatest` and `paused:test:chrome`. They fail with "project not found" until the projects are re-enabled.
- To re-enable: uncomment the projects, rename the scripts back to `test:lambdatest` and `test:chrome`, and point `npm test` back at `--project="*@lambdatest"`.

## Commands

- `npm test` / `npm run test:local`: local Chromium (`chromium-local` project)
- `npm run paused:test:lambdatest`: every LambdaTest project (Chrome, WebKit, Firefox). Paused.
- `npm run paused:test:chrome`: LambdaTest Chrome on Windows 11 only. Paused.
- `npx playwright test tests/example.spec.js --project=chromium-local`: run a single file locally
- `npm run report`: open the Playwright HTML report
- `npm run allure:generate` then `npm run allure:open`: build and view the Allure report
- `npm run clean:allure`: delete Allure results and reports

## Setup

- `.env` must contain `LT_USERNAME`, `LT_ACCESS_KEY` and `MAILSLURP_API_KEY`. It is gitignored, so never commit it or print its values.
- `workers: 3` in `playwright.config.js` must stay at or below the LambdaTest parallel session limit.

## CI (GitHub Actions)

- `.github/workflows/_e2e.yml`: reusable workflow. Job `test` runs `npm test -- <test-path>` in the `staging` environment and uploads the Playwright report and `allure-results`. Job `publish` (only on `main`, never on pull requests) builds the Allure report with `allure awesome`, keeps the last 20 runs of history, and deploys it to the `gh-pages` branch under `<suite>/`.
- `.github/workflows/staging-e2e.yml` ("Staging (E2E Tests)"): full suite on push and PR to `main`, plus manual runs.
- `.github/workflows/e2e-home.yml` ("Home (E2E Tests)"): `tests/home` on pushes to `main` that touch home tests or shared code, plus manual runs.
- `.github/pages/index.html`: landing page linking each report.
- Reports: https://taha-khurram.github.io/complya/ (`/staging/`, `/home/`).
- Secrets (`MAILSLURP_API_KEY`, `LT_USERNAME`, `LT_ACCESS_KEY`) live in the GitHub `staging` environment.
- To add a flow: create `tests/<flow>/`, copy `e2e-home.yml` to `e2e-<flow>.yml`, change `name`, the `tests/home/**` path filter, `suite`, `test-path` and `report-name`, then add a link in `.github/pages/index.html`.
- Commits and PRs must not list Claude as author or co-author.

## Structure

- `playwright.config.js`: projects, reporters (list, html, allure-playwright), and `trace`/`video`/`screenshot` all set to `on`.
- `lambdatest-setup.js`: custom `test` fixture that overrides `page` and adds `inbox`.
  - A project whose name contains `@lambdatest` connects to `wss://cdp.lambdatest.com`. The project name sets the browser, version and platform, using the format `browser:version:platform@lambdatest`.
  - Any other project launches local Chromium.
  - After each test it sends the pass/fail status to the LambdaTest dashboard.
  - Playwright video is recorded locally only. LambdaTest records its own video.
  - `inbox` creates a MailSlurp inbox (`{ id, emailAddress }`) before the test and deletes it afterwards. It is only created when a test requests it.
- `utils/`: helpers. `utils/mailslurp.js` wraps the MailSlurp SDK (`createInbox`, `deleteInbox`, `waitForLatestEmail`, `sendEmail`, `extractLinks`, `extractCode`).
- `tests/`: spec files. Only `**/*.spec.js` matches `testMatch`, so `seed.spec.ts` (the Playwright MCP generator seed) is not run by `npx playwright test`.
- `pages/`: page objects (`homepage.js`, currently empty).
- `specs/`: Markdown test plans written by the playwright-test-planner agent.

## Conventions

- Tests import `test` from `../lambdatest-setup`, not from `@playwright/test`, so they work on both LambdaTest and local runs. Import `expect` from `@playwright/test`.
- Tests that need email request the `inbox` fixture and use the helpers from `../utils/mailslurp`. Don't call the MailSlurp SDK directly from tests.
- To add a LambdaTest browser, add a project named `browser:version:platform@lambdatest` in `playwright.config.js`.
- Generated output (`test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`) is gitignored. Don't edit it.
