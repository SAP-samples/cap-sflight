const puppeteer = require("puppeteer"),
  cap = require("../../karma-cap-middleware");

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = async (config) => {
  // start the CAP server (either specify CLI arg --server=node or --server=java)
  let capMiddleware;
  if (config.server === "node") {
    capMiddleware = cap.node();
  } else if (config.server === "java") {
    capMiddleware = cap.java();
  } else {
    throw new Error(`Unknown server type: ${config.server}`);
  }

  config.set({
    frameworks: ["ui5"],
    logLevel: "INFO", // log errors only. Change to "DEBUG" for more verbosity
    proxies: {
      "/base/webapp/": "/",
    },
    ui5: {
      failOnEmptyTestPage: true,
    },
    plugins: [...config.plugins, await capMiddleware],
    middleware: ["cap-proxy"],
    browsers: config.ci ? ["ChromeHeadless"] : ["Chrome"],
    singleRun: config.ci || config.singleRun || false
  });
};
