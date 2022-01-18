const puppeteer = require("puppeteer"),
  capServer = require("./karma/cap-server");

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = async (config) => {
  // start the CAP server (either specify CLI arg --server=node or --server=java)
  const cap = await capServer[config.server]();

  config.set({
    frameworks: ["ui5", "qunit"],
    logLevel: "ERROR", // log errors only. Change to "DEBUG" for more verbosity
    proxies: {
      "/base/webapp/processor": "/processor",
    },
    client: {
      captureConsole: false,
      qunit: {
        showUI: true,
        testTimeout: 100000,
      },
    },
    ui5: {
      url: "https://ui5.sap.com",
      mode: "script",
      config: {
        bindingSyntax: "complex",
        language: "en",
        async: true,
        animation: false,
        libs: "sap.fe.core,sap.ui.core,sap.fe.test",
        compatVersion: "edge",
        theme: "sap_horizon",
        logLevel: "ERROR",
        resourceRoots: {
          "sap.fe.cap.travel": "./base/webapp",
          test: "./base/webapp/test/",
        },
      },
      tests: ["sap/fe/cap/travel/test/integration/Opa.qunit"],
    },
    plugins: [...config.plugins, cap],
    middleware: ["cap-proxy"],
    reporters: ["mocha"],
    browsers: config.ci ? ["CustomChromeHeadless"] : ["CustomChrome"],
    customLaunchers: {
      CustomChrome: {
        base: "Chrome",
        flags: ["--window-size=1280,1024", "--no-sandbox"],
      },
      CustomChromeHeadless: {
        base: "ChromeHeadless",
        flags: ["--window-size=1280,1024", "--no-sandbox"],
      },
    },
    singleRun: true,
  });
};
