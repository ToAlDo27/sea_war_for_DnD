import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { Category, GameState, LogEntry, ModuleDef, ModuleInstance, Resources, SaveMeta, UISettings } from '../types'
import { computeDerived, effectiveSize, getDefMap } from '../logic/compute'
import { generateGrid } from '../logic/grid'
import { generateShipyard } from '../logic/shipyard'
import { cloneCatalog } from '../data/catalog'
import { createInitialState, resetShipOnly } from '../data/defaults'
import { clearSave, loadState, normalizeState, saveState } from './persistence'
import { uid } from '../utils'

// =====================================================================
//  Действия
// =====================================================================
export type Action =
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'NEW_GAME' }
  | { type: 'RESET_SHIP' }
  | { type: 'RESET_ALL' }
  | { type: 'SET_SHIP_NAME'; name: string }
  | { type: 'SET_RESOURCE'; key: keyof Resources; value: number }
  | { type: 'ADJUST_RESOURCE'; key: keyof Resources; delta: number }
  | { type: 'SET_PLAYER_COUNT'; value: number }
  | { type: 'END_DAY' }
  | { type: 'SET_CURRENT_HP'; value: number }
  | { type: 'SET_CURRENT_ENERGY'; value: number }
  | { type: 'ADJUST_CURRENT_ENERGY'; delta: number }
  | { type: 'SET_UI'; partial: Partial<UISettings> }
  | { type: 'GENERATE_SHIPYARD' }
  | { type: 'CLEAR_SHIPYARD' }
  | { type: 'BUY_OFFER'; offerId: string }
  | { type: 'FIRE_WEAPON'; instanceId: string }
  | { type: 'BUY_EXPANSION'; defId: string }
  | { type: 'PLACE_INSTANCE'; instanceId: string; x: number; y: number }
  | { type: 'AUTO_PLACE_WEAPONS' }
  | { type: 'INSTALL_UPGRADE'; instanceId: string }
  | { type: 'UNPLACE_INSTANCE'; instanceId: string }
  | { type: 'ROTATE_INSTANCE'; instanceId: string }
  | { type: 'SELECT_INSTANCE'; instanceId: string | null }
  | { type: 'DELETE_INSTANCE'; instanceId: string }
  | { type: 'SET_BASE'; partial: Partial<GameState> }
  | { type: 'UPDATE_MODULE_DEF'; def: ModuleDef }
  | { type: 'ADD_MODULE_DEF'; def: ModuleDef }
  | { type: 'DELETE_MODULE_DEF'; id: string }
  | { type: 'RESET_CATALOG' }
  | { type: 'IMPORT_CATALOG'; catalog: ModuleDef[] }
  | { type: 'LOG'; text: string; kind?: LogEntry['kind'] }

function pushLog(state: GameState, text: string, kind: LogEntry['kind'] = 'info'): LogEntry[] {
  const entry: LogEntry = { id: uid('log'), time: Date.now(), text, kind }
  return [...state.log, entry].slice(-200)
}

function expansionLevelOf(state: GameState, type?: ModuleDef['expansionType']): number {
  if (type === 'length') return state.lengthLevel
  if (type === 'width') return state.widthLevel
  if (type === 'height') return state.heightLevel
  return 0
}

function applyExpansion(state: GameState, def: ModuleDef): GameState {
  const type = def.expansionType
  const cur = expansionLevelOf(state, type)
  if ((def.level ?? 0) !== cur + 1) return state
  if (state.resources.gold < def.price) return state
  const levelKey = type === 'length' ? 'lengthLevel' : type === 'width' ? 'widthLevel' : 'heightLevel'
  return {
    ...state,
    resources: { ...state.resources, gold: state.resources.gold - def.price },
    [levelKey]: cur + 1,
    log: pushLog(state, `Установлено расширение: ${def.name}.`, 'build'),
  }
}

function rollDie(sides: number): number {
  return 1 + Math.floor(Math.random() * Math.max(1, Math.floor(sides)))
}

function rollDamage(text?: string): { total: number; parts: string[] } | null {
  if (!text) return null
  const dice = [...text.matchAll(/(\d*)[dк](\d+)(?:\s*([+-])\s*(\d+))?/gi)]
  if (dice.length === 0) return null
  let total = 0
  const parts: string[] = []
  for (const match of dice) {
    const count = Math.max(1, parseInt(match[1] || '1', 10))
    const sides = Math.max(1, parseInt(match[2], 10))
    const rolls = Array.from({ length: count }, () => rollDie(sides))
    let subtotal = rolls.reduce((sum, v) => sum + v, 0)
    if (match[3] && match[4]) {
      const mod = parseInt(match[4], 10) * (match[3] === '-' ? -1 : 1)
      subtotal += mod
      parts.push(`${match[0]}: [${rolls.join(', ')}] ${mod >= 0 ? '+' : ''}${mod} = ${subtotal}`)
    } else {
      parts.push(`${match[0]}: [${rolls.join(', ')}] = ${subtotal}`)
    }
    total += subtotal
  }
  return { total, parts }
}

