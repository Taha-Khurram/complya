# Complya Onboarding - Bug Report

| | |
|---|---|
| **Feature** | Onboarding of a new self-serve account (first sign-in to "Waiting for Approval") |
| **Environment** | https://app.complya.dev (dev), Chromium via Playwright MCP, viewport 1280x720 |
| **Date found** | 2026-10-31 |
| **Found by** | Exploratory testing for the onboarding E2E suite |
| **Account used** | A new account from the signup suite (SU-009), workspace "QA Onboard 391897" |
| **Related** | Test plan `specs/onboarding-plan.md`, scenarios `Test Artifacts/Onboarding/` |

## Summary

| ID | Title | Area | Type | Severity |
|---|---|---|---|---|
| BUG-OB-001 | 9-digit phone number passes validation | Workspace Setup (3/4) | Validation | Medium |
| BUG-OB-002 | Billing email without a domain ending passes validation | Workspace Setup (3/4) | Validation | Low |
| BUG-OB-003 | Invalid invite email is ignored without a message | Invites (4/4) | Validation | Low |
| BUG-OB-004 | Duplicate invite email is dropped without a message | Invites (4/4) | Validation / UX | Low |
| BUG-OB-005 | Role hint always says "Staff" | Invites (4/4) | Functional | Low |
| BUG-OB-006 | Company name is lost when the organization terms page is reloaded | Workspace (2/4) and organization terms | Functional / UX | Medium |
| BUG-OB-007 | Added invite emails are lost on reload | Invites (4/4) | Functional | Low |
| BUG-OB-008 | No way to go back to a previous step | All steps | UX | Medium |
| BUG-OB-009 | "Sign Out" is not a button or link | All onboarding screens | Accessibility | Medium |
| BUG-OB-010 | Invite emails can only be removed by clicking plain text | Invites (4/4) | Accessibility | Medium |
| BUG-OB-011 | "Phone Number" label is not linked to its field | Workspace Setup (3/4) | Accessibility | Low |
| BUG-OB-012 | Signature "Name" label is not linked to its field | Add signature | Accessibility | Low |
| BUG-OB-013 | Typos and inconsistent capitalization in headings and toasts | Several steps | Copy | Low |
| BUG-OB-014 | Two different screens use the heading "Review our terms" | Terms screens | UX | Low |

14 bugs: 5 Medium, 9 Low.

## How to reach each step

Every bug below needs a new account at a given step. To get there:

1. Sign up at https://app.complya.dev/app/signup, verify the email, and sign in. The account opens **Review our terms** (`/app/review-terms`).
2. Check all five boxes and click **Continue** to reach **Step 1/4** "Lets get to know you".
3. Enter a first and last name and click **Continue** to reach **Step 2/4** "Create your workspace".
4. Enter a company name (4 to 20 characters) and click **Continue** to reach the **organization terms** (second "Review our terms" screen).
5. Check the Master Service Agreement agreement and click **Continue** to reach **Step 3/4** "Workspace Setup".
6. Fill in valid details (phone 7025550123, NPI 1234567893, EIN 123456789, billing email billing.qa@example.com, address, city, ZIP 73301, state) and click **Continue** to reach **Step 4/4** "Collaborate with your team".
7. Click **Skip for now** to reach **Add your signature** (`/app/add-signature`).

Each completed step is saved, so signing in again resumes at the current step.

---

## Validation

### BUG-OB-001 9-digit phone number passes validation

| | |
|---|---|
| **Area** | Step 3/4 Workspace Setup, Phone Number |
| **Severity** | Medium |
| **Type** | Validation |

**Steps to reproduce**
1. Go to Step 3/4 "Workspace Setup".
2. Clear the Phone Number field and type `702123456` (9 digits).
3. Fill in every other required field with valid values.
4. Click **Continue**.

**Expected:** The error "Phone number must be a valid 10-digit US number" shows under Phone Number and the form is not saved.

**Actual:** The field shows `+1 (702) 123-456` and no phone error appears. The form can be submitted with a 9-digit number.

**Note:** A shorter number such as `123` (shown as `+1 (123)`) correctly shows the error, so the check seems to allow 9 digits.

---

### BUG-OB-002 Billing email without a domain ending passes validation

| | |
|---|---|
| **Area** | Step 3/4 Workspace Setup, Billing Email |
| **Severity** | Low |
| **Type** | Validation |

**Steps to reproduce**
1. Go to Step 3/4 "Workspace Setup".
2. Enter `user@domain` in Billing Email.
3. Click **Continue**.

**Expected:** The error "Billing email must be a valid email" shows under Billing Email.

