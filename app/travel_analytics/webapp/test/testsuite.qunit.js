/* global window, parent, location */
window.suite = function () {
  "use strict";

  // eslint-disable-next-line
  const oSuite = new parent.jsUnitTestSuite(),
    sContextPath = location.pathname.substring(
      0,
      location.pathname.lastIndexOf("/") + 1
    );
  oSuite.addTestPage(sContextPath + "integration/Opa.qunit.html");

  return oSuite;
};
