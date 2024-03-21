process.env.DEBUG = 'trace'

// Inject trace trailers to all http requests
const http = require('http')

const ServerResponse = http.ServerResponse.prototype

ServerResponse.__setHeader = ServerResponse.setHeader
ServerResponse.setHeader = function (a, b) {
  if (a.toLowerCase() === 'content-length')
    return
  return this.__setHeader(a, b)
}

ServerResponse.__writeHead = ServerResponse.writeHead
ServerResponse.writeHead = function (a, b, c) {
  c = c || {}
  if (this.req.method !== 'HEAD' && a >= 200 && a < 300) {
    c.Trailer = 'Server-Timing'
  }
  return this.__writeHead(a, b, c)
}

ServerResponse.__end = ServerResponse.end
ServerResponse.end = function () {
  const perf = this.req._perf
  if (perf) {
    const timings = {}
    perf.forEach(e => {
      if (!e.stop) {
        e.stop = performance.now()
      }
      const name = e.details[0].replace('@cap-js/', '')
      timings[name] = (timings[name] || 0) + (e.stop - e.start)
    })
    this.addTrailers({
      'Server-Timing': Object.keys(timings).map(k => `${k};dur=${timings[k]}`).join()
    })
  }

  return this.__end(...arguments)
}

// Inject configuration endpoint
const cds = require('@sap/cds')
cds.env.protocols.graphql = { path: '/gql', impl: '@cap-js/graphql' }

cds.options.to = cds.env.to
cds.requires.middlewares = true

cds.on('bootstrap', async app => {
  const fs = require('fs')
  app.post('/config', (req) => {
    const prefix = `{"sql":{"dialect":"plain"},"[perf]":`
    const suffix = `}`
    const fd = fs.createWriteStream(cds.root + '/.cdsrc.json')
    fd.write(prefix)
    req.pipe(fd, { end: false })
    req.on('end', () => {
      fd.write(suffix)
      // Don't respond as the server restart will reset the connection
    })
  })

  cds.requires.db.pool ??= {}
  cds.requires.db.pool.max = 1

  await cds.tx(async () => cds.deploy(cds.options?.from?.[0] || '*')).catch(e => {
    console.log(e)
  })
  await cds.run('CREATE UNIQUE INDEX IF NOT EXISTS FAST_LANDING_PAGE_INDEX ON sap_fe_cap_travel_Travel(TravelID DESC, TravelUUID ASC)')
})

process.on('exit', () => cds.disconnect())
