// https://github.tools.sap/cap/sflight-ea/blob/main/doc/CSN.md
const cds = require ('@sap/cds/lib')

class Unfolds {
  get structs() { return super.structs = require('./structs.js') }
  get assocs() { return super.assocs = require('./assocs') }
}

/**
 * Use this function to unfold compact CSN models like that:
 * @example cds.unfold(m,'assocs','structs')
 * @type Unfolds & <T>(csn:T,unfolds[]:string) => T
 */
const unfold = Object.setPrototypeOf((csn,...unfolds)=>{
  const done = (csn.meta ??= {}).unfolded ??= []
  const todo = unfolds.filter(u => !done.includes(u))
  try { return cds.linked(csn).forall(d => todo.forEach(t => unfold[t](d))) }
  finally { done.push(...todo) }
}, new Unfolds)

module.exports = unfold
