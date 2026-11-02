# Complya Sites - BDD Scenarios

| | |
|---|---|
| **Feature** | Sites: creating a site from Settings → Sites → Add, with its validation and NPI/EIN verification result |
| **URL tested** | https://app.complya.dev/app/sites (opened from the Sites card on `/app/settings`) and the site details page it links to |
| **Automation** | `tests/sites/si-00x-*.spec.js` (8 tests) using `pages/sitespage.js` and `utils/sitedata.js`. UI-driven only: sign in, sidebar, Settings card, Add button, dialog, sites table and site details. No direct URLs and no API checks. All 8 passed on 2026-11-02. Tests run in parallel, so each one finds its site by its unique name |
| **Date** | 2026-11-02 |
| **Scope** | In: opening the New Site dialog, required and format validation, creating a verified site, creating a site whose NPI + EIN are already in use, Cancel and Close. Out: editing a site, the Profile Picture upload, the Taxonomy Code lookup, Fax, the site detail tabs (Clients, Staff, Sessions, Insights, Payers), filter, display, grid view, export, roles and permissions, accessibility, performance. |
| **Feature file** | `Test Artifacts/Sites/sites.feature` |

All UI text below was observed in a live browser with the Playwright MCP on the date above, signed in to the approved "QA Onboard 984491" workspace.

## Page reference (as observed)

| Element | Observed |
|---|---|
| Sites page | Heading "Sites" (h6) with a back button and an "Add" button. Below it, a site count heading in the form "1-N / N sites", then a table: Name, Address, City, State, Zip Code, Verification Status. The newest site is the first row |
| New Site dialog | Title "New Site", a "Close" (X) button, a "Profile Picture" section, a "General Info" section with the fields below, and "Cancel" and "Save" buttons |
| Site details | Opens when a row is clicked. Breadcrumb "Site / <site name>", an "Edit site name" button, a status badge, and the tabs Details, Clients, Staff, Sessions, Insights and Payers. There is no Save or Delete button |

### New Site fields

| Field | Required | Placeholder / default | Messages |
|---|---|---|---|
| Site Name | Yes | "Enter the site name" | "Site Name is required" |
| NPI | Yes | "Enter NPI" | "NPI is required", "NPI must be exactly 10 digits" |
| EIN | Yes | "Enter EIN" | "EIN is required", "EIN must be in the format XX-XXXXXXX" |
| Taxonomy Code | No | "103K00000X" | Shows "No taxonomy codes found for this NPI — type the code." when the NPI has no registry record |
| Phone No | Yes | Starts with "+1"; formats as "+1 (512) 555-0100" while typing | "Phone No is required" |
| Fax | No | "(555) 123-4567" | — |
| Billing Email | Yes | "billing@example.com" | "Billing email is required", "Billing email must be a valid email" |
| Address | Yes | "Enter address" (plain text, no suggestions) | "Address is required" |
| City | Yes | "Enter city" | "City is required" |
| ZIP Code | Yes | "Enter ZIP" | "ZIP is required" |
| State | Yes | "Enter state" | "State is required" |

Messages appear under each field when Save is clicked, and each one clears as soon as its field is corrected.

### Save results

| Data | Message | Status in the table and on site details |
|---|---|---|
| NPI valid and real, and the NPI + EIN not used by any other site | "Site created and verified" | "Active" |
| NPI and EIN already used by another site | "Site created, but verification failed: Another Complya organization already uses this NPI + EIN. Give this site its own NPI and EIN." | "Verification failed". Site details show a banner with "NPI is already used by another site", "EIN is already used by another site", "Fix the fields below — saving re-checks automatically — or retry now." and a "Retry" button |

The site is created in both cases. The dialog closes and the site count goes up by 1.

Verification runs through Stedi, on dev as well as production: the site is verified when its NPI is valid and real, unless the NPI + EIN are already used by another site.

## Summary

| ID | Scenario | Priority | Type |
|---|---|---|---|
| SI-001 | Create a site with new valid data | High | Positive |
| SI-002 | A site with an NPI and EIN already in use is created but not verified | High | Positive |
| SI-003 | Required fields are enforced | High | Negative |
| SI-004 | Invalid format is rejected (3 examples: NPI, EIN, Billing Email) | Medium | Negative |
| SI-005 | Closing the dialog does not create a site (2 examples: Cancel, Close) | Medium | Positive |

5 scenarios, 8 test cases once the outline examples are counted. SI-001 and SI-002 create a site each time they run; the others create nothing.

## Test data

