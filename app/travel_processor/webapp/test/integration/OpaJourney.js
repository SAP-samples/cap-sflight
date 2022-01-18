/* global QUnit */
/*eslint no-unused-vars: 0*/
sap.ui.define(["sap/ui/test/opaQunit"], function (opaTest) {
  "use strict";

  var Journey = {
    start: function () {
      QUnit.module("Sample journey");
      opaTest("#000: Start", function (Given, When, Then) {
        Given.iResetTestData().and.iStartMyApp("", { "sap-language": "EN" });
      });
      return Journey;
    },

    test: function () {
      opaTest(
        "#1: ListReport: Check List Report Page loads",
        function (Given, When, Then) {
          Then.onTheMainPage.iSeeThisPage();
        }
      );

      opaTest(
        "#2: Object Page: Check Object Page loads",
        function (Given, When, Then) {
          When.onTheMainPage.onTable().iPressRow({ TravelID: "4133" });
          Then.onTheDetailPage.iSeeThisPage();

          When.iNavigateBack();
          Then.onTheMainPage.iSeeThisPage();
        }
      );

      opaTest("#3: List report: Create travel", function (Given, When, Then) {
        Then.onTheMainPage.iSeeThisPage();
        Then.onTheMainPage.onTable().iCheckAction("Create", { enabled: true });

        // Click on Create button
        When.onTheMainPage.onTable().iExecuteAction("Create");
        Then.onTheDetailPage.iSeeObjectPageInEditMode();
        When.onTheDetailPage.iOpenSectionWithTitle("Travel");

        // Value help Agency ID
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "TravelData" })
          .iOpenValueHelp({ property: "to_Agency_AgencyID" });
        When.onTheDetailPage
          .onValueHelpDialog()
          .iSelectRows({ 0: "070006" })
          .and.iConfirm();

        // Value help Customer ID
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "TravelData" })
          .iOpenValueHelp({ property: "to_Customer_CustomerID" });
        When.onTheDetailPage
          .onValueHelpDialog()
          .iSelectRows({ 0: "000001" })
          .and.iConfirm();

        // Starting date
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "DateData" })
          .iChangeField({ property: "BeginDate" }, "Jan 1, 2023");

        // End date
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "DateData" })
          .iChangeField({ property: "EndDate" }, "Dec 31, 2024");

        // Booking fee
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "PriceData" })
          .iChangeField({ property: "BookingFee" }, "50.00");

        // Description
        When.onTheDetailPage
          .onForm({ section: "Travel", fieldGroup: "TravelData" })
          .iChangeField({ property: "Description" }, "Travel for deletion");

        // Save all
        Then.onTheDetailPage.onFooter().iCheckDraftStateSaved();
        When.onTheDetailPage.onFooter().iExecuteSave();
        Then.onTheDetailPage.iSeeThisPage().and.iSeeObjectPageInDisplayMode();
        When.iNavigateBack();
      });

      opaTest("#4: List report: Delete travel", function (Given, When, Then) {
        Then.onTheMainPage.iSeeThisPage();

        Then.onTheMainPage
          .onTable()
          .iCheckDelete({ visible: true, enabled: false });

        // select row to be deleted
        Given.onTheMainPage
          .onTable()
          .iSelectRows({ Description: "Travel for deletion" });

        Then.onTheMainPage
          .onTable()
          .iCheckDelete({ visible: true, enabled: true });
        When.onTheMainPage
          .onTable()
          .iExecuteDelete()
          .and.when.onDialog()
          .iConfirm();
        Then.onTheMainPage
          .onTable()
          .iCheckDelete({ visible: true, enabled: false });
      });

      opaTest(
        "#5: List report: Check actions (Accept, Reject)",
        function (Given, When, Then) {
          Then.onTheMainPage.iSeeThisPage();

          // Check that bound action is inactive without selection
          Then.onTheMainPage
            .onTable()
            .iCheckAction(
              { service: "TravelService", action: "acceptTravel" },
              { visible: true, enabled: false }
            );

          // select first row
          Given.onTheMainPage.onTable().iSelectRows({ TravelID: "4132" });

          // Check that bound action is now active after selection
          Then.onTheMainPage
            .onTable()
            .iCheckAction(
              { service: "TravelService", action: "acceptTravel" },
              { visible: true, enabled: true }
            );

          // check that "Travel status" is Open
          Then.onTheMainPage
            .onTable()
            .iCheckRows({ TravelID: "4132", "Travel Status": "Open" }, 1);

          // trigger action
          When.onTheMainPage.onTable().iExecuteAction({
            service: "TravelService",
            action: "acceptTravel",
          });

          // check that "Travel status" is now Accepted
          Then.onTheMainPage
            .onTable()
            .iCheckRows({ TravelID: "4132", "Travel Status": "Accepted" }, 1);

          // unselect first row
          Given.onTheMainPage.onTable().iSelectRows({ TravelID: "4132" });

          // select 2nd row
          Given.onTheMainPage.onTable().iSelectRows({ TravelID: "4131" });

          // check that "Travel status" is Open
          Then.onTheMainPage
            .onTable()
            .iCheckRows({ TravelID: "4131", "Travel Status": "Open" }, 1);

          // trigger action
          When.onTheMainPage.onTable().iExecuteAction({
            service: "TravelService",
            action: "rejectTravel",
          });

          // check that "Travel status" is Open
          Then.onTheMainPage
            .onTable()
            .iCheckRows({ TravelID: "4131", "Travel Status": "Canceled" }, 1);

          // unselect 2nd row
          Given.onTheMainPage.onTable().iSelectRows({ TravelID: "4131" });

          Then.onTheMainPage.iSeeThisPage();
        }
      );

      return Journey;
    },
    end: function () {
      opaTest("#999: Tear down", function (Given, When, Then) {
        Given.iTearDownMyApp();
      });
      return Journey;
    },
  };
  Journey.run = function () {
    Journey.start().test().end();
  };

  return Journey;
});
