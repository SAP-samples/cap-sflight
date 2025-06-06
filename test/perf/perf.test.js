const { User } = require('./user')
const actions = require('./actions')

const dbs = [{
  name: 'sqlite (new)',
  requires: {
    db: {
      kind: 'sqlite',
      impl: '@cap-js/sqlite',
    }
  }
}, {
  name: 'sqlite disk (new)',
  requires: {
    db: {
      kind: 'sqlite',
      impl: '@cap-js/sqlite',
      credentials: {
        database: 'perf-test'
      }
    }
  }
}, {
  name: 'sqlite (old)',
  requires: {
    db: {
      kind: 'legacy-sqlite',
      credentials: {
        url: ":memory:"
      }
    }
  }
}, {
  name: 'sqlite disk (old)',
  requires: {
    db: {
      kind: 'legacy-sqlite',
      credentials: {
        url: "perf-test"
      }
    }
  }
}, {
  name: 'hana hdb (new)',
  requires: {
    db: {
      pool: {
        max: 100
      },
      kind: 'hana',
      impl: '@cap-js/hana',
      driver: 'hdb',
      vcap: {
        label: 'hana'
      }
    }
  }
}, {
  name: 'hana hana-client (new)',
  requires: {
    db: {
      pool: {
        max: 100
      },
      kind: 'hana',
      impl: '@cap-js/hana',
      driver: 'hana-client',
      vcap: {
        label: 'hana'
      }
    }
  }
}, {
  name: 'hana hdb (old)',
  requires: {
    db: {
      kind: 'hana',
      sqlDialect: 'hana',
      vcap: {
        label: 'hana'
      }
    }
  }
}, {
  name: 'postgres',
  requires: {
    db: {
      pool: {
        max: 100,
        acquireTimeoutMillis: 60 * 1000,
      },
      kind: 'postgres',
      impl: '@cap-js/postgres',
      dialect: "postgres",
      schema_evolution: false,
      vcap: {
        label: 'postgresql-db'
      }
    }
  }
}]

const protocols = [
  { name: 'okra', to: ['odata'] },
  { name: 'odata', to: ['odata'], features: { odata_new_adapter: true } },
  { name: 'rest', to: ['rest'] },
  { name: 'graphql', to: ['graphql'] },
  { name: 'hcql', to: ['hcql'] },
]

const loads = [
  { name: 'baseline', users: 1 << 0 },
  // { name: 'xs', users: 1 << 2 },
  // { name: 's', users: 1 << 4 },
  { name: 'm', users: 1 << 7 },
  // { name: 'l', users: 1 << 10 },
  // REVISIT: Requires workers to create enough load */
  // { name: 'xl', users: 1 << 12 },
  // { name: 'xxl', users: 1 << 16 },
]


const configs = loads.map(l => protocols.map(p => dbs.map(d => Object.assign({
  // folders: { srv: "test/perf/srv" }
}, p, d, l, { name: [p.name, d.name, l.name] })))).flat(2)

const results = {}

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

describe.each(configs)('$name.0 $name.1', (config) => {
  const getUser = () => new User(config.to[0])

  beforeAll(async () => {
    const admin = getUser()
    const ping = async () => {
      let up = false
      while (!up) {
        try {
          await admin.get('__ping__', '/')
          up = true
        } catch (e) { /**/ }
      }
    }

    try {
      await ping()
      await admin.post('__config__', '/config', JSON.stringify(config))
    } catch (e) {
      let s = performance.now()
      await ping()
      console.log(`restarted ${config.name} after ${performance.now() - s}ms`)
      s = performance.now()
      await admin.exec({ name: '__ready__', SELECT: { columns: [{ ref: ['TravelUUID'] }], limit: { rows: { val: 1 } }, from: { ref: ['processor', 'Travel'] } } })
      console.log(`deployed ${config.name} after ${performance.now() - s}ms`)
    }
  })

  test('landingPage (scroll: 1000)', async () => {
    const proms = []
    const users = []
    for (let i = 0; i < config.users; i++) {
      await sleep(100)
      const user = getUser()
      users.push(user)
      proms.push(actions.landingPage(user, { scroll: { rows: 1000 } }))
    }
    await Promise.allSettled(proms)

    const requests = {}
    users.forEach(user => user.timings.forEach(timing => {
      const name = timing.name
      let cur = requests[name]
      if (!cur || cur.duration > timing.duration) {
        const total = cur?.total || 0
        const calls = cur?.calls || 0
        cur = requests[name] = timing
        cur.total = total
        cur.calls = calls
      }
      cur.total += timing.duration
      cur.calls++
    }))
    results[config.name[0]] ??= {}
    results[config.name[0]][config.name[1]] ??= {}
    results[config.name[0]][config.name[1]][config.name[2]] ??= requests
  })
});

afterAll(() => {
  const header = '|   |' + dbs.map(db => db.name).join('|') + '|\n|---|' + dbs.map(() => '---').join('|') + '|'
  let requests

  const calls = {}
  const tables = {}
  for (const load of loads) {
    for (const protocol of protocols) {
      let prefix = `| ${protocol.name} |`
      for (const db of dbs) {
        const result = results?.[protocol.name]?.[db.name]?.[load.name] || {}
        if (!requests) requests = Object.keys(result)

        for (const request of requests) {
          tables[request] ??= {}
          const table = tables[request][load.name] = tables[request][load.name] || [header]

          if (prefix) {
            table.push(prefix)
          }
          const res = result?.[request] || { duration: NaN, total: NaN, calls: NaN }
          table[table.length - 1] = `${table[table.length - 1]} ${res.duration >>> 0} ms (avg: ${(res.total / res.calls) >>> 0} ms) | `
          calls[request] = (calls[request] || 0) + res.calls
        }
        prefix = ''
      }
    }
  }

  // Order requests by number of times called
  requests = requests.sort((a, b) => calls[a] - calls[b])

  const fs = require('fs')
  const fd = fs.createWriteStream(__dirname + '/performance.md')

  const write = (str) => {
    process.stdout.write(str)
    fd.write(str)
  }

  write('--------------------------------\n')
  requests.forEach(request => {
    write(`### ${request}\n`)

    const table = tables[request]
    loads.forEach(load => {
      write(`<details>\n<summary>${load.name} (${load.users} users)</summary>\n\n${table[load.name].join('\n')}\n</details>\n`)
    })
  })

  fd.close()
})
