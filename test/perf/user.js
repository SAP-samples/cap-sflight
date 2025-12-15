const ssl = false

const axios = require('axios')
const http = ssl ? require('https') : require('http')

const endpoint = process.env.ENDPOINT || 'http://localhost:4004'

module.exports.User = class User {
  constructor(target) {
    this.timings = []
    this.agent = new http.Agent({ keepAlive: true })

    switch (target) {
      case 'odata': this.exec = this.exec_odata
        break
      case 'rest': this.exec = this.exec_rest
        break
      case 'graphql': this.exec = this.exec_graphql
        break
      case 'hcql': this.exec = this.exec_hcql
        break
      default: throw new Error(`Unknown protocol ${target}`)
    }
  }

  async exec_odata(query) {
    // Just calls rest
    const result = await this.exec_rest(query)
    return result.value
  }

  async exec_rest(query) {
    if (query.SELECT) {
      const columns = (cols = []) => {
        return {
          $select: cols.filter(c => !c.expand).map(c => c.ref.join('/')),
          $expand: cols.filter(c => c.expand).map(c => {
            const sub = columns(c.expand)
            const s = sub.$select
            const e = sub.$expand
            const h = s.length || e.length
            const b = s.length && e.length
            return `${c.ref.join('/')}${h ? '(' : ''}${s.length ? '$select=' + s : ''}${b ? ';' : ''}${e.length ? '$expand=' + e : ''}${h ? ')' : ''}`
          })
        }
      }

      const { $select, $expand } = columns(query.SELECT.columns)
      const $top = query.SELECT.limit?.rows?.val
      const $skip = query.SELECT.limit?.offset?.val
      const $orderby = query.SELECT.orderBy?.map(c => `${c.ref.join('/')} ${c.sort || 'asc'}`)

      const paramets = [
        $select?.length ? '$select=' + $select : undefined,
        $expand?.length ? '$expand=' + $expand : undefined,
        typeof $top === 'number' ? '$top=' + $top : undefined,
        typeof $skip === 'number' ? '$skip=' + $skip : undefined,
        $orderby?.length ? '$orderby=' + $orderby : undefined
      ].filter(a => a)

      const result = await this.get(query.name, `/${query.SELECT.from.ref.join('/')}${paramets.length ? '?' + paramets.join('&') : ''}`)
      return result.data
    }
  }

  async exec_graphql_schema() {
    if (this._graphl_schema) return this._graphl_schema
    const query = `
    query schema { __schema { types { ...FullType } } }
    fragment FullType on __Type { kind name description
      fields(includeDeprecated: false) {
        name type { ...TypeRef }
      }
    }
    fragment TypeRef on __Type { kind name
      ofType { kind name
      ofType { kind name
      ofType { kind name
      ofType { kind name
      ofType { kind name
      ofType { kind name
      ofType { kind name
    }}}}}}}}
  `
    this.__proto__._graphl_schema = this.post('__SCHEMA__', '/gql', { query })
    return this.exec_graphql_schema()
  }

  async exec_graphql(query) {
    if (query.SELECT) {
      const services = {
        processor: 'TravelService',
        analytics: 'AnalyticsService',
      }
      const ref = [...query.SELECT.from.ref]
      ref[0] = services[ref[0]]
      const path = ref.join('{')

      const top = query.SELECT.limit?.rows?.val
      const skip = query.SELECT.limit?.offset?.val

      const filter = ''

      const args = []
      if (typeof top === 'number') args.push(`top:${top}`)
      if (typeof skip === 'number') args.push(`skip:${skip}`)
      if (filter) args.push(`filter:${top}`)

      const schema = await this.exec_graphql_schema()
      const getType = name => {
        return schema.data.data.__schema.types.find(t => t.name === name)
      }

      const walkPath = (ref, parent) => {
        let i = 0
        let cur = parent
        if (!cur) {
          cur = getType(ref[i++])
        }
        for (; i < ref.length; i++) {
          cur = getType(cur.fields.find(f => f.name === ref[i]).type.name)
        }
        return cur
      }

      const columns = (parent, cols = []) => {
        const ret = []
        const hasNodes = parent.fields.find(f => f.name === 'nodes')
        if (hasNodes) {
          ret.push('nodes{')
          parent = getType(hasNodes.type.ofType.name)
        }
        for (let i = 0; i < cols.length; i++) {
          const col = cols[i]
          if (col.expand) {
            ret.push(`${col.ref[0]} {${columns(walkPath(col.ref, parent), col.expand)}}`)
          } else {
            ret.push(col.ref[0])
          }
        }
        if (hasNodes) {
          ret.push('}')
        }
        return ret.join(' ')
      }

      const cols = columns(walkPath(ref), query.SELECT.columns)

      const gql = `{${path}${args.length ? `(${args})` : ''}{${cols}}${ref.map(() => '').join('}')}}`
      const result = await this.post(query.name, '/gql', { query: gql })
      const errors = result.data.errors
      if (errors) {
        throw new Error(`graphql errors:\n  ${errors.map(e => e.message).join('\n  ')}`)
      }
      return ref.reduce((l, c) => l[c], result.data.data).nodes
    }
  }

  async exec_hcql(query) {
    if (query.SELECT) {
      const service = query.SELECT.from.ref.shift()
      const name = query.name
      query.name = undefined
      const result = await this.post(name, `/${service}/`, query)
      query.SELECT.from.ref.unshift(service)
      query.name = name
      return result.data
    }
  }

  async timing(fn, name, ...args) {
    const s = performance.now()
    const result = await fn(...args)
    const dur = performance.now() - s
    const trailers = result.request.res.trailers["server-timing"]
      ?.split(',')
      .map(e => {
        const s = e.split(';')
        return `  ${s[0]}(${s[1].slice(4)} ms)`
      })
      .join('\n')

    this.timings.push({
      name: name,
      url: args[0],
      duration: dur,
      details: trailers || null,
    })

    return result
  }

  async get(name, path, options) {
    return this.timing(async (path, options = {}) => {
      options.agent = this.agent
      options.headers ??= {}
      options.headers.authorization = 'Basic YWxpY2U6'
      const res = await axios.get(endpoint + path, options)
      if (res.status > 300) throw new Error(`Request failed with code ${res.status}`)
      return res
    }, name, path, options)
  }

  async post(name, path, body, options) {
    return this.timing(async (path, body, options = {}) => {
      options.agent = this.agent
      options.headers ??= {}
      options.headers.authorization = 'Basic YWxpY2U6'
      const res = await axios.post(endpoint + path, body, options)
      if (res.status > 300) throw new Error(`Request failed with code ${res.status}`)
      return res
    }, name, path, body, options)
  }
}