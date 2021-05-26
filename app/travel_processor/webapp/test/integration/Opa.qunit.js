sap.ui.define(
  [
    "sap/fe/test/JourneyRunner",
    "test/integration/pages/MainListReport",
    "test/integration/pages/MainObjectPage",
    "test/integration/OpaJourney",
  ],
  function (JourneyRunner, MainListReport, MainObjectPage, Journey) {
    "use strict";

    var journeyRunner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("sap/fe/cap/travel") + "/index.html",
    });

    journeyRunner.run(
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
