Feature: Add tests

  Scenario: First tests
    Given we have started the application
      And we have opened the url "/travel_processor/webapp/index.html" with user "alice"
    When we search for "claire"
    Then we expect table "Travels" to have 18 records
