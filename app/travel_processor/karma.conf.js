function ODataServicesFactory(config, logger) {
  const { exec } = require("child_process"),
    { createProxyMiddleware } = require("http-proxy-middleware"),
    log = logger.create("odata-services"),
    options = config.cap,
    port = options.port || 4004,
    cwd = options.root || __dirname;

  const server = new Promise((resolve, reject) => {
    const proc = exec("npx cds run", {
      cwd: cwd,
      env: { ...process.env, PORT: port },
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.stdout.on("data", (data) => {
      data = data.toString().trim();
      log.info(data);
      if (data.includes("server listening on")) {
        log.info("Server ready");
        resolve(proc);
      }
    });

    proc.stderr.on("data", (data) => {
      log.error(data.toString().trim());
    });

    proc.on("close", (code, signal) => {
      log.info(`CDS server exited with code ${code} by signal ${signal}`);
      if (code) reject(code);
    });
  });

  return createProxyMiddleware("!/base/**", {
    target: `http://localhost:${port}`,
    async pathRewrite(path) {
      await server;
      return path;
    },
    logProvider(provider) {
      return log;
    },
  });
}

ODataServicesFactory.$inject = ["config", "logger"];

process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function (config) {
  const port = process.env.PORT || 4004;

  config.set({
    frameworks: ["ui5", "qunit"],
    logLevel: "ERROR", // log errors only. Change to "DEBUG" for more verbosity
    proxies: {
      "/base/webapp/processor": "/processor",
    },
    client: {
      qunit: {
        showUI: true,
        testTimeout: 100000,
      },
    },
    ui5: {
      mode: "script",
      config: {
        bindingSyntax: "complex",
        language: "en",
        async: true,
        animation: false,
        libs: "sap.fe.core,sap.ui.core,sap.fe.test",
        compatVersion: "edge",
        theme: "sap_fiori_3",
        logLevel: "ERROR",
        resourceRoots: {
          "sap.fe.cap.travel": "./base/webapp",
          test: "./base/webapp/test/",
        },
      },
      tests: ["sap/fe/cap/travel/test/integration/Opa.qunit"],
    },
    plugins: [
      ...config.plugins,
      { "middleware:odata-services": ["factory", ODataServicesFactory] },
    ],
    middleware: ["odata-services"],
    reporters: ["mocha"],
    cap: {
      port: port,
      root: "../..",
    },
    browsers: ["CustomChromeHeadless"],
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