function fireWeapon(state: GameState, instanceId: string): GameState {
  const inst = state.instances.find((i) => i.instanceId === instanceId)
  const def = inst ? state.catalog.find((d) => d.id === inst.defId) : null
  if (!inst || !def || def.category !== 'weapon') return state
  const derived = computeDerived(state)
  const status = derived.moduleStatus[instanceId]
  if (!status?.installed || !status.working || status.errors.length > 0) {
    const reason = status?.errors.length
      ? status.errors.join('; ')
      : !status?.installed
        ? 'орудие не установлено'
        : 'не выполнены условия работы модуля'
    return {
      ...state,
      log: pushLog(state, `Выстрел заблокирован: ${def.name}. Причина: ${reason}.`, 'warn'),
    }
  }
  const attack = rollDie(20)
  const damage = rollDamage([def.damage, def.description, def.effect].filter(Boolean).join(' '))
  const damageText = damage ? ` Урон ${damage.total} (${damage.parts.join('; ')}).` : ' Урон не найден в описании орудия.'
  return {
    ...state,
    log: pushLog(state, `Выстрел: ${def.name}. к20 = ${attack}.${damageText}`, 'build'),
  }
}

function autoPlaceWeapons(state: GameState): GameState {
  const defMap = getDefMap(state.catalog)
  const layout = generateGrid(state.lengthLevel, state.widthLevel, state.heightLevel)
  const occupied = new Set<string>()
  const key = (x: number, y: number) => `${x},${y}`
  const weapons = new Set<string>()

  for (const inst of state.instances) {
    const def = defMap.get(inst.defId)
    if (!def) continue
    if (def.category === 'weapon' && def.cells > 0) {
      weapons.add(inst.instanceId)
      continue
    }
    if (!inst.placed || def.cells === 0 || inst.x == null || inst.y == null) continue
    for (const cell of footprint(inst, def)) {
      if (cell.x >= 0 && cell.y >= 0 && cell.x < layout.cols && cell.y < layout.rows) {
        occupied.add(key(cell.x, cell.y))
      }
    }
  }

  const placedWeapons = new Map<string, ModuleInstance>()
  for (const inst of state.instances.filter((i) => weapons.has(i.instanceId))) {
    const def = defMap.get(inst.defId)
    if (!def) continue
    const spot = findWeaponSpot(def, inst.rotated, occupied, layout)
    if (!spot) continue
    const next = { ...inst, placed: true, x: spot.x, y: spot.y, rotated: spot.rotated }
    placedWeapons.set(inst.instanceId, next)
    for (const cell of footprint(next, def)) occupied.add(key(cell.x, cell.y))
  }

  return {
    ...state,
    instances: state.instances.map((i) => placedWeapons.get(i.instanceId) ?? i),
    log: pushLog(state, `Орудия быстро расставлены: ${placedWeapons.size} шт.`, 'build'),
  }
}

function footprint(inst: ModuleInstance, def: ModuleDef): Array<{ x: number; y: number }> {
  const { w, h } = effectiveSize(def, inst.rotated)
  const cells: Array<{ x: number; y: number }> = []
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      cells.push({ x: (inst.x ?? 0) + dx, y: (inst.y ?? 0) + dy })
    }
  }
  return cells
}

