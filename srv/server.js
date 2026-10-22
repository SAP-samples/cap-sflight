const cds = require('@sap/cds')
const { fs, isdir } = cds.utils

cds.on('bootstrap', (app) => {
  // In production the Fiori apps are static files in app/<name>/, and their
  // OData URIs are relative ("processor/"), so the browser requests
  // /<name>/processor/... Strip the app folder so the request reaches the
  // service. (In development, cds-plugin-ui5 proxies these via ui5.yaml.)
  if (!cds.env.profiles.includes('production')) return
  const appFolder = isdir(cds.env.folders.app)
  if (!appFolder) return
  const apps = new Set(fs.readdirSync(appFolder).filter((f) => isdir(appFolder, f)))
  let servicePaths
  app.use((req, _res, next) => {
    servicePaths ??= Object.values(cds.services).flatMap(
      (srv) => srv.endpoints?.map((e) => e.path) ?? []
    )
    const [, folder, rest] = /^\/([^/]+)(\/.*)$/.exec(req.url) ?? []
    if (apps.has(folder) && servicePaths.some((p) => rest.startsWith(p + '/'))) req.url = rest
    next()
  })
})

cds.on('served', () => {
  // Basic auth accepts an empty password for a user that has none: refuse to
  // start instead, e.g. when a Coolify password variable is missing.
  const { kind, users = {} } = cds.env.requires.auth
  if (kind !== 'basic') return
  const missing = Object.keys(users).filter((u) => users[u] && !users[u].password)
  if (missing.length) throw new Error(`No password set for user(s): ${missing.join(', ')}`)
})

module.exports = cds.server
