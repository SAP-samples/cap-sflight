// Temporary fix as monky-patch -> will soon go away with upcomming fix to OData library

const cds = require ('@sap/cds/lib')

const { init } = cds.ApplicationService.prototype
cds.extend (cds.ApplicationService) .with (class {

  /**
   * This experimentally adds support to register standard ES6 class methods
   * of subclasses of cds.ApplicationService using "@on/before/after ..."
   * pragmas.
   */
  init() {
    for (let o = this;;) {
      o = Reflect.getPrototypeOf(o); if (!o || o === cds.Service.prototype) break
      const pds = Object.getOwnPropertyDescriptors (o)
      for (let p in pds) {
        if (p === 'constructor' || p === 'init') continue
        const pragma = /^[^{]+{\s*"@(on|before|after) (\w+)(?: ([\w/]+)(?::(\w+))?)?"/.exec(pds[p].value); if (!pragma) continue
        const [, on, event, path, element] = pragma, handler = pds[p].value
        this[on] (event, path,
          !element ? handler
          : on === 'after' ? (_,req) => element in req.data && handler.call(this,_,req)
          : (req,next) => element in req.data && handler.call(this,req,next)
        )
        // console.debug (`${this.name}.${on} (${event}, ${path}, this.${p})`)
      }
    }
    return init.call (this)
  }
})

const { error } = cds.Request.prototype
cds.extend (cds.Request) .with (class {

  /**
   * This is a temporary fix for req.error() ensuring target element
   * reference paths containing UUIDs are rendered correctly when UUIDs have
   * been mapped to `Edm.String` as we do in SFlight, due to ABAP-based data.
   */
  error (e) {
    if (e.target) e.target = e.target.replace (/\((\w+)UUID=([^,)]+)/g, `($1UUID='$2'`)
    return error.call (this, ...arguments)
  }

  /**
   * This experimentally adds a req._target property which can be used as
   * arguments to SELECT.from or UPDATE to read the single instance of
   * req.target referred to by the incomming request. It also transparently
   * points to .drafts persistence, if in a draft scenario.
   */
   get _target() { // > targetEntry -> and this is always only one
    // TODO: should also replace req.query for bound actions/functions
    const q = this.query
    const ref = q && ( // for CRUD queries...
      // PARKED: q.SELECT ? q.SELECT.from.ref   || [ q.SELECT.from ] :
      // PARKED: q.INSERT ? q.INSERT.into.ref   || [ q.INSERT.into ] :
      q.UPDATE ? q.UPDATE.entity.ref || [ q.UPDATE.entity ] :
      q.DELETE ? q.DELETE.from.ref   || [ q.DELETE.from ] : undefined
     ) || ( // for bound actions...
      this.path.split('/').map ((each,i) => {
        let key = this.params[i]
        return !key ? each : SELECT.from(each,key).SELECT.from.ref[0]
      })
    )
    if (ref) {
      const last = ref[ref.length-1]
      if (last.where) { // handle draft requests
        let k = last.where.findIndex (({ref}) => ref && ref[0] === 'IsActiveEntity')
        if (k >= 0) {
          let {val} =  last.where[k+2]
          if (val === false || val === 'false') last.id += '_drafts' // REVISIT: should be false, not 'false'
          if (k>0) --k // also remove a leading or trailing 'and'
          last.where = last.where.slice(0,k) .concat (last.where.slice(k+4))
        }
      }
      return this._set ('_target', {ref})
    }
    else return this._set ('_target', undefined)
  }

})