function findWeaponSpot(
  def: ModuleDef,
  rotated: boolean | undefined,
  occupied: Set<string>,
  layout: ReturnType<typeof generateGrid>,
): { x: number; y: number; rotated?: boolean } | null {
  const attempts = def.rotatable ? [!!rotated, !rotated] : [!!rotated]
  const key = (x: number, y: number) => `${x},${y}`
  for (const nextRotated of attempts) {
    const { w, h } = effectiveSize(def, nextRotated)
    for (let y = 0; y <= layout.rows - h; y++) {
      for (let x = 0; x <= layout.cols - w; x++) {
        let ok = true
        for (let dy = 0; dy < h && ok; dy++) {
          for (let dx = 0; dx < w; dx++) {
            const cx = x + dx
            const cy = y + dy
            if (occupied.has(key(cx, cy)) || !def.allowedCells.includes(layout.types[cy][cx])) {
              ok = false
              break
            }
          }
        }
        if (ok) return { x, y, rotated: nextRotated }
      }
    }
  }
  return null
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state

    case 'NEW_GAME':
      return createInitialState()

    case 'RESET_SHIP':
      return { ...resetShipOnly(state), log: pushLog(state, 'Корабль сброшен к стартовой конфигурации.', 'system') }

    case 'RESET_ALL':
      return createInitialState()

    case 'SET_SHIP_NAME':
      return { ...state, shipName: action.name }

    case 'SET_RESOURCE':
      return { ...state, resources: { ...state.resources, [action.key]: clampResource(action.value) } }

    case 'ADJUST_RESOURCE':
      return {
        ...state,
        resources: { ...state.resources, [action.key]: clampResource(state.resources[action.key] + action.delta) },
      }

    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: Math.max(1, Math.round(action.value || 1)) }

    case 'END_DAY': {
      const need = Math.max(1, Math.round(state.playerCount || 1))
      const nextFood = clampResource(state.resources.food - need)
      const nextWater = clampResource(state.resources.water - need)
      const warn = state.resources.food < need || state.resources.water < need
      return {
        ...state,
        day: Math.max(1, state.day + 1),
        resources: { ...state.resources, food: nextFood, water: nextWater },
        log: pushLog(
          state,
          `День ${state.day} завершён. Расход: ${need} продовольствия и ${need} воды.${warn ? ' Запасов не хватило полностью.' : ''}`,
          warn ? 'warn' : 'system',
        ),
      }
    }

    case 'SET_CURRENT_HP':
      return { ...state, currentHP: Math.max(0, Math.round(action.value)) }

    case 'SET_CURRENT_ENERGY':
      return { ...state, currentEnergy: Math.max(0, Math.round(action.value)) }

    case 'ADJUST_CURRENT_ENERGY':
      return { ...state, currentEnergy: Math.max(0, state.currentEnergy + action.delta) }

    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.partial } }

    case 'GENERATE_SHIPYARD':
      return { ...state, shipyardOffers: generateShipyard(state), log: pushLog(state, 'Верфь представила новые предложения.', 'info') }

    case 'CLEAR_SHIPYARD':
      return { ...state, shipyardOffers: [] }

    case 'BUY_OFFER': {
      const offer = state.shipyardOffers.find((o) => o.offerId === action.offerId)
      if (!offer) return state
      if (offer.type === 'cargo_sale') {
        if (state.resources.cargo < offer.quantity) return state
        return {
          ...state,
          resources: {
            ...state.resources,
            cargo: clampResource(state.resources.cargo - offer.quantity),
            gold: clampResource(state.resources.gold + offer.price),
          },
          shipyardOffers: state.shipyardOffers.filter((o) => o.offerId !== action.offerId),
          log: pushLog(state, `Продан груз: ${offer.quantity} ед. за ${offer.price} зм.`, 'buy'),
        }
      }
      if (offer.type === 'resource') {
        if (state.resources.gold < offer.price) return state
        return {
          ...state,
          resources: {
            ...state.resources,
            gold: state.resources.gold - offer.price,
            [offer.resourceKey]: clampResource(state.resources[offer.resourceKey] + offer.quantity),
          },
          shipyardOffers: state.shipyardOffers.filter((o) => o.offerId !== action.offerId),
          log: pushLog(state, `Куплено ресурсов: ${offer.quantity} ед. (${offer.price} зм).`, 'buy'),
        }
      }
      const def = state.catalog.find((d) => d.id === offer.defId)
      if (!def) return state
      const remaining = state.shipyardOffers.filter((o) => o.offerId !== action.offerId)

      if (def.category === 'expansion') {
        const applied = applyExpansion(state, def)
        if (applied === state) return state // не куплено
        return { ...applied, shipyardOffers: remaining }
      }

      const cost = def.price + def.installCost
      if (state.resources.gold < cost) return state
      const instanceId = uid('inst')
      return {
        ...state,
        resources: { ...state.resources, gold: state.resources.gold - cost },
        instances: [...state.instances, { instanceId, defId: def.id, placed: false }],
        shipyardOffers: remaining,
        log: pushLog(state, `Куплено: ${def.name} (${cost} зм).`, 'buy'),
      }
    }

    case 'BUY_EXPANSION': {
      const def = state.catalog.find((d) => d.id === action.defId)
      if (!def || def.category !== 'expansion') return state
      const applied = applyExpansion(state, def)
      if (applied === state) return state
      return {
        ...applied,
        shipyardOffers: state.shipyardOffers.filter((o) => o.type === 'resource' || o.type === 'cargo_sale' || o.defId !== def.id),
      }
    }

    case 'FIRE_WEAPON':
      return fireWeapon(state, action.instanceId)

    case 'PLACE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map((i) =>
          i.instanceId === action.instanceId ? { ...i, placed: true, x: action.x, y: action.y } : i,
        ),
        selectedInstanceId: action.instanceId,
      }

    case 'AUTO_PLACE_WEAPONS':
      return autoPlaceWeapons(state)

    case 'INSTALL_UPGRADE':
      return {
        ...state,
        instances: state.instances.map((i) =>
          i.instanceId === action.instanceId ? { ...i, placed: true, x: undefined, y: undefined } : i,
        ),
        selectedInstanceId: action.instanceId,
      }

    case 'UNPLACE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map((i) =>
          i.instanceId === action.instanceId ? { ...i, placed: false, x: undefined, y: undefined } : i,
        ),
      }

    case 'ROTATE_INSTANCE':
      return {
        ...state,
        instances: state.instances.map((i) =>
          i.instanceId === action.instanceId ? { ...i, rotated: !i.rotated } : i,
        ),
      }

    case 'SELECT_INSTANCE':
      return { ...state, selectedInstanceId: action.instanceId }

    case 'DELETE_INSTANCE':
      return {
        ...state,
        instances: state.instances.filter((i) => i.instanceId !== action.instanceId),
        selectedInstanceId: state.selectedInstanceId === action.instanceId ? null : state.selectedInstanceId,
      }

    case 'SET_BASE':
      return { ...state, ...action.partial }

    case 'UPDATE_MODULE_DEF':
      return {
        ...state,
        catalog: state.catalog.map((d) => (d.id === action.def.id ? action.def : d)),
      }

    case 'ADD_MODULE_DEF':
      return { ...state, catalog: [...state.catalog, action.def] }

    case 'DELETE_MODULE_DEF':
      return {
        ...state,
        catalog: state.catalog.filter((d) => d.id !== action.id),
        instances: state.instances.filter((i) => i.defId !== action.id),
      }

    case 'RESET_CATALOG':
      return { ...state, catalog: cloneCatalog(), log: pushLog(state, 'Каталог сброшен к базовым данным.', 'system') }

    case 'IMPORT_CATALOG':
      return { ...state, catalog: action.catalog }

    case 'LOG':
      return { ...state, log: pushLog(state, action.text, action.kind) }

    default:
      return state
  }
}

