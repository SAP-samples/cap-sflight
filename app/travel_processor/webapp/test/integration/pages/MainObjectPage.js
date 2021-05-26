sap.ui.define(["sap/fe/test/ObjectPage"], function (ObjectPage) {
  "use strict";

  // OPTIONAL
  var AdditionalCustomObjectPageDefinition = {
    actions: {},
    assertions: {},
  };

  return new ObjectPage(
    {
      appId: "sap.fe.cap.travel",
      componentId: "TravelObjectPage",
      entitySet: "Travel",
    },
    AdditionalCustomObjectPageDefinition
  );
});
