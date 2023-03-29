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

  /**
   * This experimentally adds a req.subject property which can be used as
   * arguments to SELECT.from or UPDATE to read the single instance of
   * req.target referred to by the incomming request. It also transparently
   * points to .drafts persistence, if in a draft scenario.
   *
   * req.data // inbound data to be written to req.target / req.subject
   * req.target       //> CSN def
   * req.entity      //> CSN def.name
   * req.subject    //> {ref} to 'instance' of req.target, which can be used as follows:
   *   SELECT.one.from(req.subject)   //> returns single
   *   SELECT.from(req.subject)      //> returns array
   *   UPDATE(req.subject)          //> updates one or many
   *   DELETE(req.subject)         //> deletes one or many
   *   NOT: INSERT(req.subject)
   */
   get subject() {
    let {target} = this, key = {...this.params[0]} // REVISIT: support n>1 paths
    if (key && this.path.indexOf('/') < 0) { //> .../<action>, e.g. draftActivate
      // deviate to draft?
      if (key.IsActiveEntity !== undefined) {
        if (key.IsActiveEntity === false) target = target.drafts
        delete key.IsActiveEntity // skip IsActiveEntity from key
      }
      // Resolve subject from target query
      const {SELECT:{from:{ref}}} = SELECT.from(target,key)
      return super.subject = {ref}
    }
    else return super.subject = target // REVISIT: rather have subject be undefined in that case?
  }

})