function clampResource(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.round(v))
}

// =====================================================================
//  Контекст / провайдер
// =====================================================================
export type ToastKind = 'info' | 'success' | 'error' | 'warn'
export interface Toast {
  id: string
  text: string
  kind: ToastKind
}

interface StoreContextValue {
  state: GameState
  derived: ReturnType<typeof computeDerived>
  defMap: Map<string, ModuleDef>
  saveMeta: SaveMeta
  dispatch: React.Dispatch<Action>
  notify: (text: string, kind?: ToastKind) => void
  toasts: Toast[]
  dismissToast: (id: string) => void
  manualSave: () => void
  continueLastSave: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

function init(): GameState {
  const loaded = loadState()
  return loaded ?? createInitialState()
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [saveMeta, setSaveMeta] = useState<SaveMeta>({ status: 'saved', lastSaved: null })
  const [toasts, setToasts] = useState<Toast[]>([])
  const firstRun = useRef(true)
  const timer = useRef<number | null>(null)

  const derived = useMemo(() => computeDerived(state), [state])
  const defMap = useMemo(() => getDefMap(state.catalog), [state.catalog])

  // Автосохранение после каждого изменения (с дебаунсом).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      // первичная запись чтобы гарантировать наличие сохранения
      saveState(state)
      setSaveMeta({ status: 'saved', lastSaved: Date.now() })
      return
    }
    setSaveMeta((m) => ({ ...m, status: 'dirty' }))
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const ok = saveState(state)
      setSaveMeta({ status: ok ? 'saved' : 'error', lastSaved: ok ? Date.now() : null })
    }, 350)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [state])

  const notify = useCallback((text: string, kind: ToastKind = 'info') => {
    const id = uid('toast')
    setToasts((t) => [...t, { id, text, kind }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const manualSave = useCallback(() => {
    const ok = saveState(state)
    setSaveMeta({ status: ok ? 'saved' : 'error', lastSaved: ok ? Date.now() : null })
    notify(ok ? 'Игра сохранена' : 'Ошибка сохранения', ok ? 'success' : 'error')
  }, [state, notify])

  const continueLastSave = useCallback(() => {
    const loaded = loadState()
    if (loaded) {
      dispatch({ type: 'LOAD_STATE', state: loaded })
      notify('Загружено последнее сохранение', 'success')
    } else {
      notify('Сохранение не найдено', 'warn')
    }
  }, [notify])

  const value: StoreContextValue = {
    state,
    derived,
    defMap,
    saveMeta,
    dispatch,
    notify,
    toasts,
    dismissToast,
    manualSave,
    continueLastSave,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore вне StoreProvider')
  return ctx
}

// Утилиты экспорта для прочих модулей
export { clearSave, normalizeState }
export const CATEGORY_LIST: Category[] = [
  'weapon',
  'command',
  'generator',
  'energy',
  'weapon_support',
  'storage',
  'anchor',
  'defense',
  'movement',
  'repair',
  'boarding',
  'room',
  'hull_upgrade',
  'sails',
  'expansion',
]
