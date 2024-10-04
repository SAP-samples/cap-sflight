sap.ui.define(["sap/fe/test/ObjectPage"], function (ObjectPage) {
  "use strict";

  const CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new ObjectPage(
    {
      appId: "sap.fe.cap.travel_analytics",
      componentId: "BookingsObjectPage",
      entitySet: "Bookings",
    },
    CustomPageDefinitions
  );
});
