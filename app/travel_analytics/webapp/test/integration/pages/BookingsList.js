sap.ui.define(["sap/fe/test/ListReport"], function (ListReport) {
  "use strict";

  const CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new ListReport(
    {
      appId: "sap.fe.cap.travel_analytics",
      componentId: "BookingsList",
      entitySet: "Bookings",
    },
    CustomPageDefinitions
  );
});
