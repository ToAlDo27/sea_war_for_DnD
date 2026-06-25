import type {
  CellType,
  DerivedState,
  GameState,
  GridCell,
  ModuleDef,
  ModuleInstance,
  ModuleStatus,
  PlacedFootprint,
} from '../types'
import { generateGrid } from './grid'
import { checkRequirement, requiresGenerator } from './requirements'

const ACCESS_TYPES = new Set(['Палуба', 'Центр', 'Внутренний отсек'])
const CONTROL_IDS = new Set(['mv-water-jets', 'rp-backup-control', 'cmd-battle-console'])

export function getDefMap(catalog: ModuleDef[]): Map<string, ModuleDef> {
  const m = new Map<string, ModuleDef>()
  for (const d of catalog) m.set(d.id, d)
  return m
}

export function effectiveSize(def: ModuleDef, rotated?: boolean): { w: number; h: number } {
  if (rotated && def.rotatable) return { w: def.height, h: def.width }
  return { w: def.width, h: def.height }
}

export function footprintCells(inst: ModuleInstance, def: ModuleDef): Array<{ x: number; y: number }> {
  const { w, h } = effectiveSize(def, inst.rotated)
  const cells: Array<{ x: number; y: number }> = []
  const x0 = inst.x ?? 0
  const y0 = inst.y ?? 0
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      cells.push({ x: x0 + dx, y: y0 + dy })
    }
  }
  return cells
}

const key = (x: number, y: number) => `${x},${y}`

interface ExpansionMods {
  hp: number
  ac: number
  speed: number
  maxLoad: number
  weaponLimit: number
  heavyLimit: number
  superHeavyLimit: number
}

/** Сумма модификаторов всех уровней расширений до текущего включительно. */
function sumExpansions(catalog: ModuleDef[], lengthLevel: number, widthLevel: number, heightLevel: number): ExpansionMods {
  const acc: ExpansionMods = { hp: 0, ac: 0, speed: 0, maxLoad: 0, weaponLimit: 0, heavyLimit: 0, superHeavyLimit: 0 }
  for (const d of catalog) {
    if (d.category !== 'expansion' || !d.expansionType || !d.level) continue
    const lvl = d.expansionType === 'length' ? lengthLevel : d.expansionType === 'width' ? widthLevel : heightLevel
    if (d.level <= lvl) {
      acc.hp += d.hpModifier ?? 0
      acc.ac += d.acModifier ?? 0
      acc.speed += d.speedModifier ?? 0
      acc.maxLoad += d.maxLoadModifier ?? 0
      acc.weaponLimit += d.weaponLimitMod ?? 0
      acc.heavyLimit += d.heavyWeaponLimitMod ?? 0
      acc.superHeavyLimit += d.superHeavyWeaponLimitMod ?? 0
    }
  }
  return acc
}

