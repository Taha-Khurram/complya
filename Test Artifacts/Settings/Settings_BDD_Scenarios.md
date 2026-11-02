# Complya Settings - BDD Scenarios

| | |
|---|---|
| **Feature** | Settings page: opening Settings and each settings page from it, with the right URL and a loaded page |
| **URL tested** | https://app.complya.dev/app/settings and the 10 pages its cards open |
| **Automation** | `tests/settings/st-00x-*.spec.js` (21 tests) using `pages/dashboardpage.js` and `pages/settingspage.js`. Driven only from the UI (login, sidebar, cards, back button), except ST-004, which has to open `/app/settings` directly. All 21 passed on 2026-11-02 |
| **Date** | 2026-11-02 |
| **Scope** | In: the sidebar Settings link, the Settings page load, each card's redirect (URL and page heading), each page's back button, signed-out access. Out: the Search box, the content and actions of each settings page, roles and permissions, accessibility, performance. |
| **Feature file** | `Test Artifacts/Settings/settings.feature` |

All UI text below was observed in a live browser with the Playwright MCP on the date above, signed in to the approved "QA Onboard 984491" workspace.

## Page reference (as observed)

| Element | Observed |
|---|---|
| Sidebar link | Settings icon, `href="/app/settings"`. Its accessible name is "Settings icon" while the sidebar is collapsed and "Settings icon Settings" while it is expanded on hover |
| Page title | "Complya" (same on every page) |
| Heading | "Settings" (h6), with an unlabelled search icon button next to it. The "Search" textbox is in the page but hidden until the icon is clicked |
| Cards | 10 cards, each with an icon, a title (h5) and a one-line description. Cards are plain `div`s, not links |
| Tour | After sign-in, Home shows a "1 of 13" tour overlay with a "Close Tour" button, which blocks clicks until closed |

## Cards and the pages they open (as observed)

| Card | Description on the card | Opens URL | Page heading | Back button |
|---|---|---|---|---|
| Sites | Manage the Site and configurations of sites across your organization. | `/app/sites` | "Sites" | Yes |
| Plans | Your Complya plan, subscription and invoices. | `/app/plans` | "Plans" | Yes |
| Legal & Compliance | Review the agreements that govern your workspace and manage your consent. | `/app/legal-compliance` | "Legal & Compliance" | Yes |
| Services | Set up and manage services provided by your organization, including automation and workflows. | `/app/servicetypes` | "Services" | Yes |
| Goals Library | Create and organize goals, workflows, and automation within your organization’s system. | `/app/catalog?tab=private` | "Goals Library" | **No** |
| Note Templates | Create and manage custom note templates for consistent documentation across your organization. | `/app/note-templates?tab=SESSION_NOTE&page=1&limit=20` | "Note Templates" | Yes |
| Notifications | Choose which roles receive each notification — admins, site managers, clinical staff, QSPs, or BCBAs. | `/app/notification-settings` | "Notifications" | Yes |
| Audit Logs | Review and manage logs for auditing purposes across your organization’s activities. | `/app/activity` | "Audit Logs" | Yes |
| Prompt Library | Save and manage the prompts your team inserts into Copilot, so common questions are one click away. | `/app/prompt-library?page=1&limit=20` | "Prompt Library" | Yes |
| Copilot | Choose what Copilot can read and prepare for you in this workspace, or revoke its access. | `/app/settings/copilot` | "Copilot" | Yes |

Every page loaded both from its card and by opening its URL directly. The back button (an unlabelled arrow next to the heading) goes to `/app/settings` in both cases, so it doesn't depend on browser history.

## Summary

| ID | Scenario | Priority | Type |
|---|---|---|---|
| ST-001 | Settings opens from the sidebar | High | Positive |
| ST-002 | Each settings card opens its page (10 examples) | High | Positive |
| ST-003 | The back button returns to Settings (9 examples; Goals Library has none) | Medium | Positive |
| ST-004 | Settings is not available when signed out | High | Negative |

4 scenarios, 21 test cases once the outline examples are counted.

