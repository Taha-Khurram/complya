# Complya Home Page - BDD scenarios
# Source plan: Test Artifacts/home-test-plan.md
# Priority tags: @P0 = critical business flow, @P1 = high, @P2 = medium/low
# Documentation only: this project has no Cucumber runner.

Feature: Home Page
  As a visitor to the Complya website
  I want the home page to load and its links to take me to the right places
  So that I can learn about Complya, book a demo, log in or download the app

  Background:
    Given I open the Complya website at "https://complya.dev"
    And I am on the "/home" page

  # ---------- P0: Critical ----------

  @P0 @HP-001
  Scenario: Root URL redirects to the home page
    Then the page URL should contain "/home"
    And I should not see an error page

  @P0 @HP-002
  Scenario: Hero heading is visible
    Then I should see the heading "The All-in-One Platform for Modern Care Management"

  @P0 @HP-003
  Scenario: User opens the app login from the navigation bar
    When I click "Login" in the navigation bar
    Then I should be taken to "https://app.complya.dev/app/"

  @P0 @HP-004
  Scenario: User books a demo from the navigation bar
    When I click "Book a demo" in the navigation bar
    Then I should be taken to the "/home/requestdemo" page
    And the page should load without errors

  @P0 @HP-005
  Scenario: User books a demo from the hero section
    When I click "Book a demo" in the hero section
    Then I should be taken to the "/home/requestdemo" page
    And the page should load without errors

  # ---------- P1: High ----------

  @P1 @HP-006
  Scenario: App Store link opens in a new tab
    When I click "Download on the App Store"
    Then a new tab should open
    And the new tab URL should contain "apps.apple.com/us/app/complya/id6760423936"
    And the original tab should still be on the "/home" page

  @P1 @HP-007
  Scenario: Google Play link opens in a new tab
    When I click "Get Complya on Google Play"
    Then a new tab should open
    And the new tab URL should contain "play.google.com/store/apps/details?id=com.complya"
    And the original tab should still be on the "/home" page

  @P1
  Scenario Outline: Footer link opens the correct page
    When I click "<link>" in the footer
    Then I should be taken to the "<path>" page

    @HP-008 @HP-009 @HP-010 @HP-011 @HP-012 @HP-013 @HP-014
    Examples:
      | id     | link                               | path           |
      | HP-008 | Download App                       | /home/download |
      | HP-009 | Support                            | /home/contact  |
      | HP-010 | MSA - Master Service Agreement     | /home/msa      |
      | HP-011 | BAA - Business Associate Agreement | /home/baa      |
      | HP-012 | Privacy                            | /home/privacy  |
      | HP-013 | Terms of Service                   | /home/terms    |
      | HP-014 | Document                           | /home/docs     |

  @P1 @HP-015
  Scenario Outline: Destination pages load without errors
    When I click "<link>" in the <section>
    Then I should be taken to the "<path>" page
    And the page response status should be below 400
    And the page should not show a "404" or error message

    Examples:
      | link                               | section        | path              |
      | Book a demo                        | navigation bar | /home/requestdemo |
      | Download App                       | footer         | /home/download    |
      | Support                            | footer         | /home/contact     |
      | MSA - Master Service Agreement     | footer         | /home/msa         |
      | BAA - Business Associate Agreement | footer         | /home/baa         |
      | Privacy                            | footer         | /home/privacy     |
      | Terms of Service                   | footer         | /home/terms       |
      | Document                           | footer         | /home/docs        |

  # ---------- P2: Medium / Low ----------

  @P2 @HP-016
  Scenario: Navigation logo returns to the home page
    When I click the Complya logo in the navigation bar
    Then I should be on the "/home" page
    And I should see the heading "The All-in-One Platform for Modern Care Management"

  @P2 @HP-017
  Scenario: Footer logo returns to the home page
    When I click the Complya logo in the footer
    Then I should be on the "/home" page
    And I should see the heading "The All-in-One Platform for Modern Care Management"

  @P2 @HP-018
  Scenario: Footer Homepage link returns to the home page
    When I click "Homepage" in the footer
    Then I should be on the "/home" page
    And I should see the heading "The All-in-One Platform for Modern Care Management"

  @P2 @HP-019
  Scenario: Smarter Workflow Management section is visible
    When I scroll to the "Smarter Workflow Management" section
    Then I should see the heading "Smarter Workflow Management"

  @P2 @HP-020
  Scenario: Copyright text is visible in the footer
    When I scroll to the footer
    Then I should see the text "© 2026 Complya"