export function computeDerived(state: GameState): DerivedState {
  const defMap = getDefMap(state.catalog)
  const layout = generateGrid(state.lengthLevel, state.widthLevel, state.heightLevel)
  const { rows, cols, types } = layout
  const totalCells = types.flat().filter((type) => type !== 'Пусто').length

  // ---- Разделяем экземпляры на сеточные и бесклеточные апгрейды ----
  const gridInstances: ModuleInstance[] = []
  const upgradeInstances: ModuleInstance[] = []
  for (const inst of state.instances) {
    if (!inst.placed) continue
    const def = defMap.get(inst.defId)
    if (!def) continue
    if (def.cells === 0) upgradeInstances.push(inst)
    else if (inst.x != null && inst.y != null) gridInstances.push(inst)
  }

  // ---- Footprints + занятость + конфликты ----
  const footprints: Record<string, PlacedFootprint> = {}
  const occupancyCount: Record<string, number> = {}
  const occupancyOwner: Record<string, string> = {}
  const errorsByInstance: Record<string, string[]> = {}
  const addErr = (id: string, e: string) => {
    ;(errorsByInstance[id] ||= []).push(e)
  }
  const cellDamageAt = (x: number, y: number): number => Math.max(0, Math.min(100, state.cellDamage?.[key(x, y)] ?? 0))
  const moduleDamageAt = (id: string): number => Math.max(0, Math.min(100, state.moduleDamage?.[id] ?? 0))

  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    const cells = footprintCells(inst, def)
    const { w, h } = effectiveSize(def, inst.rotated)
    footprints[inst.instanceId] = { instanceId: inst.instanceId, cells, w, h }
    for (const c of cells) {
      const inBounds = c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows
      if (!inBounds) continue
      const k = key(c.x, c.y)
      occupancyCount[k] = (occupancyCount[k] ?? 0) + 1
      if (!(k in occupancyOwner)) occupancyOwner[k] = inst.instanceId
    }
  }

  // ---- Структурная проверка каждого сеточного модуля ----
  const structuralOk: Record<string, boolean> = {}
  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    const cells = footprints[inst.instanceId].cells
    const moduleDamage = moduleDamageAt(inst.instanceId)
    const slotDamage = Math.max(0, ...cells.map((c) => (inBounds(c, rows, cols) ? cellDamageAt(c.x, c.y) : 0)))
    let ok = true

    if (moduleDamage >= 100) {
      addErr(inst.instanceId, 'Модуль выведен из строя')
      ok = false
    }
    if (slotDamage >= 100) {
      addErr(inst.instanceId, 'Слот корпуса выведен из строя')
      ok = false
    }

    // 1. Помещается ли в границы
    const outOfBounds = cells.some((c) => c.x < 0 || c.y < 0 || c.x >= cols || c.y >= rows)
    if (outOfBounds) {
      addErr(inst.instanceId, 'Модуль не помещается на сетку')
      ok = false
    }

    // 2. Пересечение с другими модулями
    if (!outOfBounds) {
      const overlap = cells.some((c) => (occupancyCount[key(c.x, c.y)] ?? 0) > 1)
      if (overlap) {
        addErr(inst.instanceId, 'Клетки заняты другим модулем')
        ok = false
      }
    }

    // 3. Тип клеток
    if (!outOfBounds) {
      const allowed = new Set(def.allowedCells)
      const badType = cells.some((c) => !allowed.has(types[c.y][c.x]))
      if (badType) {
        addErr(inst.instanceId, 'Неверный тип клетки')
        ok = false
      }
    }

    // 4. Доступ (правило проходов)
    if (!outOfBounds && !hasAccess(cells, types, occupancyOwner, inst.instanceId, rows, cols)) {
      addErr(inst.instanceId, 'Нет свободного доступа к модулю')
      ok = false
    }

    structuralOk[inst.instanceId] = ok
  }

  // ---- Генераторы / лимит уровня генератора ----
  const maxGeneratorLevel = state.baseMaxGeneratorLevel + Math.max(state.lengthLevel, state.widthLevel, state.heightLevel)
  let bestGeneratorLevel = 0
  let energyGeneration = 0
  let energyStorage = 0

  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    if (def.category !== 'generator') continue
    if (!structuralOk[inst.instanceId]) continue
    const lvl = def.generatorLevel ?? 0
    if (lvl > maxGeneratorLevel) {
      addErr(inst.instanceId, `Генератор уровня ${lvl} превышает лимит корабля (${maxGeneratorLevel})`)
      continue
    }
    bestGeneratorLevel = Math.max(bestGeneratorLevel, lvl)
    energyGeneration += def.energyGeneration ?? 0
    energyStorage += def.energyStorage ?? 0
  }

  const reqCtx = {
    bestGeneratorLevel,
    lengthLevel: state.lengthLevel,
    widthLevel: state.widthLevel,
    heightLevel: state.heightLevel,
  }

  // ---- Требования модулей (генератор/расширения) ----
  const requirementsOk: Record<string, boolean> = {}
  const checkReqs = (inst: ModuleInstance, def: ModuleDef): boolean => {
    let ok = true
    if (def.requirements) {
      for (const r of def.requirements) {
        const res = checkRequirement(r, reqCtx)
        if (!res.met) {
          addErr(inst.instanceId, res.error ?? `Не выполнено требование: ${r}`)
          ok = false
        }
      }
    }
    return ok
  }
  for (const inst of [...gridInstances, ...upgradeInstances]) {
    const def = defMap.get(inst.defId)!
    requirementsOk[inst.instanceId] = checkReqs(inst, def)
  }

  const damageOk: Record<string, boolean> = {}
  for (const inst of [...gridInstances, ...upgradeInstances]) {
    const damage = moduleDamageAt(inst.instanceId)
    damageOk[inst.instanceId] = damage < 100
    if (damage >= 100) addErr(inst.instanceId, 'Модуль выведен из строя')
  }

  // ---- Батареи (энергозапас) от рабочих энергомодулей ----
  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    if (def.category !== 'energy') continue
    if (!structuralOk[inst.instanceId]) continue
    energyStorage += def.energyStorage ?? 0
  }

  // ---- Предварительный «working» (без лимита орудий) ----
  const energyOk: Record<string, boolean> = {}
  for (const inst of [...gridInstances, ...upgradeInstances]) {
    const def = defMap.get(inst.defId)!
    const cost = def.energyCost ?? 0
    energyOk[inst.instanceId] = true
    if (cost > 0 && state.currentEnergy < cost) {
      addErr(inst.instanceId, `Недостаточно МЭ для активации: нужно ${cost}, доступно ${state.currentEnergy}`)
      energyOk[inst.instanceId] = false
    }
  }

  const working: Record<string, boolean> = {}
  for (const inst of gridInstances) {
    working[inst.instanceId] = structuralOk[inst.instanceId] && requirementsOk[inst.instanceId] && energyOk[inst.instanceId] && damageOk[inst.instanceId]
  }
  for (const inst of upgradeInstances) {
    working[inst.instanceId] = requirementsOk[inst.instanceId] && energyOk[inst.instanceId] && damageOk[inst.instanceId]
  }

  // ---- Лимиты орудий ----
  const expMods = sumExpansions(state.catalog, state.lengthLevel, state.widthLevel, state.heightLevel)
  const weaponLimit = state.baseWeaponLimit + expMods.weaponLimit
  const heavyWeaponLimit = state.baseHeavyWeaponLimit + expMods.heavyLimit
  const superHeavyWeaponLimit = state.baseSuperHeavyWeaponLimit + expMods.superHeavyLimit

  let weaponsUsed = 0
  let heavyWeaponsUsed = 0
  let superHeavyWeaponsUsed = 0
  let overGeneral = false
  let overHeavy = false
  let overSuper = false

  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    if (def.category !== 'weapon') continue
    if (!working[inst.instanceId]) continue
    const size = def.weaponSize
    const isHeavy = size === 'heavy'
    const isSuper = size === 'superHeavy'

    const wouldOverGeneral = weaponsUsed + 1 > weaponLimit
    const wouldOverHeavy = isHeavy && heavyWeaponsUsed + 1 > heavyWeaponLimit
    const wouldOverSuper = isSuper && superHeavyWeaponsUsed + 1 > superHeavyWeaponLimit

    if (wouldOverGeneral || wouldOverHeavy || wouldOverSuper) {
      if (wouldOverSuper) {
        addErr(inst.instanceId, 'Превышен лимит сверхтяжёлых орудий')
        overSuper = true
      } else if (wouldOverHeavy) {
        addErr(inst.instanceId, 'Превышен лимит тяжёлых орудий')
        overHeavy = true
      } else {
        addErr(inst.instanceId, 'Превышен орудийный лимит')
        overGeneral = true
      }
      working[inst.instanceId] = false
      continue
    }
    weaponsUsed += 1
    if (isHeavy) heavyWeaponsUsed += 1
    if (isSuper) superHeavyWeaponsUsed += 1
  }

  // ---- Итоговые статы по рабочим модулям ----
  let modHP = 0
  let modAC = 0
  let modSpeed = 0
  let modMaxLoad = 0
  let totalLoad = 0
  let energyUsed = 0

  let hasPropulsion = false
  let hasKeelNode = false
  let hasControl = false

  const allPlaced = [...gridInstances, ...upgradeInstances]
  for (const inst of allPlaced) {
    const def = defMap.get(inst.defId)!
    totalLoad += def.weight // нагрузка учитывает все установленные модули
    const isWorking = working[inst.instanceId]
    if (!isWorking) continue
    modHP += def.hpModifier ?? 0
    modAC += def.acModifier ?? 0
    modSpeed += def.speedModifier ?? 0
    modMaxLoad += def.maxLoadModifier ?? 0
    if ((def.energyCost ?? 0) > 0) energyUsed += def.energyCost ?? 0

    if (def.category === 'sails' || (def.category === 'movement' && (def.speedModifier ?? 0) > 0)) {
      hasPropulsion = true
    }
    const fp = footprints[inst.instanceId]
    if (fp) {
      const onKeel = fp.cells.some((c) => inBounds(c, rows, cols) && types[c.y][c.x] === 'Киль')
      if (onKeel) hasKeelNode = true
      const onStern = fp.cells.some((c) => inBounds(c, rows, cols) && types[c.y][c.x] === 'Корма')
      if (CONTROL_IDS.has(def.id) || (def.category === 'movement' && onStern)) hasControl = true
    } else if (CONTROL_IDS.has(def.id)) {
      hasControl = true
    }
  }

  // ---- Крен ----
  const { left, right } = computeHeel(gridInstances, defMap, footprints, cols, rows)
  const heelDiff = Math.abs(left - right)
  const heelLevel = heelDiff >= 7 ? 'critical' : heelDiff >= 5 ? 'dangerous' : heelDiff >= 3 ? 'light' : 'none'

  let heelSpeedPenalty = 0
  let heelACPenalty = 0
  if (heelLevel === 'dangerous') heelSpeedPenalty = -5
  if (heelLevel === 'critical') {
    heelSpeedPenalty = -10
    heelACPenalty = -1
  }

  const expansionHP = expMods.hp
  const maxHP = Math.max(1, state.baseHP + modHP + expansionHP)
  const ac = state.baseAC + modAC + expMods.ac + heelACPenalty
  const speed = Math.max(0, state.baseSpeed + modSpeed + expMods.speed + heelSpeedPenalty)
  const maxLoad = state.baseMaxLoad + modMaxLoad + expMods.maxLoad

  // ---- Занятые/свободные клетки ----
  let occupiedCount = 0
  for (const k in occupancyCount) if (occupancyCount[k] > 0) occupiedCount += 1
  const freeCells = Math.max(0, totalCells - occupiedCount)

  // ---- Сетка для отображения ----
  const grid: GridCell[][] = []
  for (let y = 0; y < rows; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < cols; x++) {
      row.push({ x, y, type: types[y][x], damage: cellDamageAt(x, y), occupiedBy: occupancyOwner[key(x, y)] ?? null })
    }
    grid.push(row)
  }

  // ---- Статусы модулей ----
  const moduleStatus: Record<string, ModuleStatus> = {}
  for (const inst of state.instances) {
    const def = defMap.get(inst.defId)
    if (!def) continue
    const installed = inst.placed && (def.cells === 0 || (inst.x != null && inst.y != null))
    const fp = footprints[inst.instanceId]
    const slotDamage = fp ? Math.max(0, ...fp.cells.map((c) => (inBounds(c, rows, cols) ? cellDamageAt(c.x, c.y) : 0))) : 0
    const damage = Math.max(moduleDamageAt(inst.instanceId), slotDamage)
    moduleStatus[inst.instanceId] = {
      instanceId: inst.instanceId,
      installed,
      working: installed ? !!working[inst.instanceId] : false,
      damage,
      errors: errorsByInstance[inst.instanceId] ?? [],
    }
  }

  // ---- Ошибки сборки (уровень корабля) ----
  const buildErrors: string[] = []
  if (totalLoad > maxLoad) buildErrors.push(`Превышена нагрузка: ${totalLoad} / ${maxLoad}`)
  if (speed <= 0) buildErrors.push('Скорость корабля равна 0 - движение невозможно')
  if (energyUsed > energyGeneration) buildErrors.push(`Не хватает генерации МЭ: расход ${energyUsed} / генерация ${energyGeneration}`)
  if (state.currentEnergy > energyStorage) buildErrors.push(`Текущий запас МЭ превышает ёмкость: ${state.currentEnergy} / ${energyStorage}`)
  if (heelLevel === 'critical') buildErrors.push('Критический крен — корабль не готов к плаванию')
  if (!hasPropulsion) buildErrors.push('Нет двигателя или парусов')
  if (!hasKeelNode) buildErrors.push('Нет килевого узла (модуля на киле)')
  if (!hasControl) buildErrors.push('Нет управления кораблём')
  if (overGeneral) buildErrors.push('Превышен орудийный лимит')
  if (overHeavy) buildErrors.push('Превышен лимит тяжёлых орудий')
  if (overSuper) buildErrors.push('Превышен лимит сверхтяжёлых орудий')
  if (state.currentHP > maxHP) buildErrors.push('Текущие ХП превышают максимум')
  const anyModuleError = Object.values(moduleStatus).some((s) => s.installed && s.errors.length > 0)
  if (anyModuleError) buildErrors.push('Есть модули, установленные с ошибками')

  const seaworthy = buildErrors.length === 0

  return {
    grid,
    rows,
    cols,
    totalCells,
    freeCells,
    maxHP,
    ac,
    speed,
    maxLoad,
    totalLoad,
    loadLeft: Math.round(left * 10) / 10,
    loadRight: Math.round(right * 10) / 10,
    heelDiff: Math.round(heelDiff * 10) / 10,
    heelLevel,
    energyGeneration,
    energyStorage,
    energyUsed,
    maxGeneratorLevel,
    bestGeneratorLevel,
    weaponLimit,
    heavyWeaponLimit,
    superHeavyWeaponLimit,
    weaponsUsed,
    heavyWeaponsUsed,
    superHeavyWeaponsUsed,
    expansionHP: expMods.hp,
    expansionAC: expMods.ac,
    expansionSpeed: expMods.speed,
    expansionMaxLoad: expMods.maxLoad,
    moduleStatus,
    footprints,
    buildErrors,
    seaworthy,
  }
}

