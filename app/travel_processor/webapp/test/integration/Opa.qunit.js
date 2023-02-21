sap.ui.require(
  [
    "sap/fe/test/JourneyRunner",
    "sap/fe/cap/travel/test/integration/pages/MainListReport",
    "sap/fe/cap/travel/test/integration/pages/MainObjectPage",
    "sap/fe/cap/travel/test/integration/pages/ItemObjectPage",
    "sap/fe/cap/travel/test/integration/OpaJourney",
  ],
  function (
    JourneyRunner,
    MainListReport,
    MainObjectPage,
    ItemObjectPage,
    Journey
  ) {
    "use strict";

    const runner = new JourneyRunner({
      // start index.html in web folder
      launchUrl: sap.ui.require.toUrl("sap/fe/cap/travel") + "/index.html",
      opaConfig: { timeout: 30 },
    });

    runner.run(
      {
        pages: {
          onTheMainPage: MainListReport,
          onTheDetailPage: MainObjectPage,
          onTheDetailItemPage: ItemObjectPage,
        },
      },
      Journey.run
    );
  }
);
