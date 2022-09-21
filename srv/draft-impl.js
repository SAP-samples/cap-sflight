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

function _run(req, query) {
  // just to log all queries
  console.log('executing query', query)
  return cds.tx(req).run(query)
}

function _cleanupWhere(where) {
  const draftParams = {}
  const newWhere = []
  if (!where?.length) return { draftParams, newWhere }
  for (let i = 0; i < where.length; i++) {
    const el = where[i]
    if (el && typeof el === 'object' && el.xpr) {
      const { draftParams: _draftParams, newWhere: _newWhere } = _cleanupWhere(
        el.xpr
      )
      const newEl = {}
      newEl.xpr = _newWhere
      Object.assign(draftParams, _draftParams)
      if (!_newWhere.length) {
        if (where[i + 1] === 'and') i = i + 1
        else if (i > 0 && (where[i - 1] === 'and' || where[i - 1] === 'or')) {
          newWhere.pop()
        }
      } else {
        newWhere.push(newEl)
      }
      continue
    }
    if (
      el &&
      typeof el === 'object' &&
      el.ref?.length &&
      [
        ['IsActiveEntity'],
        ['HasDraftEntity'],
        ['SiblingEntity', 'IsActiveEntity'],
        ['DraftAdministrativeData', 'InProcessByUser'],
      ].some((r) => _isIdentical(r, el.ref))
    ) {
      draftParams[el.ref.join('.')] =
        where[i + 1] === '=' ? where[i + 2].val : { ne: where[i + 2].val }
      if (where[i + 3] === 'and') i = i + 3
      else if (i > 0 && (where[i - 1] === 'and' || where[i - 1] === 'or')) {
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
  if (!query.SELECT.columns)
    return SELECTABLE_DRAFT_COLUMNS.map((n) => ({ ref: [n] }))
  const cols = (query.SELECT.columns.some((c) => c === '*')) ? SELECTABLE_DRAFT_COLUMNS.map(n => ({ ref: [n] })) : []
  // if (query.SELECT.columns?.some(c => c?.ref?.[0] === hasSibling)) cols.push(hasSibling)
  for (const col of query.SELECT.columns) {
    if (
      col?.ref?.[0] &&
      (SELECTABLE_DRAFT_COLUMNS.includes(col.ref[0]) ||
        col.ref[0] === 'DraftAdministrativeData')
    )
      if (!cols.some(c => c?.ref && c.ref[0] === col?.ref?.[0])) cols.push(col)
    // TODO: Handle expands
  }
  return cols
}

function _mustReadSibling(remainingDraftColumns, readSibling, dataArray) {
  if (readSibling === false) return false
  if (readSibling === true && remainingDraftColumns.length) return true
  // if (
  //   readSibling === readSiblingEnum.onDemand &&
  //   remainingDraftColumns.length
  // ) {
  //   for (const data of dataArray) {
  //     for (const remaining of remainingDraftColumns) {
  //       // only if not already in data
  //       // Performance optimization: we can also read only those rows which are necessary instead of a global true/false
  //       if (!(remaining.ref[0] in data)) return true
  //     }
  //   }
  //   return false
  // }
}

async function _mergeFromSibling(
  req,
  cleanedUp,
  data,
  { readSibling = true } = {}
) {
  if (!data) return data
  const dataArray = Array.isArray(data) ? data : [data]
  if (!dataArray.length) return data // no data
  if (!cleanedUp.dbTarget._sibling) return data // not draft enabled

  const requestedDraftColumns = _requestedDraftColumns(req.query)

  const isDraft = cleanedUp.dbTarget._isDraft
  const hasSelf = isDraft ? 'HasDraftEntity' : 'HasActiveEntity'
  const hasOther = isDraft ? 'HasActiveEntity' : 'HasDraftEntity'

  // Can be easily calculated
  const calc = {}
  if (requestedDraftColumns.some((c) => c.ref?.[0] === 'IsActiveEntity'))
    calc.IsActiveEntity = !isDraft
  if (requestedDraftColumns.some((c) => c.ref?.[0] === hasSelf))
    calc[hasSelf] = false

  const remainingDraftColumns = requestedDraftColumns.filter((c) =>
    ['DraftAdministrativeData', 'DraftAdministrativeData_DraftUUID'].includes(
      c.ref?.[0]
    )
  )

  let siblingResultArray = []

  const mustReadSibling = _mustReadSibling(
    remainingDraftColumns,
    readSibling,
    dataArray
  )

  if (mustReadSibling) {
    const siblingQuery = cds.ql
      .clone(cleanedUp.query)
      .from(cleanedUp.dbTarget._sibling)
    siblingQuery.SELECT.columns = []
    siblingQuery.columns(cleanedUp.keys)
    siblingQuery.columns(remainingDraftColumns)
    siblingQuery.where([
      { list: cleanedUp.keys.map((pk) => ({ ref: [pk] })) },
      'in',
      {
        list: dataArray.map((row) => ({
          list: cleanedUp.keys.map((pk) => ({ val: row[pk] })),
        })),
      },
    ])
    const siblingResult = await _run(req, siblingQuery)
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
        for (const key of cleanedUp.keys) {
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

function _getDraftsQuery(req, cleanedUp) {
  const draftsQuery = SELECT.from(req.target.drafts)
    .columns(cleanedUp.keys)
    .where(cleanedUp.query.SELECT.where) // groupby missing, but don't include top/skip!!
  return draftsQuery
}

function _activesQueryFromDrafts(cleanedUp, resDrafts, { not = false }) {
  const activesQuery = cds.ql.clone(cleanedUp.query)
  if (!resDrafts || (Array.isArray(resDrafts) && !resDrafts.length)) {
    return not ? activesQuery : undefined
  }
  activesQuery.where([
    { list: cleanedUp.keys.map((pk) => ({ ref: [pk] })) },
    'not in',
    {
      list: resDrafts.map((row) => ({
        list: cleanedUp.keys.map((pk) => ({ val: row[pk] })),
      })),
    },
  ])
}

async function _directAccess(req, cleanedUp) {
  console.log('Draft Scenario: Direct Access')

  let data = await _run(req, cleanedUp.query)
  if (Array.isArray(data) && data[0] === undefined) data = [] // TODO: workaround

  if (!data) return data

  // not a draft-enabled entity
  if (!cleanedUp.dbTarget._sibling) return data

  return _mergeFromSibling(req, cleanedUp, data)
}

async function _unchanged(req, cleanedUp) {
  console.log('Draft Scenario: Unchanged')
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
  const draftsQuery = _getDraftsQuery(req, cleanedUp)
  const resDrafts = await _run(req, draftsQuery)
  console.log('got drafts', resDrafts)
  const activesQuery = _activesQueryFromDrafts(cleanedUp, resDrafts, { not: true })
  console.log('actives?', activesQuery)
  const data = await _run(req, activesQuery)
  return _mergeFromSibling(req, cleanedUp, data, {
    readSibling: false,
  }) // no need to read drafts again, all must be null
}

async function _ownDraft(req, cleanedUp) {
  console.log('Draft Scenario: Own Draft')
  const draftsQuery = cds.ql.clone(cleanedUp.query)
  draftsQuery.where(
    { ref: ['DraftAdministrativeData', 'InProcessByUser'] },
    '=',
    req.user.id
  )
  const data = await _run(req, draftsQuery)
  return _mergeFromSibling(req, cleanedUp, data)
}

async function _activeWithDraftInProcess(req, cleanedUp, { isLocked }) {
  const draftsQuery = _getDraftsQuery(req, cleanedUp)
  const DRAFT_CANCEL_TIMEOUT_IN_SEC =
    ((cds.env.drafts && cds.env.drafts.cancellationTimeout) || 15) * 60
  draftsQuery.where([
    { ref: ['DraftAdministrativeData', 'InProcessByUser'] },
    '!=',
    { val: req.user.id },
    'and',
    { ref: ['DraftAdministrativeData', 'InProcessByUser'] },
    'is not null',
    'and',
    {
      func: 'seconds_between',
      args: [
        { ref: ['DraftAdministrativeData', 'LastChangeDateTime'] },
        'CURRENT_TIMESTAMP',
      ],
    },
    isLocked ? '<' : '>',
    { val: DRAFT_CANCEL_TIMEOUT_IN_SEC },
  ])
  const resDrafts = await _run(req, draftsQuery)
  const activesQuery = _activesQueryFromDrafts(cleanup, resDrafts)
  if (!activesQuery) return []
  const data = await _run(req, activesQuery)
  return _mergeFromSibling(req, cleanedUp, data, {
    readSibling: false,
  })
}

async function _lockedByAnotherUser(req, cleanedUp) {
  console.log('Draft Scenario: Locked by Another User')
  return _activeWithDraftInProcess(req, cleanedUp, { isLocked: true })
}

async function _unsavedChangesByAnotherUser(req, cleanedUp) {
  console.log('Draft Scenario: Unsaved Changes by Another User')
  return _activeWithDraftInProcess(req, cleanedUp, { isLocked: false })
}

async function _all(req, cleanedUp) {
  console.log('Draft Scenario: All')
  throw new Error('Union not yet supported')
}

/** Returns a new query where draft columns are removed and names are normalized to `myEntity` or `myEntity_drafts`, depending on IsActiveEntity */
function _cleanedUp(query) {
  const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)
  const clone = cds.ql
    .clone(query)
    .from({ ref: _cleanupRef(query.SELECT.from.ref, draftParams) })

  const dbTarget = _inferDbTarget(clone)
  clone.SELECT.where = newWhere
  clone.SELECT.columns = _cleanupColumns(clone.SELECT.columns, dbTarget)
  // TODO: columns, orderBy, groupBy, ...
  const keys = _getKeyArray(dbTarget)
  console.log('cleanedUp', {
    query: clone,
    draftParams,
    dbTargetName: dbTarget.name,
    keys,
  })
  return { query: clone, draftParams, dbTarget, keys }
}

async function onReadDrafts(req, next) {
  console.log('incoming query', req.query.SELECT)
  const cleanedUp = _cleanedUp(req.query)
  if (req.query.SELECT.from.ref[0].where?.length > 1) {
    // direct access
    return _directAccess(req, cleanedUp)
  }

  if (req.query.SELECT.where) {
    // const { draftParams, newWhere } = _cleanupWhere(query.SELECT.where)

    if (
      cleanedUp.draftParams['IsActiveEntity'] === true &&
      cleanedUp.draftParams['HasDraftEntity'] === false
    ) {
      return _unchanged(req, cleanedUp)
    }

    if (
      cleanedUp.draftParams['IsActiveEntity'] === false &&
      cleanedUp.draftParams['SiblingEntity.IsActiveEntity'] === null
    ) {
      return _all(req, cleanedUp)
    }

    if (cleanedUp.draftParams['IsActiveEntity'] === false) {
      return _ownDraft(req, cleanedUp)
    }

    if (
      cleanedUp.draftParams['IsActiveEntity'] === true &&
      cleanedUp.draftParams['SiblingEntity.IsActiveEntity'] === null &&
      cleanedUp.draftParams['DraftAdministrativeData.InProcessByUser']?.ne ===
        ''
    ) {
      return _lockedByAnotherUser(req, cleanedUp)
    }

    if (
      cleanedUp.draftParams['IsActiveEntity'] === true &&
      cleanedUp.draftParams['SiblingEntity.IsActiveEntity'] === null &&
      cleanedUp.draftParams['DraftAdministrativeData.InProcessByUser'] === ''
    ) {
      return _unsavedChangesByAnotherUser(req, cleanedUp)
    }
  }


  const data = await _run(req, cleanedUp.query)
  if (!cleanedUp.dbTarget._sibling) return data 

  return _mergeFromSibling(req, cleanedUp, data)
}

async function onNewDraft(req, next) {
  // Direct creation of a new thing
  if (typeof req.query.INSERT.into === 'string') {
    const DraftUUID = cds.utils.uuid()

    const draftAdminData = {
      DraftUUID,
      CreationDateTime: req.timestamp,
      CreatedByUser: req.user.id,
      LastChangeDateTime: req.timestamp,
      LastChangedByUser: req.user.id,
      DraftIsCreatedByMe: true,
      DraftIsProcessedByMe: true,
      InProcessByUser: req.user.id,
    }

    const adminDataCQN = INSERT.into('DRAFT.DraftAdministrativeData').entries(
      draftAdminData
    )

    const draftData = Object.assign(
      {
        DraftAdministrativeData_DraftUUID: DraftUUID,
      },
      req.query.INSERT.entries[0]
    )
    delete draftData.IsActiveEntity
    const draftCQN = INSERT.into(req.target.drafts).entries(draftData)

    await Promise.all(
      [adminDataCQN, draftCQN].map((cqn) => _run(req, cqn))
    )
    // do read after write instead
    const resArray = await _run(req, SELECT.from(req.target.drafts))
    const res = Object.assign(resArray[0], { IsActiveEntity: false })
    return res
  }

  // TODO: could also be via navigation
}

module.exports = { onReadDrafts, onNewDraft }
