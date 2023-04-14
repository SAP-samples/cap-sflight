// Temporary fix as monky-patch -> will soon go away with upcomming fix to OData library

const cds = require ('@sap/cds/lib')

// Adding toString to cds.entity incorporated in upcoming releases of @sap/cds
Object.defineProperty (cds.entity.prototype, 'toString', {
  value: function() { return this.name.replace(/\./g,'_') },
  configurable: true
})

// Adding toString to cds.entity.drafts incorporated in upcoming releases of @sap/cds
Object.defineProperty (cds.entity.prototype, 'drafts', {
  get: function() { return this.own('_drafts') || this.set('_drafts', this.elements?.HasDraftEntity && {
    name: this.name + '_drafts', keys: this.keys,
    toString(){ return this.name.replace(/\./g,'_') }
  })},
  configurable: true
})



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

})
