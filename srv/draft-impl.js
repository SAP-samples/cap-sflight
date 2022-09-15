require('./draft-aspects') // adds .actives and overwrites .drafts

/** only compare primitive values, no functions */
const _isIdentical = (ref1, ref2) => {
  if (ref1.length !== ref2.length) return false
  for (let i = 0; i < ref1.length; i++) {
    if (ref1[i] !== ref2[i]) return false
  }
  return true
}

const DRAFT_COLS = [
  ['IsActiveEntity'],
  ['HasDraftEntity'],
  ['SiblingEntity', 'IsActiveEntity'],
]

function _cleanupRef(ref) {
  const newRef = []
  for (const r of ref) {
    if (r.where) {
      const newR = {}
      newR.id = r.id
      const { draftParams, newWhere } = _cleanupWhere(r.where)
      newR.where = newWhere
      if (draftParams.IsActiveEntity === false) newR.id = newR.id + '_drafts' // TODO: This is a no go!
      newRef.push(newR)
    } else {
      newRef.push(r)
    }
  }
  return newRef
}

function _cleanupWhere(where) {
  const draftParams = {}
  const newWhere = []
  for (let i = 0; i < where.length; i++) {
    const el = where[i]
    if (
      el &&
      typeof el === 'object' &&
      el.ref?.length &&
      DRAFT_COLS.some((r) => _isIdentical(r, el.ref))
    ) {
      draftParams[el.ref.join('.')] = where[i + 1] === '=' ? where[i + 2].val : { 'ne': where[i + 2].val }
      if (where[i + 3] === 'and') i = i + 3
      else if (i > 0 && where[i - 1] === 'and') {
        i = i + 2
        newWhere.pop()
      } else i = i + 2
    } else {
      newWhere.push(where[i])
    }
  }
  return { draftParams, newWhere }
}
function _rmNonExistentColumns(columns, target) {
  return columns.flatMap(c => {
    if (c?.ref && !target.elements[c.ref[0]]) return []
    return [c]
  })
}

async function onReadDrafts(req) {
  const { target, query } = req

  if (query.SELECT.from.ref[0].where?.length > 1) {
    // direct access
    
    const isDraft = undefined // TODO: We need something like cds.infer(req.query) to find out if the target is draft or active

    const newRef = _cleanupRef(query.SELECT.from.ref)
    // const { draftParams, newWhere } = _cleanupWhere(query.SELECT.from.ref[0].where)

    console.log('oldRef', query.SELECT.from.ref)
    console.log('newRef', newRef)
    const clone = cds.ql.clone(req.query).from({ ref: newRef })

    // TODO: Need to find the target entity

    if (clone.SELECT.where) {
      const { newWhere } = _cleanupWhere(query.SELECT.where)
      clone.SELECT.where = newWhere
    }
    const res = await cds.tx(req).run(clone)
    console.log('res:', res)
    return res
    // console.log(clone.SELECT)
    // if (draftParams.IsActiveEntity === false) {
    //   // direct draft
    //   // Root(ID=1,IsActiveEntity=false)/toComp/toComp/toAssoc
    //   const draftsQuery = cds.ql.clone(req.query).from(newRef)
    // } else {
    //   // active
    // }
    return {}
  }

  if (query.SELECT.where) {
    const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)
    console.log({draftParams, newWhere})

    const keys = []
    for (const key in target.drafts.keys) keys.push(key)



    if (draftParams['IsActiveEntity'] === true && draftParams['HasDraftEntity'] === false) {
      // Scenario: Unchanged (better solution in __alternatives.js)
      //
      // Alternative:
      //
      // const newColumns = _rmNotExistingColumns(query.SELECT.columns, target.actives)
      // const clone = cds.ql.clone(req.query).from(target.actives)
      // clone.SELECT.columns = newColumns
      // clone.SELECT.where = newWhere
      // const subSelect = SELECT.from(target.drafts).columns(keys).where(newWhere)
      // subSelect.where(keys.flatMap(key => [{ ref: [target.actives.name, key] }, '=', { ref: [target.drafts.name, key] }, 'and']).slice(0, -1))
      // clone.where('not exists', subSelect)
      // return cds.tx(req).run({ SELECT: clone.SELECT }) // will not work because the reference in the subSelect is not resolved
      //
      const draftsQuery = SELECT.from(target.drafts).columns(keys).where(newWhere)
      console.log('draftsQuery:', draftsQuery.SELECT)
      const resDrafts = await cds.tx(req).run(draftsQuery)
      const newColumns = _rmNonExistentColumns(query.SELECT.columns, target.actives)
      const clone = cds.ql.clone(req.query).from(target.actives)
      clone.SELECT.columns = newColumns
      clone.SELECT.where = []
      if (resDrafts.length) clone.where([
        { list: keys.map(pk => ({ ref: [pk] })) },
        'not in',
        { list: resDrafts.map(row => ({ list: keys.map(pk => ({ val: row[pk] })) })) }
      ])
      clone.SELECT.count = req.query.SELECT.count
      // TODO: Calculate draft columns (trick: merge with empty results)
      console.log('actives:', clone.SELECT)
      console.log('actives.orderBy:', clone.SELECT.orderBy)
      const res = await cds.tx(req).run(clone)
      res.forEach(r => { r.IsActiveEntity = true; r.HasDraftEntity = false })
      if (!('$count' in res)) res.$count = 1000 // TODO: Remove
      return res
    }
  }

  throw new Error('yep')
}

module.exports = { onReadDrafts }
