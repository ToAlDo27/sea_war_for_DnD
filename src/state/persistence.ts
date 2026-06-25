import type { GameState, ModuleInstance, Resources } from '../types'
import { cloneCatalog } from '../data/catalog'
import { createInitialState, SAVE_VERSION, STARTING_RESOURCES, STORAGE_KEY } from '../data/defaults'

/** Приводит произвольный объект к корректному GameState (с заполнением пропусков). */
export function normalizeState(raw: unknown): GameState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Данные сохранения не являются объектом')
  }
  const base = createInitialState()
  const p = raw as Partial<GameState>

  const resources: Resources = { ...STARTING_RESOURCES, ...(p.resources ?? {}) }

  // Каталог: если отсутствует/пуст — берём базовый.
  const catalog = Array.isArray(p.catalog) && p.catalog.length > 0 ? p.catalog : cloneCatalog()

  // Экземпляры: фильтруем заведомо битые.
  const instances: ModuleInstance[] = Array.isArray(p.instances)
    ? p.instances.filter(
        (i): i is ModuleInstance => !!i && typeof i.instanceId === 'string' && typeof i.defId === 'string',
      )
    : []

  const state: GameState = {
    ...base,
    ...p,
    version: SAVE_VERSION,
    resources,
    catalog,
    instances,
    moduleDamage: normalizeDamageMap(p.moduleDamage),
    cellDamage: normalizeDamageMap(p.cellDamage),
    ui: { ...base.ui, ...(p.ui ?? {}) },
    log: Array.isArray(p.log) ? p.log.slice(-200) : base.log,
    shipyardOffers: Array.isArray(p.shipyardOffers) ? p.shipyardOffers : [],
    // Числовые поля — страхуемся от undefined
    baseHP: numOr(p.baseHP, base.baseHP),
    baseAC: numOr(p.baseAC, base.baseAC),
    baseSpeed: numOr(p.baseSpeed, base.baseSpeed),
    baseMaxLoad: numOr(p.baseMaxLoad, base.baseMaxLoad),
    baseWeaponLimit: numOr(p.baseWeaponLimit, base.baseWeaponLimit),
    baseHeavyWeaponLimit: numOr(p.baseHeavyWeaponLimit, base.baseHeavyWeaponLimit),
    baseSuperHeavyWeaponLimit: numOr(p.baseSuperHeavyWeaponLimit, base.baseSuperHeavyWeaponLimit),
    baseMaxGeneratorLevel: numOr(p.baseMaxGeneratorLevel, base.baseMaxGeneratorLevel),
    currentHP: numOr(p.currentHP, base.currentHP),
    currentEnergy: numOr(p.currentEnergy, 0),
    playerCount: Math.max(1, Math.round(numOr(p.playerCount, base.playerCount))),
    day: Math.max(1, Math.round(numOr(p.day, base.day))),
    lengthLevel: clampLvl(p.lengthLevel),
    widthLevel: clampLvl(p.widthLevel),
    heightLevel: clampLvl(p.heightLevel),
    selectedInstanceId: typeof p.selectedInstanceId === 'string' ? p.selectedInstanceId : null,
    shipName: typeof p.shipName === 'string' ? p.shipName : base.shipName,
  }
  return state
}

function numOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}
function clampLvl(v: unknown): number {
  const n = typeof v === 'number' ? v : 0
  return Math.max(0, Math.min(5, Math.floor(n)))
}

function normalizeDamageMap(v: unknown): Record<string, number> {
  if (!v || typeof v !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) continue
    const damage = Math.max(0, Math.min(100, Math.round(raw)))
    if (damage > 0) out[k] = damage
  }
  return out
}

export function saveState(state: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('Ошибка сохранения в localStorage', e)
    return false
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) != null
  } catch {
    return false
  }
}

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch (e) {
    console.error('Ошибка загрузки сохранения', e)
    return null
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Ошибка очистки сохранения', e)
  }
}

export function exportStateJSON(state: GameState): string {
  return JSON.stringify(state, null, 2)
}

export interface ImportResult {
  ok: boolean
  state?: GameState
  error?: string
}

export function importStateJSON(text: string): ImportResult {
  try {
    const parsed = JSON.parse(text)
    const state = normalizeState(parsed)
    return { ok: true, state }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Не удалось разобрать JSON' }
  }
}

/** Скачивание JSON-файла. */
export function downloadJSON(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
