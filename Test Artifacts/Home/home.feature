# Complya Home Page - navigation and page load BDD scenarios
# Source plan: Test Artifacts/Home/Home_Test_Plan.md
# URLs, titles and headings verified live on https://complya.dev on 2026-10-30.
# Automated in tests/home/ (pages/homepage.js and the destination page objects).
# Priority tags: @P0 = critical business flow, @P1 = high.
# Documentation only: this project has no Cucumber runner.

Feature: Home page navigation
  As a visitor to the Complya website
  I want every link on the home page to open the right page
  So that I can find the product, book a demo, log in or read the legal documents

  Background:
    Given I am a new visitor who is not signed in

  @P0 @HP-001
  Scenario: HP-001 Home page loads at the root URL
    When I open "https://complya.dev/"
    Then I should be on the "/" page
    And the page title should be "Complya | AI-Native ABA Practice Management Software"
    And I should see the heading "Built for the people who provide care."

  @P1 @HP-002
  Scenario: HP-002 Legacy /home URL redirects to the home page
    When I open "https://complya.dev/home"
    Then I should be redirected to the "/" page
    And I should see the heading "Built for the people who provide care."

  @P0 @HP-003
  Scenario Outline: HP-003 Header "<link>" link opens the correct page
    Given I am on the home page
    When I click "<link>" in the header
    Then I should be on the "<path>" page
    And the page title should be "<title>"
    And I should see the heading "<heading>"

    Examples:
      | link         | path         | title                                                 | heading                                |
      | Complya home | /            | Complya \| AI-Native ABA Practice Management Software | Built for the people who provide care. |
      | AI           | /product/ai  | AI Session Notes & Progress Reports for ABA \| Complya | Notes and reports, drafted in minutes. |
      | Pricing      | /pricing     | ABA Software Pricing: One Plan, AI Included \| Complya | One plan. Every feature. AI included.  |
      | Book a demo  | /requestdemo | Book a Demo \| Complya                                | Tell us about your practice.           |

  @P0 @HP-004
  Scenario: HP-004 Header "Log in" link opens the app sign-in page
    Given I am on the home page
    When I click "Log in" in the header
    Then I should be taken to "https://app.complya.dev/app/sign-in"
    And I should see the email field "Enter your email address"

  @P1 @HP-005
  Scenario Outline: HP-005 "<menu>" menu link opens the correct page
    Given I am on the home page
    When I hover the "<menu>" menu in the header
    Then the "<menu>" menu should be expanded
    When I click "<link>" in the "<menu>" menu
    Then I should be on the "<path>" page
    And the page should load with its title and heading

    Examples:
      | menu      | link        | path              |
      | Product   | 02 Clinical | /product/clinical |
      | Solutions | Owners      | /solutions/owners |
      | Company   | Contact     | /contact          |

  @P1 @HP-006
  Scenario Outline: HP-006 "<link>" link in the <section> section opens the correct page
    Given I am on the home page
    When I click "<link>" in the <section> section
    Then I should be on the "<path>" page
    And the page should load with its title and heading

    Examples:
      | section                 | link                        | path                  |
      | hero                    | New Meet Complya AI agents  | /product/ai/agents    |
      | hero                    | Book a demo                 | /requestdemo          |
      | hero                    | Explore the platform        | /platform             |
      | For the whole care team | See Complya for RBTs        | /solutions/therapists |
      | Our mission             | Read our story              | /about                |
      | Complya AI              | Explore Complya AI          | /product/ai           |
      | Complya AI              | See it on your data         | /requestdemo          |
      | Compliance & security   | Security, HIPAA and our BAA | /security             |
      | Pricing                 | See pricing details         | /pricing              |
      | closing call to action  | Book a demo                 | /requestdemo          |
      | closing call to action  | See pricing                 | /pricing              |

  @P1 @HP-007
  Scenario Outline: HP-007 Platform card "<card>" opens its product page
    Given I am on the home page
    When I click the "<card>" card in the platform section
    Then I should be on the "<path>" page
    And I should see the heading "<heading>"

    Examples:
      | card          | path                | heading                                      |
      | 01 AI         | /product/ai         | Notes and reports, drafted in minutes.       |
      | 02 Clinical   | /product/clinical   | Great care runs on great data.               |
      | 03 Compliance | /product/compliance | Compliance should be continuous.             |
      | 04 Revenue    | /product/revenue    | Every hour delivered. Every hour paid.       |
      | 05 Operations | /product/operations | Scheduling, records and teams, in one place. |
      | 06 Insights   | /product/insights   | Your whole practice, in ten reports.         |

  @P1 @HP-008
  Scenario Outline: HP-008 Footer "<link>" link opens the correct page
    Given I am on the home page
    When I click "<link>" in the footer
    Then I should be on the "<path>" page
    And I should see the heading "<heading>"

    Examples:
      | link                         | path                        | heading                                         |
      | Complya home                 | /                           | Built for the people who provide care.          |
      | Platform                     | /platform                   | One record for the whole practice.              |
      | AI                           | /product/ai                 | Notes and reports, drafted in minutes.          |
      | Clinical                     | /product/clinical           | Great care runs on great data.                  |
      | Compliance                   | /product/compliance         | Compliance should be continuous.                |
      | Revenue                      | /product/revenue            | Every hour delivered. Every hour paid.          |
      | Operations                   | /product/operations         | Scheduling, records and teams, in one place.    |
      | Insights                     | /product/insights           | Your whole practice, in ten reports.            |
      | Pricing                      | /pricing                    | One plan. Every feature. AI included.           |
      | Owners                       | /solutions/owners           | Grow your practice and get paid for every hour. |
      | Clinicians                   | /solutions/clinical-leaders | Lead care with every session in view.           |
      | Therapists                   | /solutions/therapists       | Stay present with your client.                  |
      | Billing                      | /solutions/billing          | Clean claims, followed to payment.              |
      | About                        | /about                      | Built by people who've run care organizations.  |
      | Security                     | /security                   | Your clients' records, protected.               |
      | Contact                      | /contact                    | How can we help?                                |
      | Support                      | /contact/support            | We're here to help.                             |
      | Download                     | /download                   | Complya for iPhone and Android.                 |
      | Docs                         | /docs                       | Overview                                        |
      | Master Service Agreement     | /msa                        | Master Service Agreement                        |
      | Business Associate Agreement | /baa                        | Business Associate Agreement                    |
      | Terms of Service             | /terms                      | Terms of Service                                |
      | Privacy Policy               | /privacy                    | Privacy Policy                                  |
      | Subprocessors                | /legal/subprocessors        | Subprocessors                                   |
      | Cookie Policy                | /legal/cookies              | Cookie Policy                                   |
      | All legal documents          | /legal                      | Agreements and policies                         |

  @P1 @HP-009
  Scenario Outline: HP-009 Footer <store> link opens the store in a new tab
    Given I am on the home page
    When I click "<link>" in the footer
    Then a new tab should open
    And the new tab URL should contain "<url>"
    And the original tab should still be on the home page

    Examples:
      | store       | link                              | url                                               |
      | App Store   | Download Complya on the App Store | apps.apple.com/us/app/complya/id6760423936        |
      | Google Play | Get Complya on Google Play        | play.google.com/store/apps/details?id=com.complya |