- `<account_email>` and `<account_password>` are the "QA Onboard 984491" account, an approved workspace, supplied from `WORKSPACE_EMAIL` and `WORKSPACE_PASSWORD` in `.env` (or the `staging` secrets in CI) and never written into these files. The login account (`USER_EMAIL`) is not used here.
- `<timestamp>` makes each site name unique per run (for example `QA Site 1793645900000`), because sites can't be deleted.
- **SI-001 uses new valid data on every run.** It needs a valid, real NPI (checked through Stedi) and an EIN, neither of them used by any site yet, plus a valid phone, billing email, address, city, state and ZIP. Once saved, that NPI + EIN count as "already used", so they can't be reused on a later run. These `<valid_*>` values are supplied at run time and never written into these files.
- **SI-002** uses NPI `1234567893` and EIN `12-3456789`, which are already used by other sites. Since sites can't be deleted, they stay in use. The other values in SI-002 are well-formed placeholders.

## Scenarios

**Background for every scenario:** I am signed in to an approved workspace as `<account_email>`, and I opened Settings from the sidebar and clicked the "Sites" card.

The tests run in parallel, and SI-001 and SI-002 add sites while the others run. So each scenario finds its site by its unique name rather than by row position, and SI-001 and SI-002 check only that the site count went up, not that it went up by exactly 1.

### SI-001 Create a site with new valid data
- **Given** I have new valid site data whose NPI and EIN no site uses yet
- **And** I note the site count
- **When** I click "Add"
- **Then** the "New Site" dialog opens
- **When** I fill in every required field with that data (Site Name `QA Site <timestamp>`, NPI, EIN, Phone No, Billing Email, Address, City, ZIP Code, State)
- **And** I click "Save"
- **Then** I see the message "Site created and verified"
- **And** the dialog closes
- **And** the site count goes up
- **And** the table has a row with the new name, address, city, state and ZIP, with the status "Active"
- **When** I click the new site in the table
- **Then** its details show the name and the status "Active", with no "Verification failed" banner

### SI-002 A site with an NPI and EIN already in use is created but not verified
- **Given** I note the site count
- **When** I click "Add", fill in every required field using NPI `1234567893` and EIN `12-3456789`, and click "Save"
- **Then** I see the message "Site created, but verification failed: Another Complya organization already uses this NPI + EIN. Give this site its own NPI and EIN."
- **And** the dialog closes and the site count goes up
- **And** the new site's row shows the status "Verification failed"
- **When** I click the new site in the table
- **Then** its details show the status "Verification failed", the banner text, "NPI is already used by another site", "EIN is already used by another site" and a "Retry" button

### SI-003 Required fields are enforced
- **When** I click "Add" and then "Save" without filling in anything
- **Then** I see all 9 required messages: "Site Name is required", "NPI is required", "EIN is required", "Phone No is required", "Billing email is required", "Address is required", "City is required", "ZIP is required", "State is required"
- **And** the dialog stays open
- **When** I click "Cancel"
- **Then** the dialog closes

### SI-004 Invalid format is rejected
- **When** I click "Add", enter the value below in its field and click "Save"
- **Then** I see the message below under that field
- **And** the dialog stays open

| Field | Value | Message |
|---|---|---|
| NPI | `123` | "NPI must be exactly 10 digits" |
| EIN | `12` | "EIN must be in the format XX-XXXXXXX" |
| Billing Email | `not-an-email` | "Billing email must be a valid email" |

### SI-005 Closing the dialog does not create a site
- **When** I click "Add", enter `QA Discard <timestamp>` in Site Name and click the button below
- **Then** the dialog closes
- **And** `QA Discard <timestamp>` is not in the table
- **When** I click "Add" again
- **Then** Site Name is empty

| Button |
|---|
| Cancel |
| Close (X) |

## Observations / To be confirmed

1. **Sites can't be deleted.** Selecting rows only offers Export, and site details have no Delete button. Every run of SI-001 and SI-002 leaves a site in the shared workspace, so the list keeps growing. Exploration on 2026-11-02 left "QA Site 20261102" (Verification failed) and "QA Site Unique 20261102" (Active). To be confirmed whether a delete or archive option is planned, or how test sites should be cleaned up.
2. **A site is saved even when verification fails.** The failed site is created and listed with "Verification failed" instead of being rejected in the dialog. To be confirmed that this is intended.
3. **"Another Complya organization" wording.** The duplicate message names another organization, but it isn't clear whether the same message appears when the NPI + EIN are used by a site in the same workspace. To be confirmed.
4. **Field labels aren't linked on site details or for Phone.** The Phone No field's accessible name is its placeholder ("1 (702) 123-4567"), and the fields on site details are named by their placeholders, not their labels. Screen readers won't announce the right field name, and automated locators should use the field's position or `name` attribute there.
5. **Site count text.** The count reads "1-N / N sites" in the page's accessibility tree but shows as "Sites" on screen (text is capitalised with CSS). Locators should match it case-insensitively.
