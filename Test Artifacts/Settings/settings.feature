# Complya Settings - BDD scenarios
# Source: Test Artifacts/Settings/Settings_BDD_Scenarios.md
# UI text verified live on https://app.complya.dev on 2026-11-02.
# Automated in tests/settings/ (pages/dashboardpage.js, pages/settingspage.js). UI-driven only, except ST-004, which opens /app/settings directly.
# Test data (<account_email>, <account_password>) comes from WORKSPACE_EMAIL and WORKSPACE_PASSWORD in .env, never from this file.
# <account_email> is the "QA Onboard 984491" account (an approved workspace). The login account (USER_EMAIL) is never used here.
# Documentation only: this project has no Cucumber runner.

Feature: Settings
  As a signed-in Complya workspace user
  I want to open Settings and each settings page from it
  So that I can manage my workspace configuration

  @settings @smoke @positive @ST-001
  Scenario: ST-001 Settings opens from the sidebar
    Given I am signed in to an approved workspace
    And I have closed the Home tour
    When I click "Settings" in the sidebar
    Then I should be taken to "/app/settings"
    And I should see the heading "Settings"
    And I should see the cards "Sites", "Plans", "Legal & Compliance", "Services", "Goals Library", "Note Templates", "Notifications", "Audit Logs", "Prompt Library" and "Copilot"

  @settings @smoke @positive @ST-002
  Scenario Outline: ST-002 Settings card opens its page - <card>
    Given I am signed in to an approved workspace
    And I am on the Settings page
    When I click the "<card>" card
    Then I should be taken to "<url>"
    And I should see the heading "<card>"

    Examples:
      | card               | url                                                  |
      | Sites              | /app/sites                                           |
      | Plans              | /app/plans                                           |
      | Legal & Compliance | /app/legal-compliance                                |
      | Services           | /app/servicetypes                                    |
      | Goals Library      | /app/catalog?tab=private                             |
      | Note Templates     | /app/note-templates?tab=SESSION_NOTE&page=1&limit=20 |
      | Notifications      | /app/notification-settings                           |
      | Audit Logs         | /app/activity                                        |
      | Prompt Library     | /app/prompt-library?page=1&limit=20                  |
      | Copilot            | /app/settings/copilot                                |

  # Goals Library is left out: it has no back button (Observation 1 in the .md)
  @settings @positive @ST-003
  Scenario Outline: ST-003 Back button returns to Settings - <card>
    Given I am signed in to an approved workspace
    And I have opened the "<card>" page from the Settings page
    And I am on "<url>"
    When I click the back button next to the page heading
    Then I should be taken to "/app/settings"
    And I should see the heading "Settings"

    Examples:
      | card               | url                                                  |
      | Sites              | /app/sites                                           |
      | Plans              | /app/plans                                           |
      | Legal & Compliance | /app/legal-compliance                                |
      | Services           | /app/servicetypes                                    |
      | Note Templates     | /app/note-templates?tab=SESSION_NOTE&page=1&limit=20 |
      | Notifications      | /app/notification-settings                           |
      | Audit Logs         | /app/activity                                        |
      | Prompt Library     | /app/prompt-library?page=1&limit=20                  |
      | Copilot            | /app/settings/copilot                                |

  @settings @smoke @negative @ST-004
  Scenario: ST-004 Settings is not available when signed out
    Given I am not signed in
    When I open "/app/settings"
    Then I should be taken to "/app/sign-in"
    And I should see the heading "Login"
    And I should not see the heading "Settings"
