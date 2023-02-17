/* global QUnit */
sap.ui.define(["sap/ui/test/opaQunit"], function (opaTest) {
  "use strict";

  return {
    run: function () {
      QUnit.module("Travel Analytics Tests");

      opaTest("Start application", function (Given, When, Then) {
        Given.iStartMyApp();

        Then.onTheBookingsList.iSeeThisPage();
      });

      opaTest("Teardown", function (Given /*, When, Then*/) {
        // Cleanup
        Given.iTearDownMyApp();
      });
    },
  };
});
