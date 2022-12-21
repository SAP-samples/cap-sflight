/* global window, parent, location */
window.suite = function () {
  "use strict";

  let oSuite = new parent.jsUnitTestSuite();
  let sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/"));

  oSuite.addTestPage(`${sContextPath}/integration/Opa.qunit.html`);

  return oSuite;
};
