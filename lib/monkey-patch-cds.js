const cds = require("@sap/cds/lib")

const unfold = require("./compile/unfold")
cds.compile.for.nodejs
cds.compile.for.nodejs = csn => {
  _plain_csn ??= cds.compile(cds.clone(csn))
  return unfold(csn,'assocs','structs')
}

const _2edm = cds.compile.to.edm
const _2sql = cds.compile.to.sql
cds.compile.to.edm = (csn,o) => _2edm(_plain_csn||csn,o)
cds.compile.to.sql = (csn,o) => _2sql(_plain_csn||csn,o)

let _plain_csn
