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
  if (!where?.length) return []
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
      draftParams[el.ref.join('.')] =
        where[i + 1] === '=' ? where[i + 2].val : { ne: where[i + 2].val }
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
  return columns.flatMap((c) => {
    if (c?.ref && !target.elements[c.ref[0]]) return []
    return [c]
  })
}

// TODO: We need something like cds.inferdb(req.query) to find out if the target is draft or active
//        This is just a _temporary_ solution to get going.
function _inferDbTarget(query) {
  const root = query.SELECT.from.ref[0].id || query.SELECT.from.ref[0]
  const model = cds.context?.model || cds.model
  let target = root?.endsWith('_drafts')
    ? model.definitions[root.replace(/_drafts$/, '')].drafts
    : model.definitions[root]?.actives ||
      model.definitions[root] ||
      cds.error`"${from}" not found in the definitions of your model`
  for (let i = 1; i < query.SELECT.from.ref.length; i++) {
    const nav = query.SELECT.from.ref[i]
    if (nav) target = target.elements[nav]._target
  }
  return target
}

function _getKeyArray(entity) {
  const keys = []
  for (const key in entity.keys) keys.push(key)
  return keys
}

const SELECTABLE_DRAFT_COLUMNS = [
  'IsActiveEntity',
  'HasDraftEntity',
  'HasDraftEntity',
  'DraftAdministrativeData_DraftUUID',
]

function _requestedDraftColumns(query) {
  if (!query.SELECT.columns || query.SELECT.columns.some((c) => c === '*'))
    return SELECTABLE_DRAFT_COLUMNS
  const cols = []
  // if (query.SELECT.columns?.some(c => c?.ref?.[0] === hasSibling)) cols.push(hasSibling)
  for (const col of query.SELECT.columns) {
    if (col?.ref?.[0] && SELECTABLE_DRAFT_COLUMNS.includes(col.ref[0])) cols.push(col.ref[0])
  }
  return cols
}

function _calculatedDraftColumns(requested, isDraft) {
  
}

function _requiredSiblingEntityColumns(query, isDraft) {
  const requested = _requestedDraftColumns(query)
  if (isDraft) return requested.filter()
}

/** Returns a new query where draft columns are removed and names are normalized to `myEntity` or `myEntity_drafts`, depending on IsActiveEntity */
function _cleanUpQuery(query) {
  const clone = cds.ql
    .clone(query)
    .from({ ref: _cleanupRef(query.SELECT.from.ref) })
  const { newWhere } = _cleanupWhere(query.SELECT.where)
  if (newWhere) clone.where(newWhere)
  return clone
  // TODO: orderBy, groupBy, ...
}

async function onReadDrafts(req) {
  const { target, query } = req

  if (query.SELECT.from.ref[0].where?.length > 1) {
    // direct access
    console.log('Scenario: Direct Access')

    const targetQuery = _cleanUpQuery(query)
    const dbTarget = _inferDbTarget(targetQuery)
    const isDraft = dbTarget._isDraft
    const targetResult = await cds.tx(req).run(targetQuery)
    const targetResultArray = Array.isArray(targetResult)
      ? targetResult
      : [targetResult]
    targetResultArray.forEach((row) => {
      row.IsActiveEntity = isDraft
    })
    if (
      query.SELECT.columns?.some((c) =>
        c?.ref?.[0] === isDraft ? 'HasActiveEntity' : 'HasDraftEntity'
      )
    )
      return true
    const siblingQuery = cds.ql.clone(targetQuery).from(dbTarget._sibling)
    const keys = _getKeyArray(dbTarget)
    siblingQuery.where([
      { list: keys.map((pk) => ({ ref: [pk] })) },
      'in',
      {
        list: targetResultArray.map((row) => ({
          list: keys.map((pk) => ({ val: row[pk] })),
        })),
      },
    ])
    console.log(siblingQuery.SELECT)
    const siblingRes = await cds.tx(req).run(siblingQuery)
    // TODO: Merge results

    return targetResult
  }

  if (query.SELECT.where) {
    const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)
    console.log({ draftParams, newWhere })

    const keys = _getKeyArray(target.drafts)

    if (
      draftParams['IsActiveEntity'] === true &&
      draftParams['HasDraftEntity'] === false
    ) {
      // Scenario: Unchanged (better solution in __alternatives.js)
      console.log('Scenario: Unchanged')
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
      const draftsQuery = SELECT.from(target.drafts)
        .columns(keys)
        .where(newWhere)
      console.log('draftsQuery:', draftsQuery.SELECT)
      const resDrafts = await cds.tx(req).run(draftsQuery)
      const newColumns = _rmNonExistentColumns(
        query.SELECT.columns,
        target.actives
      )
      console.log('calc clone...')
      const clone = cds.ql.clone(req.query).from(target.actives)
      clone.SELECT.columns = newColumns
      if (resDrafts.length)
        clone.where([
          { list: keys.map((pk) => ({ ref: [pk] })) },
          'not in',
          {
            list: resDrafts.map((row) => ({
              list: keys.map((pk) => ({ val: row[pk] })),
            })),
          },
        ])
      clone.SELECT.count = req.query.SELECT.count
      // TODO: Calculate draft columns (trick: merge with empty results)
      console.log('actives:', clone.SELECT)
      console.log('actives.orderBy:', clone.SELECT.orderBy)
      console.log('clone.SELECT', clone.SELECT)
      const res = await cds.tx(req).run(clone)
      res.forEach((r) => {
        r.IsActiveEntity = true
        r.HasDraftEntity = false
      })
      if (!('$count' in res)) res.$count = 1000 // TODO: Remove
      return res
    }
  }

  throw new Error('yep')
}

module.exports = { onReadDrafts }
