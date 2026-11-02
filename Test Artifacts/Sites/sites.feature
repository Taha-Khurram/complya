# Complya Sites - BDD scenarios
# Source: Test Artifacts/Sites/Sites_BDD_Scenarios.md
# UI text verified live on https://app.complya.dev on 2026-11-02.
# UI-driven only: sign in, sidebar, Settings card, Add button, dialog, list and site details. No direct URLs or API checks.
# Test data (<account_email>, <account_password>) comes from WORKSPACE_EMAIL and WORKSPACE_PASSWORD in .env, never from this file.
# <account_email> is the "QA Onboard 984491" account (an approved workspace). The login account (USER_EMAIL) is never used here.
# Verification runs through Stedi: a site is verified when its NPI is valid and real, unless the NPI + EIN are already used by another site.
# SI-001 uses new valid data on every run (a real NPI and EIN that no site uses yet). <valid_*> values are supplied at run time, never written here.
# Sites cannot be deleted from the UI, so every created site stays in the workspace. Site names must be unique per run.
# The tests run in parallel and SI-001/SI-002 add sites, so each scenario finds its site by its unique name, not by row position or an exact count.
# Automated in tests/sites/ (pages/sitespage.js, utils/sitedata.js).
# Documentation only: this project has no Cucumber runner.

Feature: Sites - create a site
  As a signed-in Complya workspace user
  I want to add a site from Settings
  So that my organization's locations are set up and verified

  Background:
    Given I am signed in to an approved workspace
    And I have opened the "Sites" page from the Settings page

  @sites @smoke @positive @SI-001
  Scenario: SI-001 Create a site with new valid data
    Given I have new valid site data whose NPI and EIN no site uses yet
    And I note the site count shown above the sites table
    When I click "Add"
    Then I should see the "New Site" dialog
    When I fill in the New Site form:
      | field         | value                 |
      | Site Name     | QA Site <timestamp>   |
      | NPI           | <valid_npi>           |
      | EIN           | <valid_ein>           |
      | Phone No      | <valid_phone>         |
      | Billing Email | <valid_billing_email> |
      | Address       | <valid_address>       |
      | City          | <valid_city>          |
      | ZIP Code      | <valid_zip>           |
      | State         | <valid_state>         |
    And I click "Save"
    Then I should see the message "Site created and verified"
    And the "New Site" dialog should close
    And the site count should go up
    And the sites table should show "QA Site <timestamp>" with <valid_address>, <valid_city>, <valid_state> and <valid_zip>
    And the "QA Site <timestamp>" row should show the verification status "Active"
    When I click "QA Site <timestamp>" in the sites table
    Then I should see the site name "QA Site <timestamp>"
    And I should see the status "Active"
    And I should not see "Verification failed"

  @sites @positive @SI-002
  Scenario: SI-002 A site with an NPI and EIN already in use is created but not verified
    Given I note the site count shown above the sites table
    When I click "Add"
    And I fill in the New Site form:
      | field         | value                  |
      | Site Name     | QA Site <timestamp>    |
      | NPI           | 1234567893             |
      | EIN           | 12-3456789             |
      | Phone No      | (512) 555-0100         |
      | Billing Email | billing.qa@example.com |
      | Address       | 100 Congress Ave       |
      | City          | Austin                 |
      | ZIP Code      | 78701                  |
      | State         | TX                     |
    And I click "Save"
    Then I should see the message "Site created, but verification failed: Another Complya organization already uses this NPI + EIN. Give this site its own NPI and EIN."
    And the "New Site" dialog should close
    And the site count should go up
    And the "QA Site <timestamp>" row should show the verification status "Verification failed"
    When I click "QA Site <timestamp>" in the sites table
    Then I should see the status "Verification failed"
    And I should see "Another Complya organization already uses this NPI + EIN. Give this site its own NPI and EIN."
    And I should see "NPI is already used by another site"
    And I should see "EIN is already used by another site"
    And I should see the "Retry" button

  @sites @smoke @negative @SI-003
  Scenario: SI-003 Required fields are enforced
    When I click "Add"
    And I click "Save" without filling in any field
    Then I should see these messages in the "New Site" dialog:
      | message                   |
      | Site Name is required     |
      | NPI is required           |
      | EIN is required           |
      | Phone No is required      |
      | Billing email is required |
      | Address is required       |
      | City is required          |
      | ZIP is required           |
      | State is required         |
    And the "New Site" dialog should stay open
    When I click "Cancel"
    Then the "New Site" dialog should close

  @sites @negative @SI-004
  Scenario Outline: SI-004 Invalid format is rejected - <field>
    When I click "Add"
    And I enter "<value>" in "<field>"
    And I click "Save"
    Then I should see "<message>" under "<field>"
    And the "New Site" dialog should stay open

    Examples:
      | field         | value        | message                                |
      | NPI           | 123          | NPI must be exactly 10 digits          |
      | EIN           | 12           | EIN must be in the format XX-XXXXXXX   |
      | Billing Email | not-an-email | Billing email must be a valid email    |

  @sites @positive @SI-005
  Scenario Outline: SI-005 Closing the dialog does not create a site - <button>
    When I click "Add"
    And I enter "QA Discard <timestamp>" in "Site Name"
    And I click "<button>" in the "New Site" dialog
    Then the "New Site" dialog should close
    And I should not see "QA Discard <timestamp>" in the sites table
    When I click "Add"
    Then "Site Name" should be empty

    Examples:
      | button |
      | Cancel |
      | Close  |
