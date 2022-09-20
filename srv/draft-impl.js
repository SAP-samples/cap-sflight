/** only compare primitive values, no functions */
const _isIdentical = (ref1, ref2) => {
  if (ref1.length !== ref2.length) return false
  for (let i = 0; i < ref1.length; i++) {
    if (ref1[i] !== ref2[i]) return false
  }
  return true
}

function _cleanupRef(ref, outerDraftParams) {
  const newRef = []
  for (let i = 0; i < ref.length; i++) {
    const r = ref[i]
    if (r.where) {
      const newR = {}
      newR.id = r.id
      const { draftParams, newWhere } = _cleanupWhere(r.where)
      newR.where = newWhere
      if (draftParams.IsActiveEntity === false) newR.id = newR.id + '_drafts' // TODO: ugly
      newRef.push(newR)
    } else {
      if (i === 0 && outerDraftParams?.IsActiveEntity === false) {
        const newR = (typeof r === 'object' && r.id) || r
        newRef.push(newR + '_drafts')
      } else {
        newRef.push(r)
      }
    }
  }
  return newRef
}

/** Remove all columns which are not included in the db target */
function _cleanupColumns(columns, target) {
  // TODO: nested, expands, ...
  return (
    columns &&
    columns.filter((c) => {
      if (c?.ref) return target.elements[c.ref[0]]
      return true
    })
  )
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
      [
        ['IsActiveEntity'],
        ['HasDraftEntity'],
        ['SiblingEntity', 'IsActiveEntity'],
      ].some((r) => _isIdentical(r, el.ref))
    ) {
      draftParams[el.ref.join('.')] =
        where[i + 1] === '=' ? where[i + 2].val : { ne: where[i + 2].val }
      if (where[i + 3] === 'and') i = i + 3
      else if (i > 0 && where[i - 1] === 'and') {
        // TODO: SiblingEntity.IsActiveEntity has 'or' in case of union
        i = i + 2
        newWhere.pop()
      } else i = i + 2
    } else {
      newWhere.push(where[i])
    }
  }
  return { draftParams, newWhere }
}

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
  'DraftAdministrativeData_DraftUUID',
]

function _requestedDraftColumns(query) {
  if (!query.SELECT.columns || query.SELECT.columns.some((c) => c === '*'))
    return SELECTABLE_DRAFT_COLUMNS.map((n) => ({ ref: [n] }))
  const cols = []
  // if (query.SELECT.columns?.some(c => c?.ref?.[0] === hasSibling)) cols.push(hasSibling)
  for (const col of query.SELECT.columns) {
    if (
      col?.ref?.[0] &&
      (SELECTABLE_DRAFT_COLUMNS.includes(col.ref[0]) ||
        col.ref[0] === 'DraftAdministrativeData')
    )
      cols.push(col)
    // TODO: Handle expands
  }
  return cols
}

const readSiblingEnum = {
  always: 'always',
  onDemand: 'on demand',
  never: 'never',
}

function _mustReadSibling(remainingDraftColumns, readSibling, dataArray) {
  if (readSibling === readSiblingEnum.never) return false
  if (readSibling === readSiblingEnum.always && remainingDraftColumns.length)
    return true
  if (
    readSibling === readSiblingEnum.onDemand &&
    remainingDraftColumns.length
  ) {
    for (const data of dataArray) {
      for (const remaining of remainingDraftColumns) {
        // only if not already in data
        // Performance optimization: we can also read only those rows which are necessary instead of a global true/false
        if (!(remaining.ref[0] in data)) return true
      }
    }
    return false
  }
}

