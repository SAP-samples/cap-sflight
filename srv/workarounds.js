const cds = require ('@sap/cds/lib'), { error } = cds.Request.prototype
cds.extend (cds.Request) .with (class {
  /**
   * This is a temporary fix for `req.error()` ensuring target element paths
   * containing UUIDs are rendered correctly when UUIDs have been mapped to
   * `Edm.String` as we do in SFlight, due to ABAP-based data.
   */
  error (e) {
    if (e.target) e.target = e.target.replace (/\((\w+)UUID=([^,)]+)/g, `($1UUID='$2'`)
    return error.call (this, ...arguments)
  }
})
