@api
Feature: Simulated user CRUD operations
  Scenario: Replace, partially update, and delete an existing mock user
    Given the API service is ready
    When I replace existing user 1 with generated data
    Then the API response status should be 200
    And the response should contain user ID 1
    When I patch existing user 1 with a generated name
    Then the API response status should be 200
    And the response should contain the patched name
    When I delete existing user 1
    Then the API response status should be 200