**Actual:** No error shows for Billing Email. `billing@` and `billing.example.com` are rejected correctly, but `user@domain` (no `.com` or other ending) is accepted.

---

### BUG-OB-003 Invalid invite email is ignored without a message

| | |
|---|---|
| **Area** | Step 4/4 Collaborate with your team, invite email |
| **Severity** | Low |
| **Type** | Validation |

**Steps to reproduce**
1. Go to Step 4/4 "Collaborate with your team".
2. Type `not-an-email` in the email field.
3. Press **Enter**.

**Expected:** An inline error such as "Invalid email address" shows.

**Actual:** Nothing happens. No invite is added, the text stays in the field, and no message explains why.

---

### BUG-OB-004 Duplicate invite email is dropped without a message

| | |
|---|---|
| **Area** | Step 4/4 Collaborate with your team, invite email |
| **Severity** | Low |
| **Type** | Validation / UX |

**Steps to reproduce**
1. Go to Step 4/4 "Collaborate with your team".
2. Type `qa.invite.two@example.com` and press **Enter**.
3. Type `qa.invite.two@example.com` again and press **Enter**.

**Expected:** A message says the email has already been added.

**Actual:** The field is cleared and only one invite is shown, with no message. The user can't tell whether the second entry was added.

---

## Functional

### BUG-OB-005 Role hint always says "Staff"

| | |
|---|---|
| **Area** | Step 4/4 Collaborate with your team, role menu |
| **Severity** | Low |
| **Type** | Functional |

**Steps to reproduce**
1. Go to Step 4/4 "Collaborate with your team".
2. Note the hint under the email field: "Press enter to add more Staff."
3. Click the role button (**Staff**) and choose **Admin**.

**Expected:** The hint changes to "Press enter to add more Admin." (or a similar text that matches the chosen role).

**Actual:** The role button shows **Admin** and new invites get the "admin" role, but the hint still says "Press enter to add more Staff."

---

### BUG-OB-006 Company name is lost when the organization terms page is reloaded

| | |
|---|---|
| **Area** | Step 2/4 Create your workspace and the organization terms |
| **Severity** | Medium |
| **Type** | Functional / UX |

**Steps to reproduce**
1. Go to Step 2/4 "Create your workspace".
2. Enter a company name, for example `QA Onboard 391897`, and click **Continue**.
3. On the organization terms screen, check the agreement checkbox.
4. Reload the page.

**Expected:** The user returns to the organization terms with the company name kept, or the name is kept on Step 2/4.

**Actual:** The user is sent back to Step 2/4 and the Company name field is empty. Nothing from the previous screen is kept. The workspace is only created (`POST /api/workspaces`) once the organization terms are accepted, so anything entered before that is lost.

---

### BUG-OB-007 Added invite emails are lost on reload

| | |
|---|---|
| **Area** | Step 4/4 Collaborate with your team |
| **Severity** | Low |
| **Type** | Functional |

**Steps to reproduce**
1. Go to Step 4/4 "Collaborate with your team".
2. Add `qa.invite.one@example.com` (type it and press **Enter**). It appears as an invite.
3. Reload the page.

**Expected:** The added invites are kept, or the user is warned before leaving the page.

**Actual:** The page reloads on Step 4/4 with no invites. The added emails are lost without a warning.

---

### BUG-OB-008 No way to go back to a previous step

| | |
|---|---|
| **Area** | All onboarding steps |
| **Severity** | Medium |
| **Type** | UX |

**Steps to reproduce**
1. Go to Step 2/4 and create a workspace with a typo in the company name, for example `QA Onbaord`.
2. Continue to Step 3/4 "Workspace Setup".
3. Look for a way to go back and fix the name.

**Expected:** A **Back** button (or a clickable step indicator) to go back to earlier steps.

**Actual:** No step has a Back button. Organization Name on Step 3/4 is disabled, so the typo can't be fixed during onboarding. Opening an earlier URL directly (for example `/app/review-terms`) just redirects to the current step.

---

## Accessibility

### BUG-OB-009 "Sign Out" is not a button or link

| | |
|---|---|
| **Area** | Footer on every onboarding screen |
| **Severity** | Medium |
| **Type** | Accessibility |

**Steps to reproduce**
1. Go to any onboarding screen, for example Review our terms.
2. Press **Tab** repeatedly to move through the page.
3. Inspect the "Sign Out" item in the footer.

**Expected:** "Sign Out" is a `<button>` or `<a>` that can be reached with **Tab**, used with **Enter**, and announced by screen readers as a button or link.

**Actual:** "Sign Out" is a plain `<div>` with a click handler. It can't be reached with the keyboard and screen readers don't announce it as something you can use.