Test data: `<account_email>` and `<account_password>` are the "QA Onboard 984491" account, an approved workspace, supplied from `WORKSPACE_EMAIL` and `WORKSPACE_PASSWORD` in `.env` (or the `staging` secrets in CI) and never written into these files. The login account (`USER_EMAIL`) is not used here.

## Scenarios

**Precondition for ST-001 to ST-003:** I am signed in to an approved workspace as `<account_email>`, and the Home tour is closed.

### ST-001 Settings opens from the sidebar
- **Given** I am signed in and on the Home page (`/app/`)
- **When** I click "Settings" in the sidebar
- **Then** I am taken to `/app/settings`
- **And** I see the heading "Settings"
- **And** I see the 10 cards: Sites, Plans, Legal & Compliance, Services, Goals Library, Note Templates, Notifications, Audit Logs, Prompt Library, Copilot

### ST-002 Each settings card opens its page
- **Given** I am signed in and on the Settings page (`/app/settings`)
- **When** I click the card below
- **Then** I am taken to the URL below
- **And** the page loads with the heading below

| Card | URL | Heading |
|---|---|---|
| Sites | `/app/sites` | "Sites" |
| Plans | `/app/plans` | "Plans" |
| Legal & Compliance | `/app/legal-compliance` | "Legal & Compliance" |
| Services | `/app/servicetypes` | "Services" |
| Goals Library | `/app/catalog?tab=private` | "Goals Library" |
| Note Templates | `/app/note-templates?tab=SESSION_NOTE&page=1&limit=20` | "Note Templates" |
| Notifications | `/app/notification-settings` | "Notifications" |
| Audit Logs | `/app/activity` | "Audit Logs" |
| Prompt Library | `/app/prompt-library?page=1&limit=20` | "Prompt Library" |
| Copilot | `/app/settings/copilot` | "Copilot" |

### ST-003 The back button returns to Settings
- **Given** I am signed in and have opened the page below from its Settings card
- **When** I click the back button next to the page heading
- **Then** I am taken to `/app/settings`
- **And** I see the heading "Settings"

| Card | Page URL |
|---|---|
| Sites | `/app/sites` |
| Plans | `/app/plans` |
| Legal & Compliance | `/app/legal-compliance` |
| Services | `/app/servicetypes` |
| Note Templates | `/app/note-templates?tab=SESSION_NOTE&page=1&limit=20` |
| Notifications | `/app/notification-settings` |
| Audit Logs | `/app/activity` |
| Prompt Library | `/app/prompt-library?page=1&limit=20` |
| Copilot | `/app/settings/copilot` |

Goals Library is left out because it has no back button (see Observations).

### ST-004 Settings is not available when signed out
- **Given** I am not signed in
- **When** I open `/app/settings`
- **Then** I am taken to the login page (`/app/sign-in`)
- **And** I see the heading "Login"
- **And** I do not see the Settings page

## Observations / To be confirmed

1. **Goals Library has no back button.** The other 9 pages opened from Settings have one, so the only way back from Goals Library is the sidebar or the browser Back button. To be confirmed whether this is intended.
2. **Cards are not links.** Each card is a plain `div` with a click handler: no link role, no `tabindex` and no `href`. Keyboard users can't reach the cards, and they can't be opened in a new tab.
3. **Back buttons have no accessible name.** The arrow button next to each page heading has no text or `aria-label`, so screen readers announce just "button". Only Copilot's has one ("Back to settings").
4. **Sidebar link name changes.** The Settings link is "Settings icon" when the sidebar is collapsed and "Settings icon Settings" when it is expanded. Automated locators should use the `href` or a partial name.
5. **Same page title everywhere.** Every page, including Settings and its sub-pages, has the browser title "Complya", so the title can't confirm which page loaded. The scenarios check the URL and the heading instead.
6. **Inconsistent URLs.** Only Copilot sits under `/app/settings/`. The others use top-level paths, such as `/app/servicetypes` for "Services" and `/app/activity` for "Audit Logs", and some open with query parameters already set.
7. **Sidebar covers the page while hovered.** The collapsed sidebar expands to 240px on hover and overlays the left of the page, including the first card and the back button. It stays open while the mouse rests where a card was clicked, so automated clicks there are blocked; `pages/settingspage.js` moves the mouse onto the page first.
