const spawn = require("cross-spawn"),
  HttpProxy = require("http-proxy");

function spawnServer(cmd, args, cwd, fnIsReady) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd,
      stdio: ["ignore", "pipe", "inherit"],
    });

    const checkServerReady = (data) => {
      const targetUrl = fnIsReady(data.toString());
      if (targetUrl) {
        proc.stdout.removeListener("data", checkServerReady);
        resolve(targetUrl);
      }
    };

    proc.on("close", reject);
    proc.stdout.on("data", checkServerReady);
  });
}

function createKarmaMiddleware(serverUrl, auth) {
  const proxyOptions = {
    target: serverUrl,
    auth: auth ? `${auth.user}:${auth.password}` : undefined,
  };

  const middleware = (logFactory) => {
    const log = logFactory.create("cap-server");

    const proxy = new HttpProxy(proxyOptions);
    proxy.on("error", (data) => log.error(data.toString()));

    return (req, res) => {
      proxy.web(req, res);
    };
  };

  middleware.$inject = ["logger"];
  return { "middleware:cap-proxy": ["factory", middleware] };
}

async function node() {
  const isReady = (data) => {
    const started = data.match(/server listening on {.*url:.*'(?<url>.+)'.*}/);
    if (started) return new URL(started.groups.url);
  };
  const serverUrl = await spawnServer("npm", ["start"], "../..", isReady);

  return createKarmaMiddleware(serverUrl, { user: "admin", password: "admin" });
}

module.exports = { node };
