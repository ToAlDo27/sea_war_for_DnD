import type { GameState, ModuleDef, Resources, ShipyardOffer } from '../types'
import { uid } from '../utils'

const RESOURCE_PRICES: Record<keyof Resources, number> = {
  gold: 1,
  food: 25,
  water: 18,
  repairMaterials: 90,
  ammo: 55,
  magicAmmo: 260,
  powder: 80,
  cargo: 0,
  valuables: 180,
}

const BUYABLE_RESOURCES: Array<keyof Resources> = [
  'food',
  'water',
  'repairMaterials',
  'ammo',
  'magicAmmo',
  'powder',
  'valuables',
]

/** Текущий уровень расширения данного типа. */
function expansionLevel(state: GameState, type: ModuleDef['expansionType']): number {
  if (type === 'length') return state.lengthLevel
  if (type === 'width') return state.widthLevel
  if (type === 'height') return state.heightLevel
  return 0
}

/** Доступен ли модуль для появления на верфи. */
export function isShipyardEligible(state: GameState, def: ModuleDef): boolean {
  // Легендарные не появляются.
  if (def.rarity === 'legendary') return false

  if (def.category === 'expansion') {
    // Только следующий уровень расширения соответствующего типа.
    const cur = expansionLevel(state, def.expansionType)
    return (def.level ?? 0) === cur + 1 && (def.level ?? 0) <= 5
  }

  // Уникальные (allowMultiple=false), уже купленные/установленные — не появляются снова.
  if (!def.allowMultiple) {
    const owned = state.instances.some((i) => i.defId === def.id)
    if (owned) return false
  }
  return true
}

export function buildShipyardPool(state: GameState): ModuleDef[] {
  return state.catalog.filter((d) => isShipyardEligible(state, d))
}

/** Генерирует 1–6 случайных предложений верфи. */
export function generateShipyard(state: GameState): ShipyardOffer[] {
  const pool = buildShipyardPool(state)

  const moduleCount = pool.length === 0 ? 0 : 1 + Math.floor(Math.random() * 6) // 1..6
  const resourceCount = randomResourceOfferCount()
  const offers: ShipyardOffer[] = []
  const usedUnique = new Set<string>()
  let attempts = 0
  const maxAttempts = Math.max(1, moduleCount * 12)

  while (offers.filter((o) => o.type !== 'resource').length < moduleCount && attempts < maxAttempts) {
    attempts += 1
    const def = pool[Math.floor(Math.random() * pool.length)]
    if (!def.allowMultiple || def.category === 'expansion') {
      if (usedUnique.has(def.id)) continue
      usedUnique.add(def.id)
    }
    offers.push({ offerId: uid('offer'), type: 'module', defId: def.id })
  }

  for (let i = 0; i < resourceCount; i++) {
    const resourceKey = BUYABLE_RESOURCES[Math.floor(Math.random() * BUYABLE_RESOURCES.length)]
    const quantity = 1 + Math.floor(Math.random() * 30)
    offers.push({
      offerId: uid('offer'),
      type: 'resource',
      mode: 'buy',
      resourceKey,
      quantity,
      price: quantity * RESOURCE_PRICES[resourceKey],
    })
  }
  if (state.resources.cargo > 0 && Math.random() < 0.75) {
    const wanted = 10 + Math.floor(Math.random() * 991)
    const quantity = Math.max(1, Math.min(wanted, state.resources.cargo))
    const unitPrice = 12 + Math.floor(Math.random() * 49)
    offers.push({
      offerId: uid('offer'),
      type: 'cargo_sale',
      quantity,
      price: quantity * unitPrice,
    })
  }
  return offers
}

function randomResourceOfferCount(): number {
  const roll = Math.random()
  if (roll < 0.72) return 2 + Math.floor(Math.random() * 5) // 2..6
  if (roll < 0.96) return 7 + Math.floor(Math.random() * 3) // 7..9
  return 10 + Math.floor(Math.random() * 3) // 10..12
}
