const spawn = require("cross-spawn"),
  kill = require("tree-kill"),
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
        resolve([targetUrl, proc.pid]);
      }
    };

    proc.on("close", reject);
    proc.stdout.on("data", checkServerReady);
  });
}

function createKarmaMiddleware(serverUrl, pid, auth) {
  const proxyOptions = {
    target: serverUrl,
    auth: auth ? `${auth.user}:${auth.password}` : undefined,
  };

  const middleware = (logFactory, emitter) => {
    const log = logFactory.create("cap-server");

    const proxy = new HttpProxy(proxyOptions);
    proxy.on("error", (data) => log.error(data.toString()));

    emitter.on("browser_complete_with_no_more_retries", () => kill(pid));

    return (req, res) => {
      proxy.web(req, res);
    };
  };

  middleware.$inject = ["logger", "emitter"];
  return { "middleware:cap-proxy": ["factory", middleware] };
}

async function java() {
  const isReady = (data) => {
    const started = data.match(/started on port\(s\): (?<port>\d+)/);
    if (started) return new URL(`http://localhost:${started.groups.port}`);
  };
  const serverUrl = await spawnServer(
    "mvn",
    ["spring-boot:run", "-B", "-Dserver.port=0"],
    "../../srv",
    isReady
  );

  return createKarmaMiddleware(serverUrl, { user: "admin", password: "admin" });
}

async function node() {
  const isReady = (data) => {
    const started = data.match(/server listening on {.*url:.*'(?<url>.+)'.*}/);
    if (started) return new URL(started.groups.url);
  };
  const [serverUrl, pid] = await spawnServer("npm", ["start"], "../..", isReady);

  return createKarmaMiddleware(serverUrl, pid, { user: "admin", password: "admin" });
}

module.exports = { java, node };
