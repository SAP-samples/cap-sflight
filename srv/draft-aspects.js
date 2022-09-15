const cds = require('@sap/cds')
const { any, entity, Association } = cds.builtin.classes

/** allows to set getters which can be overwritten */
const _set = (obj, key, getter) => {
  Object.defineProperty(obj, key, {
    get() {
      return getter()
    },
    set(v) {
      Object.defineProperty(obj, key, { value: v, configurable: true })
    },
    configurable: true
  })
}

/** takes care of structured elements */
const _filterMap = (elements, cb) => {
  const res = {}
  for (const elName in elements) {
    const el = elements[elName]
    const returned = cb(el)
    if (returned) res[el.name] = returned
    if (el.elements) {
      res[el.name] = _filterMap(el.elements, cb)
    }
  }
  return res
}

const IGNORED_ELEMENTS_FOR_DRAFTS = new Set(['IsActiveEntity', 'HasActiveEntity', 'HasDraftEntity', 'SiblingEntity']) // not sure if 'SiblingEntity' should be there
const IGNORED_ELEMENTS_FOR_ACTIVES = new Set([
  ...IGNORED_ELEMENTS_FOR_DRAFTS,
  'DraftAdministrativeData',
  'DraftAdministrativeData_DraftUUID'
])

/** create a new element pointing to the corresponding draft CSN entity */
const _redirectToDrafts = el => {
  const newEl = Object.create(el)
  newEl.target = el.target + '_drafts'
  _set(newEl, '_target', () => el._target.drafts)
  return newEl
}

/** create a new element pointing to the corresponding active CSN entity */
const _redirectToActives = el => {
  const newEl = Object.create(el)
  _set(newEl, '_target', () => el._target.actives || el._target)
  return newEl
}

const _drafts4 = entity => {
  if (!entity.elements.HasDraftEntity) return false
  const drafts = Object.create(entity)
  drafts.name = entity.name + '_drafts'
  drafts.elements = _filterMap(entity.elements, el => {
    if (IGNORED_ELEMENTS_FOR_DRAFTS.has(el.name)) return
    if (
      el._type === 'cds.Composition' ||
      (el._type === 'cds.Association' && (el['@odata.draft.enclosed'] || el._isBacklink))
    ) {
      return _redirectToDrafts(el)
    }
    if (el._type === 'cds.Association') return _redirectToActives(el)
    return el
  })
  return drafts
}

const _actives4 = entity => {
  if (!entity.elements.HasDraftEntity) return false
  const actives = Object.create(entity)
  actives.elements = _filterMap(entity.elements, el => {
    if (IGNORED_ELEMENTS_FOR_ACTIVES.has(el.name)) return
    if (el.isAssociation) {
      if (!el._target.elements.HasDraftEntity) return el
      const newEl = Object.create(el)
      _set(newEl, '_target', () => el._target.actives)
      return newEl
    }
    return el
  })
  return actives
}

cds.extend(entity).with(class {
  /** Get the corresponding CSN entity for draft documents*/
  get drafts() {
    return this.own('_drafts') || this.set('_drafts', _drafts4(this))
  }

  /** Get the corresponding CSN entity for active documents */
  get actives() {
    return this.own('_actives') || this.set('_actives', _actives4(this))
  }
})