async function _mergeFromSibling(
  req,
  cleanedup,
  data,
  { readSibling = readSiblingEnum.always } = {}
) {
  const dataArray = Array.isArray(data) ? data : [data]
  if (!dataArray.length) return data // no data
  if (!cleanedup.dbTarget._sibling) return data // not draft enabled

  const requestedDraftColumns = _requestedDraftColumns(req.query)
  console.log('requested:', requestedDraftColumns)

  const isDraft = cleanedup.dbTarget._isDraft
  const hasSelf = isDraft ? 'HasDraftEntity' : 'HasActiveEntity'
  const hasOther = isDraft ? 'HasActiveEntity' : 'HasDraftEntity'

  // Can be easily calculated
  const calc = {}
  if (requestedDraftColumns.some((c) => c.ref?.[0] === 'IsActiveEntity'))
    calc.IsActiveEntity = !isDraft
  if (requestedDraftColumns.some((c) => c.ref?.[0] === hasSelf))
    calc[hasSelf] = false

  console.log('static calc:', calc)

  const remainingDraftColumns = requestedDraftColumns.filter((c) =>
    ['DraftAdministrativeData', 'DraftAdministrativeData_DraftUUID'].includes(
      c.ref?.[0]
    )
  )

  const keys = _getKeyArray(cleanedup.dbTarget)

  let siblingResultArray = []

  const mustReadSibling = _mustReadSibling(
    remainingDraftColumns,
    readSibling,
    dataArray
  )

  if (mustReadSibling) {
    console.log('selecting remaining draft columns', remainingDraftColumns)
    const siblingQuery = cds.ql
      .clone(cleanedup.query)
      .from(cleanedup.dbTarget._sibling)
    siblingQuery.SELECT.columns = []
    siblingQuery.columns(keys)
    siblingQuery.columns(remainingDraftColumns)
    siblingQuery.where([
      { list: keys.map((pk) => ({ ref: [pk] })) },
      'in',
      {
        list: dataArray.map((row) => ({
          list: keys.map((pk) => ({ val: row[pk] })),
        })),
      },
    ])
    cds.inferred(siblingQuery) // workround, remove
    const siblingResult = await cds.tx(req).run(siblingQuery)
    if (!siblingResult) siblingResultArray = []
    else
      siblingResultArray = Array.isArray(siblingResult)
        ? siblingResult
        : [siblingResult]
  }

  const hasOtherRequested = requestedDraftColumns.some(
    (c) => c.ref?.[0] === hasOther
  )

  if (Object.keys(calc) || siblingResultArray.length || hasOtherRequested)
    dataArray.forEach((row) => {
      Object.assign(row, calc)
      const idx = siblingResultArray.findIndex((sibling) => {
        for (const key of keys) {
          if (sibling[key] !== row[key]) return false
        }
        return true
      })
      if (idx < 0) {
        if (hasOtherRequested) row[hasOther] = false
        for (const c of remainingDraftColumns) {
          if (c.ref) {
            row[c.ref[0]] = null
          }
        }
      } else {
        if (hasOtherRequested) row[hasOther] = true
        const other = siblingResultArray[idx]
        // merge both results
        for (k in other) {
          if (!(k in row)) row[k] = other[k]
        }
        siblingResultArray.splice(idx, 1) // not needed anymore, faster access next time, alternative hashmap
      }
    })
  return data
}

async function _directAccess(req, cleanedup) {
  console.log('Scenario: Direct Access')

  let data = await cds.tx(req).run(cleanedup.query)
  if (Array.isArray(data) && data[0] === undefined) data = [] // TODO: workaround

  if (!data) return data

  // not a draft-enabled entity
  if (!cleanedup.dbTarget._sibling) return data

  return _mergeFromSibling(req, cleanedup, data)
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
  // Also group by etc.
  const draftsQuery = SELECT.from(req.target.drafts)
    .columns(keys)
    .where(cleanedup.query.SELECT.where) // groupby missing, but don't include top/skip!!
  console.log('draftsQuery:', draftsQuery.SELECT)
  const resDrafts = await cds.tx(req).run(draftsQuery)
  console.log('calc actives...')
  const activesQuery = cds.ql.clone(cleanedup.query)
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
  console.log('actives.from', activesQuery.SELECT.from)
  console.log('actives.where', activesQuery.SELECT.where)
  console.log('actives.columns', activesQuery.SELECT.columns)
  const data = await cds.tx(req).run(activesQuery)
  return _mergeFromSibling(req, cleanedup, data, {
    readSibling: readSiblingEnum.never,
  }) // no need to read drafts again, all must be null
}

async function _ownDraft(req, cleanedup) {
  console.log('Scenario: Own Draft')
  const draftsQuery = cds.ql.clone(cleanedup.query)
  draftsQuery.where(
    { ref: ['DraftAdministrativeData', 'InProcessByUser'] },
    '=',
    req.user.id
  )
  console.log('draftsQuery.SELECT.from', draftsQuery.SELECT.from)
  console.log('draftsQuery.SELECT.where', draftsQuery.SELECT.where)
  console.log('draftsQuery.SELECT.columns', draftsQuery.SELECT.columns)
  const data = await cds.tx(req).run(draftsQuery)
  return _mergeFromSibling(req, cleanedup, data)
}

/** Returns a new query where draft columns are removed and names are normalized to `myEntity` or `myEntity_drafts`, depending on IsActiveEntity */
function _cleanedup(query) {
  const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)
  const clone = cds.ql
    .clone(query)
    .from({ ref: _cleanupRef(query.SELECT.from.ref, draftParams) })

  const dbTarget = _inferDbTarget(clone)
  clone.SELECT.where = []
  clone.where(newWhere)
  clone.SELECT.columns = _cleanupColumns(clone.SELECT.columns, dbTarget)
  // TODO: columns, orderBy, groupBy, ...
  console.log('cleanedup', {
    query: clone,
    draftParams,
    dbTargetName: dbTarget.name,
  })
  return { query: clone, draftParams, dbTarget }
}

async function onReadDrafts(req) {
  const cleanedup = _cleanedup(req.query)
  if (req.query.SELECT.from.ref[0].where?.length > 1) {
    // direct access
    return _directAccess(req, cleanedup)
  }

  if (req.query.SELECT.where) {
    // const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)

    if (
      cleanedup.draftParams['IsActiveEntity'] === true &&
      cleanedup.draftParams['HasDraftEntity'] === false
    ) {
      return _unchanged(req, cleanedup)
    }

    if (
      cleanedup.draftParams['IsActiveEntity'] === false &&
      cleanedup.draftParams['SiblingEntity.IsActiveEntity'] !== null
    ) {
      return _ownDraft(req, cleanedup)
    }
  }
}

module.exports = { onReadDrafts }
