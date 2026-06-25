// =====================================================================
//  Типы данных конструктора корабля
// =====================================================================

export type CellType =
  | 'Нос'
  | 'Корма'
  | 'Левый борт'
  | 'Правый борт'
  | 'Центр'
  | 'Киль'
  | 'Внутренний отсек'
  | 'Палуба'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'

export type Category =
  | 'weapon'
  | 'command'
  | 'generator'
  | 'energy'
  | 'weapon_support'
  | 'storage'
  | 'anchor'
  | 'defense'
  | 'movement'
  | 'repair'
  | 'boarding'
  | 'room'
  | 'hull_upgrade'
  | 'sails'
  | 'expansion'

export type WeaponSize = 'light' | 'medium' | 'heavy' | 'superHeavy'

export type ExpansionType = 'length' | 'width' | 'height'

/** Описание модуля в каталоге (шаблон). */
export interface ModuleDef {
  id: string
  name: string
  category: Category
  /** Размер в клетках (ширина). */
  width: number
  /** Размер в клетках (высота). */
  height: number
  /** Сколько клеток занимает (0 — не ставится на сетку). */
  cells: number
  /** Можно ли поворачивать. */
  rotatable?: boolean
  weight: number
  price: number
  installCost: number

  // Модификаторы статов корабля
  hpModifier?: number
  acModifier?: number
  speedModifier?: number
  maxLoadModifier?: number

  // Орудийные параметры
  weaponSize?: WeaponSize
  subtype?: string
  damage?: string
  range?: string

  // Энергия
  energyGeneration?: number
  energyStorage?: number
  generatorLevel?: number
  energyCost?: number

  // Лимиты орудий (для расширений)
  weaponLimitMod?: number
  heavyWeaponLimitMod?: number
  superHeavyWeaponLimitMod?: number

  // Ёмкости (хранилища)
  ammoCapacity?: number
  magicAmmoCapacity?: number
  powderCapacity?: number
  cargoCapacity?: number
  foodCapacity?: number
  equipmentCapacity?: number
  potionCapacity?: number

  // Расширения корпуса
  expansionType?: ExpansionType
  level?: number
  cellsAdded?: number
  internalCellsAdded?: number

  requirements?: string[]
  allowedCells: CellType[]
  description?: string
  effect?: string
  rarity: Rarity
  allowMultiple: boolean
}

/** Экземпляр модуля: куплен / в инвентаре / установлен на сетку. */
export interface ModuleInstance {
  instanceId: string
  defId: string
  /** Установлен ли (на сетке или как бесклеточный апгрейд). */
  placed: boolean
  /** Левая-верхняя клетка (колонка). */
  x?: number
  /** Левая-верхняя клетка (ряд). */
  y?: number
  /** Повёрнут на 90°. */
  rotated?: boolean
}

export type DamageMap = Record<string, number>

export interface Resources {
  gold: number
  food: number
  water: number
  repairMaterials: number
  ammo: number
  magicAmmo: number
  powder: number
  cargo: number
  valuables: number
}

export interface ModuleShipyardOffer {
  offerId: string
  type?: 'module'
  defId: string
}

export interface ResourceShipyardOffer {
  offerId: string
  type: 'resource'
  mode?: 'buy'
  resourceKey: keyof Resources
  quantity: number
  price: number
}

export interface CargoSaleShipyardOffer {
  offerId: string
  type: 'cargo_sale'
  quantity: number
  price: number
}

export type ShipyardOffer = ModuleShipyardOffer | ResourceShipyardOffer | CargoSaleShipyardOffer

export interface UISettings {
  activeTab: 'ship' | 'shipyard' | 'editor'
  masterMode: boolean
  showGridLabels: boolean
  weaponRelocationMode: boolean
}

/** Постоянное состояние игры (сохраняется в localStorage). */
export interface GameState {
  version: number
  shipName: string

  // Базовые параметры корабля
  baseHP: number
  baseAC: number
  baseSpeed: number
  baseMaxLoad: number
  baseWeaponLimit: number
  baseHeavyWeaponLimit: number
  baseSuperHeavyWeaponLimit: number
  baseMaxGeneratorLevel: number

  currentHP: number
  currentEnergy: number
  playerCount: number
  day: number

  // Уровни расширений (0–5)
  lengthLevel: number
  widthLevel: number
  heightLevel: number

  resources: Resources

  catalog: ModuleDef[]
  instances: ModuleInstance[]
  moduleDamage: DamageMap
  cellDamage: DamageMap
  shipyardOffers: ShipyardOffer[]

  selectedInstanceId: string | null
  ui: UISettings

  log: LogEntry[]
}

export interface LogEntry {
  id: string
  time: number
  text: string
  kind: 'info' | 'buy' | 'build' | 'warn' | 'error' | 'system'
}

// =====================================================================
//  Производные (вычисляемые) данные — не сохраняются
// =====================================================================

export interface GridCell {
  x: number
  y: number
  type: CellType
  damage: number
  /** Экземпляр, занимающий клетку, либо null. */
  occupiedBy: string | null
}

export interface PlacedFootprint {
  instanceId: string
  cells: Array<{ x: number; y: number }>
  w: number
  h: number
}

/** Статус конкретного установленного модуля. */
export interface ModuleStatus {
  instanceId: string
  /** Работает корректно (даёт бонусы). */
  working: boolean
  damage: number
  /** Установлен на сетку/как апгрейд. */
  installed: boolean
  errors: string[]
}

export interface DerivedState {
  grid: GridCell[][]
  rows: number
  cols: number
  totalCells: number
  freeCells: number

  maxHP: number
  ac: number
  speed: number
  maxLoad: number
  totalLoad: number

  loadLeft: number
  loadRight: number
  heelDiff: number
  heelLevel: 'none' | 'light' | 'dangerous' | 'critical'

  energyGeneration: number
  energyStorage: number
  energyUsed: number
  maxGeneratorLevel: number
  bestGeneratorLevel: number

  weaponLimit: number
  heavyWeaponLimit: number
  superHeavyWeaponLimit: number
  weaponsUsed: number
  heavyWeaponsUsed: number
  superHeavyWeaponsUsed: number

  // Бонусы от расширений (для отображения)
  expansionHP: number
  expansionAC: number
  expansionSpeed: number
  expansionMaxLoad: number

  moduleStatus: Record<string, ModuleStatus>
  footprints: Record<string, PlacedFootprint>
  buildErrors: string[]
  seaworthy: boolean
}

export interface SaveMeta {
  status: 'saved' | 'dirty' | 'error'
  lastSaved: number | null
}