---

### BUG-OB-010 Invite emails can only be removed by clicking plain text

| | |
|---|---|
| **Area** | Step 4/4 Collaborate with your team, added invites |
| **Severity** | Medium |
| **Type** | Accessibility |

**Steps to reproduce**
1. Go to Step 4/4 "Collaborate with your team".
2. Add `qa.invite.one@example.com` (type it and press **Enter**).
3. Try to remove it with the keyboard, then hover over it with the mouse.
4. Click the added email.

**Expected:** Each added invite has a visible remove button (for example "x") that works with the keyboard and has an accessible name such as "Remove qa.invite.one@example.com".

**Actual:** The invite is a plain `<span>` with no remove button and a normal cursor. Clicking anywhere on it removes it, which users can't discover and keyboard users can't do.

---

### BUG-OB-011 "Phone Number" label is not linked to its field

| | |
|---|---|
| **Area** | Step 3/4 Workspace Setup, Phone Number |
| **Severity** | Low |
| **Type** | Accessibility |

**Steps to reproduce**
1. Go to Step 3/4 "Workspace Setup".
2. Click the label text "Phone Number *", or inspect the field with a screen reader or the browser's accessibility tree.

**Expected:** Clicking the label focuses the field, and the field is announced as "Phone Number".

**Actual:** The label isn't linked to the input (`input[name=phoneNumber]`). The field is announced by its placeholder, "1 (702) 123-4567", and clicking the label does nothing. The other fields on this step are linked correctly.

---

### BUG-OB-012 Signature "Name" label is not linked to its field

| | |
|---|---|
| **Area** | Add your signature, Signature dialog, Type tab |
| **Severity** | Low |
| **Type** | Accessibility |

**Steps to reproduce**
1. Go to Add your signature (`/app/add-signature`).
2. Click **Add signature**, then the **Type** tab.
3. Click the label text "Name", or inspect the field with a screen reader.

**Expected:** The field is announced as "Name", and clicking the label focuses it.

**Actual:** The `<label>` has no `for` attribute, so it isn't linked. The field is announced by its placeholder, "Type your signature".

---

## Copy and consistency

### BUG-OB-013 Typos and inconsistent capitalization in headings and toasts

| | |
|---|---|
| **Area** | Several steps |
| **Severity** | Low |
| **Type** | Copy |

**Steps to reproduce:** Complete onboarding as described in "How to reach each step", and read the headings and toasts.

| Where | Actual text | Suggested text |
|---|---|---|
| Step 1/4 heading | "Lets get to know you" | "Let's get to know you" |
| Step 1/4 toast after Continue | "Profile created Successfully" | "Profile created successfully" |
| Organization terms toast after Continue | "WorkSpace Created Successfully!" | "Workspace created successfully!" |
| Step 3/4 toast after Continue | "Save Successfully!" | "Saved successfully!" |
| Step 4/4 toast when **Send invites** is clicked with no emails | "Please add atleast one email" | "Please add at least one email" |

---

### BUG-OB-014 Two different screens use the heading "Review our terms"

| | |
|---|---|
| **Area** | Review our terms (`/app/review-terms`) and the organization terms (`/app/onboarding`) |
| **Severity** | Low |
| **Type** | UX |

**Steps to reproduce**
1. Sign in with a new account. The first screen is "Review our terms" (the user's own terms: Terms of Service, Privacy Policy, Electronic Signature Disclosure, AI Disclosure, HIPAA Acknowledgement).
2. Continue through Step 1/4 and Step 2/4.
3. After entering the company name on Step 2/4, a second screen also called "Review our terms" opens (organization terms: Master Service Agreement, Privacy Policy, Business Associate Agreement, Terms of Service).

**Expected:** The second screen has its own heading, for example "Review your organization's agreements", and shows where the user is in the flow.

**Actual:** Both screens have the same heading and the same text, "Please agree to the terms below to continue." The second screen has no step number, although the screens before and after it show "2/4" and "3/4". Users may think they are seeing the same page again.

---

## Not filed as a bug (for the developers to confirm)

- **Workspace name sent with hyphens.** On the organization terms, `POST /api/workspaces` sends the name as `QA-Onboard-391897`. Step 3/4 then shows and saves it as `QA Onboard 391897` (`PATCH /api/workspaces/:id`). This may be an intended slug.
- **Saved step skips 4.** Progress is saved with `POST /api/users/user-metadata` as `{step:1}`, `{step:2}`, `{step:3}`, and then `{step:5}` after **Skip for now**. `{step:4}` is never sent. This may be intended when invites are skipped.
