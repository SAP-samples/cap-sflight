sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "sap/fe/cap/travel_alp/test/integration/OpaJourney",
    "sap/fe/cap/travel_alp/test/integration/pages/BookingsList",
    "sap/fe/cap/travel_alp/test/integration/pages/BookingsObjectPage",
  ],
  function (JourneyRunner, opaJourney, BookingsList, BookingsObjectPage) {
    "use strict";

    const runner = new JourneyRunner({
      // start index.html in web folder
      launchUrl:
        sap.ui.require.toUrl("sap/fe/cap/travel_alp") + "/index.html",
    });

    runner.run(
      {
        pages: {
          onTheBookingsList: BookingsList,
          onTheBookingsObjectPage: BookingsObjectPage,
        },
      },
      opaJourney.run
    );
  }
);