function inBounds(c: { x: number; y: number }, rows: number, cols: number): boolean {
  return c.x >= 0 && c.y >= 0 && c.x < cols && c.y < rows
}

function hasAccess(
  cells: Array<{ x: number; y: number }>,
  types: CellType[][],
  owner: Record<string, string>,
  _selfId: string,
  rows: number,
  cols: number,
): boolean {
  // Если модуль сам стоит на палубе/центре/внутреннем отсеке — доступен.
  for (const c of cells) {
    if (inBounds(c, rows, cols) && ACCESS_TYPES.has(types[c.y][c.x])) return true
  }
  const own = new Set(cells.map((c) => key(c.x, c.y)))
  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  for (const c of cells) {
    for (const [dx, dy] of deltas) {
      const nx = c.x + dx
      const ny = c.y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      const nk = key(nx, ny)
      if (own.has(nk)) continue
      const occ = owner[nk]
      if (!occ) return true // пустая соседняя клетка
      if (ACCESS_TYPES.has(types[ny][nx])) return true // палуба/центр/внутр.
    }
  }
  return false
}

function computeHeel(
  gridInstances: ModuleInstance[],
  defMap: Map<string, ModuleDef>,
  footprints: Record<string, PlacedFootprint>,
  cols: number,
  rows: number,
): { left: number; right: number } {
  const center = (cols - 1) / 2
  let left = 0
  let right = 0
  for (const inst of gridInstances) {
    const def = defMap.get(inst.defId)!
    const fp = footprints[inst.instanceId]
    if (!fp) continue
    const inCells = fp.cells.filter((c) => inBounds(c, rows, cols))
    const n = inCells.length || 1
    const per = def.weight / n
    for (const c of inCells) {
      if (c.x < center) left += per
      else if (c.x > center) right += per
      else {
        left += per / 2
        right += per / 2
      }
    }
  }
  return { left, right }
}
