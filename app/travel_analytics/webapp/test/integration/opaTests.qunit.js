/*eslint no-redeclare: 0*/
sap.ui.require(
  [
    'sap/fe/test/JourneyRunner',
    'sap/fe/cap/travel_analytics/test/integration/FirstJourney',
    'sap/fe/cap/travel_analytics/test/integration/pages/BookingsList',
    'sap/fe/cap/travel_analytics/test/integration/pages/BookingsObjectPage'
  ],
  function(JourneyRunner, opaJourney, BookingsList, BookingsObjectPage) {
    'use strict';

    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl('sap/fe/cap/travel_analytics') + '/index.html'
    });

    JourneyRunner.run(
      {
        pages: {
          onTheBookingsList: BookingsList,
          onTheBookingsObjectPage: BookingsObjectPage
        }
      },
      opaJourney.run
    );
  }
);