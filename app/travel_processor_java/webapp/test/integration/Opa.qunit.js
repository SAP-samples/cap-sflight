sap.ui.define(
  [
    "sap/fe/test/JourneyRunner",
    "test/integration/pages/MainListReport",
    "test/integration/pages/MainObjectPage",
    "test/integration/OpaJourney"
  ],
  function (JourneyRunner, MainListReport, MainObjectPage, Journey) {
    "use strict";

    var JourneyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl:
        sap.ui.require.toUrl("sap/fe/samples/cap/travelprocessor") +
        "/index.html",
    });

    JourneyRunner.run(
      {
        pages: {
          onTheMainPage: MainListReport,
          onTheDetailPage: MainObjectPage,
        },
      },
      Journey.run
    );
  }
);
