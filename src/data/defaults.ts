import type { GameState, Resources } from '../types'
import { cloneCatalog } from './catalog'

export const SAVE_VERSION = 1
export const STORAGE_KEY = 'darkwater-ship-builder:v1'

export const STARTING_RESOURCES: Resources = {
  gold: 30000,
  food: 30,
  water: 30,
  repairMaterials: 10,
  ammo: 20,
  magicAmmo: 0,
  powder: 10,
  cargo: 0,
  valuables: 0,
}

export const RESOURCE_LABELS: Record<keyof Resources, string> = {
  gold: 'Золото',
  food: 'Продовольствие',
  water: 'Вода',
  repairMaterials: 'Ремонтные материалы',
  ammo: 'Обычные боеприпасы',
  magicAmmo: 'Магические снаряды',
  powder: 'Пороховые заряды',
  cargo: 'Груз',
  valuables: 'Ценные товары',
}

export const RESOURCE_ORDER: Array<keyof Resources> = [
  'gold',
  'food',
  'water',
  'repairMaterials',
  'ammo',
  'magicAmmo',
  'powder',
  'cargo',
  'valuables',
]

/** Создать новое стартовое состояние игры. */
export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    shipName: 'Безымянный корабль',

    baseHP: 300,
    baseAC: 15,
    baseSpeed: 40,
    baseMaxLoad: 24,
    baseWeaponLimit: 6,
    baseHeavyWeaponLimit: 1,
    baseSuperHeavyWeaponLimit: 0,
    baseMaxGeneratorLevel: 2,

    currentHP: 300,
    currentEnergy: 0,
    playerCount: 4,
    day: 1,

    lengthLevel: 0,
    widthLevel: 0,
    heightLevel: 0,

    resources: { ...STARTING_RESOURCES },

    catalog: cloneCatalog(),
    instances: [],
    shipyardOffers: [],

    selectedInstanceId: null,
    ui: {
      activeTab: 'ship',
      masterMode: false,
      showGridLabels: true,
      weaponRelocationMode: false,
    },

    log: [
      {
        id: 'log-init',
        time: Date.now(),
        text: 'Заложен новый корабль на Верфи Нового Мира.',
        kind: 'system',
      },
    ],
  }
}

/** Сбросить только корабль (сетка, модули, расширения, ХП), сохранив каталог и ресурсы. */
export function resetShipOnly(state: GameState): GameState {
  return {
    ...state,
    currentHP: state.baseHP,
    lengthLevel: 0,
    widthLevel: 0,
    heightLevel: 0,
    instances: [],
    selectedInstanceId: null,
  }
}
