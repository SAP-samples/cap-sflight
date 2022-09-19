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

function _cleanupColumns(columns, isDraft) {
  // TODO: nested, expands, ...
  return columns && columns.filter(c => {
    if (['IsActiveEntity', 'HasDraftEntity', 'SiblingEntity'].includes(c.ref?.[0])) return false
    if (!isDraft && ['DraftAdministrativeData_DraftUUID', 'DraftAdministrativeData'].includes(c.ref?.[0])) return false 
    return true
  })
}

function _cleanupWhere(where) {
  const draftParams = {}
  const newWhere = []
  if (!where?.length) return { draftParams, newWhere }
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
  return columns && columns.flatMap((c) => {
    if (c?.ref && !target.elements[c.ref[0]]) return []
    return [c]
  })
}

// TODO: We need something like cds.inferdb(req.query) to find out if the target is draft or active
//        This is just a _temporary_ solution to get going.

function _getCsn(name, model) {
  return name?.endsWith('_drafts')
    ? model.definitions[name.replace(/_drafts$/, '')].drafts
    : model.definitions[name]?.actives ||
        model.definitions[name] ||
        cds.error`"${name}" not found in the definitions of your model`
}
function _inferDbTarget(query) {
  const root = query.SELECT.from.ref[0].id || query.SELECT.from.ref[0]
  const model = cds.context?.model || cds.model
  let target = _getCsn(root, model)
  for (let i = 1; i < query.SELECT.from.ref.length; i++) {
    const nav = query.SELECT.from.ref[i]
    if (nav) target = _getCsn(target.elements[nav].target, model)
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
  'HasActiveEntity',
  'DraftAdministrativeData_DraftUUID'
]

function _requestedDraftColumns(query) {
  if (!query.SELECT.columns || query.SELECT.columns.some((c) => c === '*'))
    return SELECTABLE_DRAFT_COLUMNS.map(n => ({ ref: [n] }))
  const cols = []
  // if (query.SELECT.columns?.some(c => c?.ref?.[0] === hasSibling)) cols.push(hasSibling)
  for (const col of query.SELECT.columns) {
    if (col?.ref?.[0] && (SELECTABLE_DRAFT_COLUMNS.includes(col.ref[0]) || col.ref[0] === 'DraftAdministrativeData'))
      cols.push(col)
    // TODO: Handle expands
  }
  return cols
}

async function _directAccess(req, cleanedup) {
  console.log('Scenario: Direct Access')

  let targetResult = await cds.tx(req).run(cleanedup.query)
  if (Array.isArray(targetResult) && targetResult[0] === undefined)
    targetResult = [] // TODO: workaround

  if (!targetResult) return targetResult
  // not a draft-enabled entity
  if (!cleanedup.dbTarget._sibling) return targetResult

  const isDraft = cleanedup.dbTarget._isDraft

  console.log('isDraft?:', isDraft)
  const hasSelf = isDraft ? 'HasDraftEntity' : 'HasActiveEntity'
  const hasOther = isDraft ? 'HasActiveEntity' : 'HasDraftEntity'

  const requestedDraftColumns = _requestedDraftColumns(req.query)
  console.log('requested:', requestedDraftColumns)
  const calc = {}
  if (requestedDraftColumns.some(c => c.ref?.[0] === 'IsActiveEntity'))
    calc.IsActiveEntity = !isDraft
  if (requestedDraftColumns.some(c => c.ref?.[0] === hasSelf)) calc[hasSelf] = false

  const remainingDraftColumns = requestedDraftColumns.filter(c => ![hasSelf, 'IsActiveEntity'].includes(c.ref?.[0]))

  const targetResultArray = Array.isArray(targetResult)
    ? targetResult
    : [targetResult]

  let siblingResult
  const keys = _getKeyArray(cleanedup.dbTarget)

  if (remainingDraftColumns) {
    console.log('adding required draft columns', remainingDraftColumns)
    const siblingQuery = cds.ql.clone(cleanedup.query).from(cleanedup.dbTarget._sibling)
    siblingQuery.SELECT.columns = []
    siblingQuery.columns(keys)
    siblingQuery.columns(remainingDraftColumns)
    siblingQuery.where([
      { list: keys.map((pk) => ({ ref: [pk] })) },
      'in',
      {
        list: targetResultArray.map((row) => ({
          list: keys.map((pk) => ({ val: row[pk] })),
        })),
      },
    ])
    console.log('SiblingQuery:', siblingQuery.target)
    // TODO: query.target seems to be wrong
    siblingResult = await cds.tx(req).run(siblingQuery)
  }

  if (Array.isArray(siblingResult) && siblingResult[0] === undefined)
    siblingResult = [] // TODO: workaround

  console.log('siblingResult:', siblingResult)
  const siblingResultArray = !siblingResult
    ? []
    : Array.isArray(siblingResult)
    ? siblingResult
    : [siblingResult]

  console.log('sibling array', siblingResultArray)
  if (Object.keys(calc) || siblingResultArray.length)
    targetResultArray.forEach((row) => {
      Object.assign(row, calc) // static known properties
      const idx = siblingResultArray.findIndex((sibling) => {
        for (const key of keys) {
          console.log('sibling:', sibling)
          console.log('row:', row)
          if (sibling[key] !== row[key]) return false
        }
        return true
      })
      if (idx < 0) row[hasOther] = false
      else {
        row[hasOther] = true
        const other = siblingResultArray[idx]
        // merge both results
        for (k in other) {
          if (!(k in row)) row[k] = other[k]
        }
        siblingResultArray.splice(idx, 1) // not needed anymore
      }
    })

  return targetResult
}

async function _unchanged(req, cleanedup) {
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
  console.log('cleanupwhere', cleanedup.query.SELECT.where)
  const keys = _getKeyArray(req.target.drafts)
  const draftsQuery = SELECT.from(req.target.drafts)
    .columns(keys)
    .where(cleanedup.query.SELECT.where)
  console.log('draftsQuery:', draftsQuery.SELECT)
  const resDrafts = await cds.tx(req).run(draftsQuery)
  const activesColumns = _rmNonExistentColumns(
    req.query.SELECT.columns,
    req.target.actives
  )
  console.log('calc actives...')
  const activesQuery = cds.ql.clone(req.query).from(req.target.actives)
  activesQuery.SELECT.where = cleanedup.query.SELECT.where
  activesQuery.SELECT.columns = activesColumns
  if (resDrafts.length)
    activesQuery.where([
      { list: keys.map((pk) => ({ ref: [pk] })) },
      'not in',
      {
        list: resDrafts.map((row) => ({
          list: keys.map((pk) => ({ val: row[pk] })),
        })),
      },
    ])
  activesQuery.SELECT.count = req.query.SELECT.count
  const res = await cds.tx(req).run(activesQuery)
  res.forEach((r) => {
    r.IsActiveEntity = true
    r.HasDraftEntity = false
    // TODO: expands and DraftAdministrativeData_DraftUUID
  })
  // if (!('$count' in res)) res.$count = 1000 // TODO: Remove
  return res
}

/** Returns a new query where draft columns are removed and names are normalized to `myEntity` or `myEntity_drafts`, depending on IsActiveEntity */
function _cleanedup(query) {
  const clone = cds.ql
    .clone(query)
    .from({ ref: _cleanupRef(query.SELECT.from.ref) })
  const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)
  const dbTarget = _inferDbTarget(clone)
  clone.SELECT.where = []
  clone.where(newWhere)
  clone.SELECT.columns = _cleanupColumns(clone.SELECT.columns, dbTarget._isDraft)
  // TODO: columns, orderBy, groupBy, ...
  return { query: clone, draftParams, dbTarget }
}

async function onReadDrafts(req) {
  const cleanedUp = _cleanedup(req.query)
  if (req.query.SELECT.from.ref[0].where?.length > 1) {
    // direct access
    return _directAccess(req, cleanedUp)
  }

  if (req.query.SELECT.where) {
    // const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)

    if (
      cleanedup.draftParams['IsActiveEntity'] === true &&
      cleanedup.draftParams['HasDraftEntity'] === false
    ) {
      // Scenario: Unchanged (better solution in __alternatives.js)
      return _unchanged(req, cleanedup)
    }

  }
}

module.exports = { onReadDrafts }
