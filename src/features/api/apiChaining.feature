@api @chain
Feature: API user lifecycle chaining
  JSONPlaceholder simulates writes and does not persist the user created by POST.

  Scenario: Create, read, replace, patch, and delete a user using the response ID
    Given the API service is ready
    When I send a GET request to "/users"
    Then the API response status should be 200
    And the response body should be a non-empty JSON array
    When I create a generated user
    Then the API response status should be 201
    And I store the created user ID from the response
    When I retrieve the created user by its stored ID
    Then the API response status should be 404
    When I replace the created user using its stored ID
    Then the API response status should be 500
    When I partially update the created user using its stored ID
    Then the API response status should be 200
    And the response should contain the updated user name
    When I delete the created user using its stored ID
    Then the API response status should be 200
