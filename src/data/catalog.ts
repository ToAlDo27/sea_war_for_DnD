import type { Category, ModuleDef } from '../types'

// Помощник: заполняет значения по умолчанию, вычисляет cells как width*height.
type Spec = Partial<ModuleDef> & Pick<ModuleDef, 'id' | 'name' | 'category'>
const D = (p: Spec): ModuleDef => {
  const width = p.width ?? 1
  const height = p.height ?? 1
  return {
    weight: 1,
    price: 0,
    installCost: 0,
    rarity: 'common',
    allowMultiple: false,
    allowedCells: [],
    ...p,
    width,
    height,
    cells: p.cells ?? width * height,
  }
}

// Общие допустимые клетки для большинства орудий
const WEAPON_CELLS = ['Нос', 'Корма', 'Левый борт', 'Правый борт', 'Палуба'] as const
const wc = () => [...WEAPON_CELLS] as ModuleDef['allowedCells']

// =====================================================================
//  РАСШИРЕНИЯ КОРПУСА
// =====================================================================
const EXPANSIONS: ModuleDef[] = [
  // Длина
  D({ id: 'exp-length-1', name: 'Длина I', category: 'expansion', expansionType: 'length', level: 1, width: 0, height: 0, cells: 0, weight: 0, price: 8000, cellsAdded: 4, weaponLimitMod: 2, hpModifier: 40, acModifier: 0, maxLoadModifier: 6, speedModifier: 0, rarity: 'common', description: 'Удлиняет корпус, добавляя палубные клетки и место под орудия.' }),
  D({ id: 'exp-length-2', name: 'Длина II', category: 'expansion', expansionType: 'length', level: 2, width: 0, height: 0, cells: 0, weight: 0, price: 18000, cellsAdded: 6, weaponLimitMod: 3, hpModifier: 60, acModifier: 0, maxLoadModifier: 8, speedModifier: 5, rarity: 'common' }),
  D({ id: 'exp-length-3', name: 'Длина III', category: 'expansion', expansionType: 'length', level: 3, width: 0, height: 0, cells: 0, weight: 0, price: 40000, cellsAdded: 8, weaponLimitMod: 4, hpModifier: 90, acModifier: 0, maxLoadModifier: 10, speedModifier: 0, rarity: 'uncommon' }),
  D({ id: 'exp-length-4', name: 'Длина IV', category: 'expansion', expansionType: 'length', level: 4, width: 0, height: 0, cells: 0, weight: 0, price: 85000, cellsAdded: 10, weaponLimitMod: 5, hpModifier: 120, acModifier: 1, maxLoadModifier: 14, speedModifier: 5, rarity: 'rare' }),
  D({ id: 'exp-length-5', name: 'Длина V', category: 'expansion', expansionType: 'length', level: 5, width: 0, height: 0, cells: 0, weight: 0, price: 160000, cellsAdded: 12, weaponLimitMod: 6, hpModifier: 160, acModifier: 1, maxLoadModifier: 18, speedModifier: 0, rarity: 'very_rare' }),
  // Ширина
  D({ id: 'exp-width-1', name: 'Ширина I', category: 'expansion', expansionType: 'width', level: 1, width: 0, height: 0, cells: 0, weight: 0, price: 10000, cellsAdded: 3, weaponLimitMod: 1, heavyWeaponLimitMod: 0, superHeavyWeaponLimitMod: 0, hpModifier: 60, acModifier: 1, maxLoadModifier: 10, speedModifier: 0, rarity: 'common', description: 'Расширяет корпус по бортам, увеличивая нагрузку и тяжёлые орудия.' }),
  D({ id: 'exp-width-2', name: 'Ширина II', category: 'expansion', expansionType: 'width', level: 2, width: 0, height: 0, cells: 0, weight: 0, price: 24000, cellsAdded: 5, weaponLimitMod: 2, heavyWeaponLimitMod: 1, superHeavyWeaponLimitMod: 0, hpModifier: 100, acModifier: 1, maxLoadModifier: 16, speedModifier: 0, rarity: 'common' }),
  D({ id: 'exp-width-3', name: 'Ширина III', category: 'expansion', expansionType: 'width', level: 3, width: 0, height: 0, cells: 0, weight: 0, price: 55000, cellsAdded: 7, weaponLimitMod: 3, heavyWeaponLimitMod: 3, superHeavyWeaponLimitMod: 0, hpModifier: 150, acModifier: 2, maxLoadModifier: 24, speedModifier: -5, rarity: 'uncommon' }),
  D({ id: 'exp-width-4', name: 'Ширина IV', category: 'expansion', expansionType: 'width', level: 4, width: 0, height: 0, cells: 0, weight: 0, price: 110000, cellsAdded: 9, weaponLimitMod: 4, heavyWeaponLimitMod: 5, superHeavyWeaponLimitMod: 1, hpModifier: 220, acModifier: 2, maxLoadModifier: 36, speedModifier: -5, rarity: 'rare' }),
  D({ id: 'exp-width-5', name: 'Ширина V', category: 'expansion', expansionType: 'width', level: 5, width: 0, height: 0, cells: 0, weight: 0, price: 220000, cellsAdded: 11, weaponLimitMod: 5, heavyWeaponLimitMod: 9, superHeavyWeaponLimitMod: 2, hpModifier: 320, acModifier: 3, maxLoadModifier: 50, speedModifier: -10, rarity: 'very_rare' }),
  // Этажность
  D({ id: 'exp-height-1', name: 'Этажность I', category: 'expansion', expansionType: 'height', level: 1, width: 0, height: 0, cells: 0, weight: 0, price: 7000, internalCellsAdded: 3, weaponLimitMod: 0, hpModifier: 25, acModifier: 0, maxLoadModifier: 4, speedModifier: 0, rarity: 'common', description: 'Добавляет нижнюю палубу с внутренними отсеками.' }),
  D({ id: 'exp-height-2', name: 'Этажность II', category: 'expansion', expansionType: 'height', level: 2, width: 0, height: 0, cells: 0, weight: 0, price: 18000, internalCellsAdded: 5, weaponLimitMod: 0, hpModifier: 45, acModifier: 0, maxLoadModifier: 6, speedModifier: 0, rarity: 'common' }),
  D({ id: 'exp-height-3', name: 'Этажность III', category: 'expansion', expansionType: 'height', level: 3, width: 0, height: 0, cells: 0, weight: 0, price: 45000, internalCellsAdded: 7, weaponLimitMod: 1, hpModifier: 70, acModifier: 0, maxLoadModifier: 8, speedModifier: -5, rarity: 'uncommon' }),
  D({ id: 'exp-height-4', name: 'Этажность IV', category: 'expansion', expansionType: 'height', level: 4, width: 0, height: 0, cells: 0, weight: 0, price: 95000, internalCellsAdded: 9, weaponLimitMod: 1, hpModifier: 100, acModifier: 1, maxLoadModifier: 10, speedModifier: -5, rarity: 'rare' }),
  D({ id: 'exp-height-5', name: 'Этажность V', category: 'expansion', expansionType: 'height', level: 5, width: 0, height: 0, cells: 0, weight: 0, price: 190000, internalCellsAdded: 12, weaponLimitMod: 2, hpModifier: 140, acModifier: 1, maxLoadModifier: 12, speedModifier: -10, rarity: 'very_rare' }),
]

// =====================================================================
//  ОРУДИЯ
// =====================================================================
const W_LIGHT: ModuleDef[] = [
  D({ id: 'w-ballista', name: 'Обычная баллиста', category: 'weapon', weaponSize: 'light', subtype: 'standard', weight: 1, price: 1200, installCost: 500, damage: '3к10 колющего', range: '120/480', energyCost: 0, allowedCells: wc(), allowMultiple: true, rarity: 'common', description: 'Простое и надёжное орудие для стрельбы по малым кораблям, чудовищам и летающим целям.' }),
  D({ id: 'w-falconet', name: 'Фальконет', category: 'weapon', weaponSize: 'light', subtype: 'standard', weight: 1, price: 1800, installCost: 500, damage: '3к10 дробящего', range: '300/1200', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-swivel', name: 'Поворотная пушка', category: 'weapon', weaponSize: 'light', subtype: 'standard', weight: 1, price: 1500, installCost: 500, damage: '3к8 дробящего или 4к6 картечью', range: '100/400', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-harpoon', name: 'Гарпунный метатель', category: 'weapon', weaponSize: 'light', subtype: 'control', weight: 1, price: 2500, installCost: 500, damage: '2к10 колющего', range: '150/600', energyCost: 0, effect: 'Может зацепить цель.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-grapple-bow', name: 'Абордажный крюк-стреломёт', category: 'weapon', weaponSize: 'light', subtype: 'boarding', weight: 1, price: 1500, installCost: 500, damage: '1к10 колющего', range: '60/240', energyCost: 0, effect: 'Цепляет цель и помогает начать абордаж.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-netcaster', name: 'Сеткомёт', category: 'weapon', weaponSize: 'light', subtype: 'control', weight: 1, price: 1200, installCost: 500, damage: '1к6 дробящего', range: '80/320', energyCost: 0, effect: 'Ограничивает движение существ и малых целей.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-rune-ballista', name: 'Рунная баллиста', category: 'weapon', weaponSize: 'light', subtype: 'magic', weight: 1, price: 8000, installCost: 1500, damage: '3к10 колющего + 1к6 силового', range: '300/1200', energyCost: 1, requirements: ['Генератор'], effect: 'Болт считается магическим.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
]

const W_MEDIUM: ModuleDef[] = [
  D({ id: 'w-rapid-ballista', name: 'Скорострельная баллиста', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 5500, installCost: 1500, damage: '2к10×2 колющего', range: '100/400', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-ship-cannon', name: 'Корабельная пушка', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 7500, installCost: 1500, damage: '6к10 дробящего', range: '600/2400', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-short-cannon', name: 'Короткая абордажная пушка', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 1500, damage: '4к10 дробящего или 6к6 картечью', range: '150/600', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-mortar', name: 'Мортира', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 6500, installCost: 1500, damage: '5к8 дробящего', range: '300/1500', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-catapult', name: 'Катапульта', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 4500, installCost: 1500, damage: '4к10 дробящего', range: '150/600', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-chain-cannon', name: 'Цепная пушка', category: 'weapon', weaponSize: 'medium', subtype: 'standard', width: 1, height: 2, rotatable: true, weight: 2, price: 8000, installCost: 1500, damage: '4к10 дробящего', range: '300/1200', energyCost: 0, effect: 'Особенно эффективна против парусов, мачт и внешних движителей.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-grapeshot', name: 'Картечница', category: 'weapon', weaponSize: 'medium', subtype: 'anti_personnel', width: 1, height: 2, rotatable: true, weight: 2, price: 6500, installCost: 1500, damage: '6к6 колющего', range: 'конус 60', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-heavy-harpoon', name: 'Тяжёлый гарпунный метатель', category: 'weapon', weaponSize: 'medium', subtype: 'control', width: 1, height: 2, rotatable: true, weight: 2, price: 7500, installCost: 1500, damage: '4к10 колющего', range: '200/800', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-chainthrower', name: 'Цепемёт', category: 'weapon', weaponSize: 'medium', subtype: 'control', width: 1, height: 2, rotatable: true, weight: 2, price: 5500, installCost: 1500, damage: '3к10 дробящего', range: '120/480', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-anchor-thrower', name: 'Якорный метатель', category: 'weapon', weaponSize: 'medium', subtype: 'control', width: 1, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 1500, damage: '3к10 колющего', range: '100/400', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-fire-mortar', name: 'Огненная мортира', category: 'weapon', weaponSize: 'medium', subtype: 'deck_attack', width: 1, height: 2, rotatable: true, weight: 2, price: 8500, installCost: 1500, damage: '4к8 огнём', range: '200/800', energyCost: 0, effect: 'Поджигает область.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-smoke-mortar', name: 'Дымовая мортира', category: 'weapon', weaponSize: 'medium', subtype: 'support', width: 1, height: 2, rotatable: true, weight: 2, price: 5500, installCost: 1500, damage: 'нет', range: '300/1200', energyCost: 0, effect: 'Создаёт дымовую завесу.', allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-shrapnel-mortar', name: 'Шрапнельная мортира', category: 'weapon', weaponSize: 'medium', subtype: 'anti_personnel', width: 1, height: 2, rotatable: true, weight: 2, price: 7500, installCost: 1500, damage: '6к6 колющего по области', range: '250/1000', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-thunder-cannon', name: 'Громовая пушка', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 14000, installCost: 2500, damage: '5к8 громом', range: '200/800', energyCost: 2, requirements: ['Генератор'], effect: 'Может оттолкнуть цель или нарушить работу внешних систем.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-dragon-maw', name: 'Драконья пасть', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 16000, installCost: 2500, damage: '6к6 огнём', range: 'конус 60', energyCost: 2, requirements: ['Генератор'], effect: 'Поджигает палубу, паруса и открытые деревянные конструкции.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-ice-mortar', name: 'Ледяная мортира', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 15000, installCost: 2500, damage: '5к8 холодом', range: '300/1200', energyCost: 2, requirements: ['Генератор'], effect: 'Может снижать скорость цели.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-acid-thrower', name: 'Кислотный метатель', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 13500, installCost: 2500, damage: '4к8 кислотой', range: '120/480', energyCost: 2, requirements: ['Генератор'], allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-siren-song', name: 'Песня сирены', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 18000, installCost: 2500, damage: '4к6 психического', range: '300', energyCost: 2, requirements: ['Генератор'], effect: 'Мешает управлению, концентрации и координации.', allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-mist-gate', name: 'Туманные врата', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 35000, installCost: 4000, damage: 'нет', range: '60–500', energyCost: 4, requirements: ['Генератор'], effect: 'Открывает короткий портал.', allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-wave-thrower', name: 'Волномёт', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 14500, installCost: 2500, damage: '5к6 дробящего', range: 'линия 120', energyCost: 2, requirements: ['Генератор'], effect: 'Толкает существ, тушит огонь и сбивает абордажников.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-shadow-spewer', name: 'Теневой извергатель', category: 'weapon', weaponSize: 'medium', subtype: 'magic', width: 1, height: 2, rotatable: true, weight: 2, price: 22000, installCost: 3000, damage: '5к8 некротического или психического', range: '240/960', energyCost: 3, requirements: ['Генератор'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-deep-chain', name: 'Цепь глубин', category: 'weapon', weaponSize: 'medium', subtype: 'magic_control', width: 1, height: 2, rotatable: true, weight: 2, price: 18000, installCost: 2500, damage: '4к10 колющего + 1к8 холодом', range: '200/800', energyCost: 2, requirements: ['Генератор'], effect: 'Зацепленная цель хуже ныряет, улетает или телепортируется.', allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-light-mortar', name: 'Световая мортира', category: 'weapon', weaponSize: 'medium', subtype: 'magic_support', width: 1, height: 2, rotatable: true, weight: 2, price: 9000, installCost: 2000, damage: '2к8 излучением', range: '300/1200', energyCost: 1, requirements: ['Генератор'], effect: 'Освещает область и раскрывает туман, невидимость и иллюзии.', allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-sleep-mortar', name: 'Сонная мортира', category: 'weapon', weaponSize: 'medium', subtype: 'magic_control', width: 1, height: 2, rotatable: true, weight: 2, price: 12000, installCost: 2500, damage: 'нет', range: '200/800', energyCost: 2, requirements: ['Генератор'], effect: 'Воздействует на существ в области.', allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
]

const W_HEAVY: ModuleDef[] = [
  D({ id: 'w-heavy-ballista', name: 'Тяжёлая баллиста', category: 'weapon', weaponSize: 'heavy', subtype: 'standard', width: 1, height: 3, rotatable: true, weight: 3, price: 6500, installCost: 4000, damage: '5к10 колющего', range: '200/800', energyCost: 0, allowedCells: wc(), allowMultiple: true }),
  D({ id: 'w-long-cannon', name: 'Длинная пушка', category: 'weapon', weaponSize: 'heavy', subtype: 'standard', width: 1, height: 3, rotatable: true, weight: 3, price: 14000, installCost: 4000, damage: '7к10 дробящего', range: '1000/4000', energyCost: 0, allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-heavy-mortar', name: 'Тяжёлая мортира', category: 'weapon', weaponSize: 'heavy', subtype: 'standard', width: 1, height: 3, rotatable: true, weight: 3, price: 15000, installCost: 4000, damage: '8к8 дробящего', range: '500/2000', energyCost: 0, allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-trebuchet', name: 'Требушет', category: 'weapon', weaponSize: 'heavy', subtype: 'standard', width: 1, height: 3, rotatable: true, weight: 3, price: 13000, installCost: 4000, damage: '8к10 дробящего', range: '300/1200', energyCost: 0, allowedCells: wc(), allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'w-heavy-thunder', name: 'Тяжёлая громовая пушка', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 35000, installCost: 6000, damage: '8к8 громом', range: '300/1200', energyCost: 4, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-heavy-dragon', name: 'Тяжёлая драконья пасть', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 38000, installCost: 6000, damage: '9к6 огнём', range: 'конус 90', energyCost: 4, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-sunbeam', name: 'Пушка солнечного луча', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 42000, installCost: 6000, damage: '7к8 излучением', range: '600/2400', energyCost: 3, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-magnetic', name: 'Магнитная пушка', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 48000, installCost: 7000, damage: '8к10 дробящего или колющего', range: '800/3200', energyCost: 4, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-rune-breaker', name: 'Разрыватель рун', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 50000, installCost: 7000, damage: '6к8 силового', range: '400/1600', energyCost: 4, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'rare' }),
  D({ id: 'w-siege-emitter', name: 'Осадный излучатель', category: 'weapon', weaponSize: 'heavy', subtype: 'magic', width: 1, height: 3, rotatable: true, weight: 3, price: 65000, installCost: 8000, damage: '9к8 силового', range: '700/2800', energyCost: 4, requirements: ['Генератор III или выше'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
]

const W_SUPER: ModuleDef[] = [
  D({ id: 'w-star-spike', name: 'Звёздный шип', category: 'weapon', weaponSize: 'superHeavy', subtype: 'magic', width: 2, height: 2, rotatable: true, weight: 5, price: 120000, installCost: 12000, hpModifier: -20, acModifier: 0, damage: '10к10 силового', range: '1000/4000', energyCost: 6, requirements: ['Генератор IV или выше', 'Ширина IV'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'w-abyss-cannon', name: 'Пушка бездны', category: 'weapon', weaponSize: 'superHeavy', subtype: 'magic', width: 2, height: 2, rotatable: true, weight: 5, price: 110000, installCost: 12000, hpModifier: -20, damage: '8к10 силового или некротического', range: '500/2000', energyCost: 6, requirements: ['Генератор IV или выше', 'Ширина IV'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'w-gravity-cannon', name: 'Гравитационная пушка', category: 'weapon', weaponSize: 'superHeavy', subtype: 'magic', width: 2, height: 2, rotatable: true, weight: 5, price: 100000, installCost: 12000, hpModifier: -20, damage: '7к10 силового', range: '600/2400', energyCost: 5, requirements: ['Генератор IV или выше', 'Ширина IV'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'w-rift-mortar', name: 'Разломная мортира', category: 'weapon', weaponSize: 'superHeavy', subtype: 'magic', width: 2, height: 2, rotatable: true, weight: 5, price: 105000, installCost: 12000, hpModifier: -20, damage: '9к8 силового по области', range: '400/1600', energyCost: 5, requirements: ['Генератор IV или выше', 'Ширина IV'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'w-leviathan-heart', name: 'Сердце левиафана', category: 'weapon', weaponSize: 'superHeavy', subtype: 'magic', width: 2, height: 3, rotatable: true, weight: 6, price: 150000, installCost: 15000, hpModifier: -30, damage: '8к8 молнией + 4к8 дробящего', range: '300/1200', energyCost: 6, requirements: ['Генератор IV или выше', 'Ширина IV'], allowedCells: wc(), allowMultiple: true, rarity: 'very_rare' }),
]

// =====================================================================
//  СООРУЖЕНИЯ И АПГРЕЙДЫ
// =====================================================================
const COMMAND: ModuleDef[] = [
  D({ id: 'cmd-battle-console', name: 'Центральный боевой пульт', category: 'command', width: 1, height: 2, rotatable: true, weight: 1, price: 7500, installCost: 1500, hpModifier: 0, acModifier: 0, allowedCells: ['Центр', 'Внутренний отсек'], effect: 'Позволяет использовать залпы и подключать орудия к общей системе управления.', allowMultiple: false, rarity: 'rare' }),
]

const GENERATORS: ModuleDef[] = [
  D({ id: 'gen-spark-1', name: 'Искровой генератор I', category: 'generator', weight: 1, price: 3000, installCost: 1000, energyGeneration: 2, energyStorage: 6, generatorLevel: 1, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'common' }),
  D({ id: 'gen-rune-2', name: 'Рунный котёл II', category: 'generator', width: 1, height: 2, rotatable: true, weight: 2, price: 8000, installCost: 2000, energyGeneration: 4, energyStorage: 12, generatorLevel: 2, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'gen-elemental-3', name: 'Сердце элементаля III', category: 'generator', width: 1, height: 3, rotatable: true, weight: 3, price: 18000, installCost: 4000, energyGeneration: 6, energyStorage: 18, generatorLevel: 3, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'gen-dragon-4', name: 'Драконье ядро IV', category: 'generator', width: 2, height: 2, rotatable: true, weight: 4, price: 40000, installCost: 8000, energyGeneration: 10, energyStorage: 30, generatorLevel: 4, allowedCells: ['Центр', 'Внутренний отсек', 'Киль'], allowMultiple: false, rarity: 'very_rare' }),
  D({ id: 'gen-star-5', name: 'Звёздный реактор V', category: 'generator', width: 2, height: 3, rotatable: true, weight: 6, price: 100000, installCost: 15000, energyGeneration: 16, energyStorage: 50, generatorLevel: 5, allowedCells: ['Центр', 'Внутренний отсек', 'Киль'], allowMultiple: false, rarity: 'very_rare' }),
]

const ENERGY: ModuleDef[] = [
  D({ id: 'en-battery-small', name: 'Малая кристальная батарея', category: 'energy', weight: 1, price: 1500, installCost: 500, energyStorage: 5, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'en-battery-medium', name: 'Средняя кристальная батарея', category: 'energy', weight: 1, price: 4000, installCost: 1000, energyStorage: 12, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'en-battery-large', name: 'Большая кристальная батарея', category: 'energy', width: 1, height: 2, rotatable: true, weight: 2, price: 10000, installCost: 2000, energyStorage: 25, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'en-astral-accum', name: 'Астральный аккумулятор', category: 'energy', width: 1, height: 3, rotatable: true, weight: 3, price: 30000, installCost: 5000, energyStorage: 60, allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'en-stabilizer', name: 'Кристальный стабилизатор', category: 'energy', weight: 1, price: 5000, installCost: 1000, effect: 'Снижает риск аварии генератора.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'en-dump', name: 'Аварийный сброс энергии', category: 'energy', weight: 1, price: 4000, installCost: 1000, effect: 'Позволяет сбросить лишнюю МЭ.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'en-mithril-conduits', name: 'Мифриловые мана-проводники', category: 'energy', width: 1, height: 2, rotatable: true, weight: 1, price: 12000, installCost: 3000, effect: 'Один раз за раунд уменьшает расход одной магической системы на 1 МЭ.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'en-reserve-loop', name: 'Резервный контур', category: 'energy', weight: 1, price: 7000, installCost: 1500, effect: 'Одна малая система может работать при сбое генератора.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'en-sacrifice-loop', name: 'Жертвенный контур', category: 'energy', weight: 1, price: 3000, installCost: 1000, effect: 'Позволяет получить МЭ ценой ХП корабля.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'en-gen-isolation', name: 'Изоляция генераторной', category: 'energy', weight: 1, price: 4000, installCost: 1000, hpModifier: 20, effect: 'Уменьшает урон кораблю при аварии генератора.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
]

const WEAPON_SUPPORT: ModuleDef[] = [
  D({ id: 'ws-autowinch', name: 'Самозарядные лебёдки', category: 'weapon_support', width: 1, height: 2, rotatable: true, weight: 2, price: 4000, installCost: 1500, effect: 'Лёгкие и средние орудия можно перезаряжать бонусным действием.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'ws-feeder', name: 'Артиллерийский податчик', category: 'weapon_support', width: 1, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 2000, effect: 'Снаряды автоматически подаются к подключённым орудиям.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'ws-volley', name: 'Залповый механизм', category: 'weapon_support', width: 1, height: 2, rotatable: true, weight: 2, price: 8000, installCost: 2000, effect: 'Позволяет использовать бортовой залп.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'ws-rune-sight', name: 'Рунный прицел', category: 'weapon_support', weight: 1, price: 3000, installCost: 1000, effect: 'Улучшает точность одного орудия.', allowedCells: ['Нос', 'Корма', 'Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'ws-big-rune-sight', name: 'Большой рунный прицел', category: 'weapon_support', width: 1, height: 2, rotatable: true, weight: 1, price: 8000, installCost: 2000, energyCost: 1, effect: 'Улучшает точность всех орудий одного борта.', allowedCells: ['Левый борт', 'Правый борт', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'ws-cooling', name: 'Охлаждающий контур орудий', category: 'weapon_support', weight: 1, price: 5000, installCost: 1500, energyCost: 1, effect: 'Помогает снимать перегрев.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'ws-recoil', name: 'Гаситель отдачи', category: 'weapon_support', weight: 1, price: 3500, installCost: 1000, hpModifier: 20, effect: 'Снижает риск повреждения корпуса от тяжёлых выстрелов.', allowedCells: ['Нос', 'Корма', 'Левый борт', 'Правый борт', 'Киль'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'ws-mag-rails', name: 'Магнитные рельсы подачи', category: 'weapon_support', width: 1, height: 2, rotatable: true, weight: 2, price: 9000, installCost: 2500, energyCost: 1, effect: 'Ускоряют подачу тяжёлых снарядов.', allowedCells: ['Центр', 'Внутренний отсек', 'Киль'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'ws-turn-platforms', name: 'Поворотные платформы орудий', category: 'weapon_support', weight: 1, price: 2000, installCost: 1000, effect: 'Увеличивают сектор стрельбы орудий.', allowedCells: ['Нос', 'Корма', 'Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'ws-target-lock', name: 'Система фиксации цели', category: 'weapon_support', weight: 1, price: 6000, installCost: 1500, energyCost: 1, effect: 'Следующий выстрел получает бонус к атаке.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'rare' }),
]

const MAGAZINES: ModuleDef[] = [
  D({ id: 'st-ammo-magazine', name: 'Изолированный погреб боеприпасов', category: 'storage', weight: 1, price: 2500, installCost: 1000, hpModifier: 10, ammoCapacity: 40, effect: 'До 40 обычных снарядов. Снижает риск пожара и взрыва.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-arcane-magazine', name: 'Арканный погреб снарядов', category: 'storage', width: 1, height: 2, rotatable: true, weight: 2, price: 7500, installCost: 2000, hpModifier: 10, magicAmmoCapacity: 25, effect: 'До 25 магических снарядов. Стабилизирует магические заряды.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'st-powder-magazine', name: 'Защищённый пороховой погреб', category: 'storage', weight: 1, price: 4000, installCost: 1500, hpModifier: 10, powderCapacity: 20, effect: 'До 20 пороховых зарядов. Снижает риск детонации.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'st-cold-magazine', name: 'Глубинный холодный погреб', category: 'storage', weight: 1, price: 4500, installCost: 1500, effect: 'До 20 нестабильных алхимических снарядов.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
]

const ANCHORS: ModuleDef[] = [
  D({ id: 'an-auto', name: 'Автоякорный механизм', category: 'anchor', weight: 1, price: 2500, installCost: 1000, effect: 'Позволяет автоматически сбрасывать якорь.', allowedCells: ['Нос', 'Корма', 'Киль'], allowMultiple: false, rarity: 'common' }),
  D({ id: 'an-magic-lift', name: 'Магический подъёмник якоря', category: 'anchor', weight: 1, price: 4000, installCost: 1500, energyCost: 1, effect: 'Поднимает якорь магией.', allowedCells: ['Нос', 'Корма', 'Киль'], allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'an-rune-node', name: 'Рунно-якорный узел', category: 'anchor', width: 1, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 2000, energyCost: 1, effect: 'Автоматический сброс и магический подъём якоря.', allowedCells: ['Нос', 'Корма', 'Киль'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'an-gravity', name: 'Гравитационный якорь', category: 'anchor', width: 1, height: 2, rotatable: true, weight: 3, price: 18000, installCost: 4000, energyCost: 3, hpModifier: 20, effect: 'Удерживает корабль даже в шторме или магическом потоке.', allowedCells: ['Киль'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'an-battle-grapnel', name: 'Боевой якорь-кошка', category: 'anchor', weight: 1, price: 3500, installCost: 1000, effect: 'Может цеплять дно, риф, пристань или другой корабль.', allowedCells: ['Нос', 'Корма', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
]

const DEFENSE: ModuleDef[] = [
  D({ id: 'def-shield', name: 'Магический щит-генератор', category: 'defense', width: 1, height: 2, rotatable: true, weight: 3, price: 12000, installCost: 3000, hpModifier: 30, acModifier: 1, energyCost: 2, effect: 'Даёт КД, временные ХП или снижает урон.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'def-big-shield', name: 'Большой щит-генератор', category: 'defense', width: 2, height: 2, rotatable: true, weight: 5, price: 30000, installCost: 6000, hpModifier: 60, acModifier: 2, energyCost: 4, effect: 'Мощная версия щита.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'def-hull-reinforce', name: 'Модуль укрепления корпуса', category: 'defense', width: 1, height: 2, rotatable: true, weight: 3, price: 10000, installCost: 3000, hpModifier: 80, acModifier: 1, effect: 'Временно снижает входящий урон.', allowedCells: ['Центр', 'Внутренний отсек', 'Киль'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'def-bulkheads', name: 'Рунные переборки', category: 'defense', weight: 1, price: 4000, installCost: 1000, hpModifier: 20, acModifier: 0, effect: 'Замедляют огонь, воду, дым и аварии.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'def-pd-turret', name: 'Противоснарядная турель', category: 'defense', weight: 1, price: 9000, installCost: 2000, energyCost: 1, effect: 'Пытается сбить входящий снаряд.', allowedCells: ['Палуба', 'Нос', 'Корма', 'Левый борт', 'Правый борт'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'def-antimagic', name: 'Антимагический громоотвод', category: 'defense', width: 1, height: 2, rotatable: true, weight: 2, price: 20000, installCost: 4000, acModifier: 1, energyCost: 3, effect: 'Ослабляет магический выстрел или заклинание.', allowedCells: ['Палуба', 'Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'def-mist', name: 'Туманный контур', category: 'defense', weight: 1, price: 6000, installCost: 1500, energyCost: 2, effect: 'Создаёт туман вокруг корабля.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'def-fireproof', name: 'Огнеупорные руны', category: 'defense', weight: 1, price: 6000, installCost: 1500, hpModifier: 20, effect: 'Снижают урон от огня.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'def-grounding', name: 'Грозовой разрядник', category: 'defense', weight: 1, price: 6000, installCost: 1500, hpModifier: 20, effect: 'Снижает урон молнией и громом.', allowedCells: ['Палуба', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'def-ice-insul', name: 'Ледяная изоляция', category: 'defense', weight: 1, price: 5000, installCost: 1000, hpModifier: 20, effect: 'Снижает урон холодом.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'def-acid-drains', name: 'Кислотные стоки', category: 'defense', weight: 1, price: 5000, installCost: 1000, hpModifier: 20, effect: 'Снижают урон кислотой.', allowedCells: ['Центр', 'Внутренний отсек', 'Киль'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'def-holy-beacon', name: 'Священный маяк защиты', category: 'defense', weight: 1, price: 7000, installCost: 1500, energyCost: 2, effect: 'Ослабляет нежить, тени и проклятые эффекты.', allowedCells: ['Палуба', 'Центр'], allowMultiple: true, rarity: 'rare' }),
]

const MOVEMENT: ModuleDef[] = [
  D({ id: 'mv-wind-booster', name: 'Ускоритель ветра', category: 'movement', weight: 1, price: 5000, installCost: 1500, speedModifier: 5, energyCost: 1, allowedCells: ['Корма', 'Палуба'], effect: 'Увеличивает скорость корабля.', allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'mv-elemental-engine', name: 'Элементальный двигатель', category: 'movement', width: 1, height: 3, rotatable: true, weight: 3, price: 25000, installCost: 5000, speedModifier: 10, energyCost: 2, allowedCells: ['Корма', 'Киль'], effect: 'Позволяет двигаться без ветра.', allowMultiple: false, rarity: 'rare' }),
  D({ id: 'mv-storm-turbines', name: 'Штормовые турбины', category: 'movement', width: 1, height: 2, rotatable: true, weight: 2, price: 15000, installCost: 3000, speedModifier: 10, energyCost: 2, allowedCells: ['Корма', 'Палуба'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'mv-silent-run', name: 'Тихий ход', category: 'movement', weight: 1, price: 8000, installCost: 2000, speedModifier: 0, energyCost: 1, allowedCells: ['Киль', 'Корма'], effect: 'Снижает шум движения.', allowMultiple: false, rarity: 'rare' }),
  D({ id: 'mv-winged-yards', name: 'Крылатые реи', category: 'movement', width: 1, height: 3, rotatable: true, weight: 2, price: 20000, installCost: 4000, hpModifier: -20, speedModifier: 10, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'mv-levitation', name: 'Левитационные кристаллы', category: 'movement', width: 2, height: 2, rotatable: true, weight: 4, price: 45000, installCost: 8000, speedModifier: 15, energyCost: 6, allowedCells: ['Киль', 'Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'very_rare' }),
  D({ id: 'mv-ballasts', name: 'Подводные балласты', category: 'movement', width: 1, height: 3, rotatable: true, weight: 3, price: 30000, installCost: 6000, hpModifier: 40, speedModifier: 0, energyCost: 3, allowedCells: ['Киль'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'mv-water-jets', name: 'Водомётные рули', category: 'movement', width: 1, height: 2, rotatable: true, weight: 2, price: 12000, installCost: 3000, speedModifier: 5, energyCost: 1, allowedCells: ['Корма', 'Киль'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'mv-astral-keel', name: 'Астральный киль', category: 'movement', width: 1, height: 5, rotatable: true, weight: 5, price: 60000, installCost: 10000, hpModifier: 60, acModifier: 1, energyCost: 10, allowedCells: ['Киль'], allowMultiple: false, rarity: 'very_rare' }),
  D({ id: 'mv-reinforced-keel', name: 'Усиленный киль', category: 'movement', weight: 2, price: 5000, installCost: 1500, hpModifier: 70, acModifier: 0, maxLoadModifier: 8, allowedCells: ['Киль'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'mv-silent-keel', name: 'Бесшумный киль', category: 'movement', weight: 1, price: 10000, installCost: 2000, speedModifier: 0, effect: 'Снижает шум движения.', allowedCells: ['Киль'], allowMultiple: false, rarity: 'rare' }),
]

const REPAIR: ModuleDef[] = [
  D({ id: 'rp-repair-module', name: 'Ремонтный модуль', category: 'repair', width: 1, height: 2, rotatable: true, weight: 2, price: 8000, installCost: 2000, hpModifier: 20, effect: 'Позволяет чинить корпус, орудия и системы.', allowedCells: ['Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rp-magic-beam', name: 'Магический ремонтный луч', category: 'repair', width: 1, height: 2, rotatable: true, weight: 2, price: 14000, installCost: 3000, energyCost: 2, effect: 'Восстанавливает ХП корабля или чинит систему.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'rp-forge', name: 'Кузница', category: 'repair', width: 1, height: 2, rotatable: true, weight: 3, price: 6000, installCost: 2000, hpModifier: 10, effect: 'Ремонт металла, брони и орудий.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rp-rune-forge', name: 'Рунический горн', category: 'repair', width: 1, height: 2, rotatable: true, weight: 3, price: 12000, installCost: 3000, energyCost: 1, effect: 'Чинит магические орудия.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'rp-mech-arms', name: 'Палубные механические руки', category: 'repair', weight: 1, price: 6000, installCost: 1500, effect: 'Помогают с ремонтом и подачей деталей.', allowedCells: ['Палуба', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rp-backup-control', name: 'Запасной контур управления', category: 'repair', weight: 1, price: 5000, installCost: 1500, effect: 'Позволяет управлять кораблём при повреждении основного руля.', allowedCells: ['Корма', 'Центр', 'Внутренний отсек'], allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'rp-auto-pumps', name: 'Автоматические помпы', category: 'repair', weight: 1, price: 3000, installCost: 1000, hpModifier: 20, effect: 'Замедляют затопление.', allowedCells: ['Киль', 'Внутренний отсек'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'rp-fire-loop', name: 'Пожарный контур', category: 'repair', weight: 1, price: 4000, installCost: 1000, energyCost: 1, hpModifier: 10, effect: 'Помогает тушить пожар.', allowedCells: ['Центр', 'Внутренний отсек', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rp-spare-runes', name: 'Запасные рунные панели', category: 'repair', weight: 1, price: 2500, installCost: 500, effect: 'Упрощают ремонт магических сооружений.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
]

const BOARDING: ModuleDef[] = [
  D({ id: 'bo-hooks', name: 'Абордажные крюки', category: 'boarding', weight: 1, price: 500, installCost: 300, effect: 'Цепляют вражеский корабль.', allowedCells: ['Нос', 'Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'bo-autohooks', name: 'Автокрюки', category: 'boarding', weight: 1, price: 5000, installCost: 1000, effect: 'Крюки с механизмом натяжения.', allowedCells: ['Нос', 'Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'bo-bridges', name: 'Абордажные мосты', category: 'boarding', width: 1, height: 2, rotatable: true, weight: 2, price: 2500, installCost: 1000, effect: 'Создают переход между кораблями.', allowedCells: ['Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'bo-gangways', name: 'Выдвижные трапы', category: 'boarding', weight: 1, price: 1500, installCost: 500, effect: 'Быстрый переход на соседнюю палубу.', allowedCells: ['Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'bo-spiked-sides', name: 'Шипованные борта', category: 'boarding', weight: 1, price: 4000, installCost: 1000, hpModifier: 10, effect: 'Усложняют подъём на борт.', allowedCells: ['Левый борт', 'Правый борт'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'bo-deck-traps', name: 'Палубные ловушки', category: 'boarding', weight: 1, price: 3500, installCost: 1000, effect: 'Сетки, шипы, масло, скрытые люки.', allowedCells: ['Палуба'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'bo-ward-runes', name: 'Руны запрета', category: 'boarding', weight: 1, price: 8000, installCost: 1500, energyCost: 1, effect: 'Мешают телепортации и призыву на палубу.', allowedCells: ['Палуба', 'Центр', 'Внутренний отсек'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'bo-flyer-net', name: 'Сетка против летающих целей', category: 'boarding', weight: 1, price: 3000, installCost: 1000, effect: 'Помогает ловить летающих врагов.', allowedCells: ['Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'bo-harpoon-winch', name: 'Гарпунная лебёдка', category: 'boarding', weight: 1, price: 2000, installCost: 500, effect: 'Подтягивает зацепленную цель.', allowedCells: ['Нос', 'Левый борт', 'Правый борт', 'Палуба'], allowMultiple: true, rarity: 'common' }),
]

const STORAGE: ModuleDef[] = [
  D({ id: 'st-hold-small', name: 'Малый трюм', category: 'storage', weight: 1, price: 1000, installCost: 500, cargoCapacity: 1, effect: '1 тонна груза или 20 ящиков.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-hold-medium', name: 'Средний трюм', category: 'storage', width: 1, height: 2, rotatable: true, weight: 2, price: 2500, installCost: 1000, cargoCapacity: 2.5, effect: '2,5 тонны груза или 50 ящиков.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-hold-large', name: 'Большой трюм', category: 'storage', width: 2, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 2000, cargoCapacity: 6, effect: '6 тонн груза или 120 ящиков. Вес растёт до 6 при заполнении.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'st-hold-secret', name: 'Тайный трюм', category: 'storage', weight: 1, price: 2500, installCost: 1000, cargoCapacity: 1, effect: 'Скрытые ящики и фальшпанели.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'st-hold-pocket', name: 'Карманный трюм', category: 'storage', width: 1, height: 3, rotatable: true, weight: 3, price: 25000, installCost: 5000, cargoCapacity: 8, effect: 'Внутри больше места, чем снаружи.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'very_rare' }),
  D({ id: 'st-dry-stores', name: 'Сухие кладовые', category: 'storage', weight: 1, price: 1500, installCost: 500, foodCapacity: 20, effect: 'Еда, ткань и бумага не сыреют.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-cold-room', name: 'Холодный отсек', category: 'storage', weight: 1, price: 4000, installCost: 1000, foodCapacity: 15, effect: 'Хранение мяса, зелий и ингредиентов.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'st-arcane-vault', name: 'Арканный сейф', category: 'storage', weight: 1, price: 8000, installCost: 1000, effect: '10 малых магических предметов или 3 крупных.', allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'st-magic-ammo-store', name: 'Склад магических снарядов', category: 'storage', width: 1, height: 2, rotatable: true, weight: 2, price: 6000, installCost: 1500, magicAmmoCapacity: 20, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'st-boarding-rack', name: 'Стойка абордажного снаряжения', category: 'storage', weight: 1, price: 1500, installCost: 500, equipmentCapacity: 20, allowedCells: ['Внутренний отсек', 'Центр', 'Палуба'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-weapon-rack', name: 'Оружейная стойка', category: 'storage', weight: 1, price: 2000, installCost: 500, equipmentCapacity: 30, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-tool-cabinet', name: 'Инструментальный шкаф', category: 'storage', weight: 1, price: 1500, installCost: 500, equipmentCapacity: 10, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'st-alchemy-cabinet', name: 'Алхимический шкаф', category: 'storage', weight: 1, price: 3000, installCost: 1000, potionCapacity: 20, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
]

const ROOMS: ModuleDef[] = [
  D({ id: 'rm-captain', name: 'Каюта капитана', category: 'room', weight: 1, price: 1000, installCost: 500, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: false, rarity: 'common' }),
  D({ id: 'rm-crew', name: 'Общий кубрик', category: 'room', width: 1, height: 2, rotatable: true, weight: 1, price: 1500, installCost: 500, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'rm-kitchen', name: 'Кухня', category: 'room', weight: 1, price: 1000, installCost: 500, foodCapacity: 10, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'rm-armory', name: 'Оружейная', category: 'room', weight: 1, price: 2000, installCost: 500, equipmentCapacity: 30, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'rm-lab', name: 'Алхимическая лаборатория', category: 'room', width: 1, height: 2, rotatable: true, weight: 2, price: 5000, installCost: 1500, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rm-infirmary', name: 'Лазарет', category: 'room', width: 1, height: 2, rotatable: true, weight: 2, price: 4000, installCost: 1000, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rm-ritual', name: 'Ритуальный зал', category: 'room', width: 1, height: 3, rotatable: true, weight: 3, price: 8000, installCost: 2000, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'rare' }),
  D({ id: 'rm-portal', name: 'Портальная комната', category: 'room', width: 2, height: 2, rotatable: true, weight: 4, price: 30000, installCost: 6000, energyCost: 6, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: false, rarity: 'very_rare' }),
  D({ id: 'rm-brig', name: 'Тюрьма / карцер', category: 'room', width: 1, height: 2, rotatable: true, weight: 2, price: 2000, installCost: 1000, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'common' }),
  D({ id: 'rm-menagerie', name: 'Зверинец / стойла', category: 'room', width: 2, height: 2, rotatable: true, weight: 3, price: 5000, installCost: 1500, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
  D({ id: 'rm-treasury', name: 'Сокровищница', category: 'room', width: 1, height: 2, rotatable: true, weight: 2, price: 5000, installCost: 1500, allowedCells: ['Внутренний отсек', 'Центр'], allowMultiple: true, rarity: 'uncommon' }),
]

const HULL_UPGRADES: ModuleDef[] = [
  D({ id: 'hu-oak', name: 'Усиленный дубовый корпус', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 2, price: 2000, installCost: 1000, hpModifier: 50, acModifier: 0, allowMultiple: false, rarity: 'common', description: 'Бесклеточный корпусной апгрейд: усиливает обшивку.' }),
  D({ id: 'hu-iron-ribs', name: 'Железные рёбра', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 3, price: 5000, installCost: 2000, hpModifier: 80, acModifier: 1, allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'hu-mithril', name: 'Мифриловая обшивка', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 2, price: 15000, installCost: 4000, hpModifier: 40, acModifier: 2, allowMultiple: false, rarity: 'rare' }),
  D({ id: 'hu-leviathan', name: 'Панцирь левиафана', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 4, price: 30000, installCost: 6000, hpModifier: 120, acModifier: 1, allowMultiple: false, rarity: 'very_rare' }),
  D({ id: 'hu-stoneskin', name: 'Каменная кожа корпуса', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 6, price: 18000, installCost: 5000, hpModifier: 120, acModifier: 2, speedModifier: -5, allowMultiple: false, rarity: 'rare' }),
  D({ id: 'hu-seaelf', name: 'Гибкий корпус морских эльфов', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 1, price: 14000, installCost: 3000, hpModifier: 30, acModifier: 1, speedModifier: 5, allowMultiple: false, rarity: 'rare' }),
  D({ id: 'hu-unsinkable', name: 'Непотопляемые отсеки', category: 'hull_upgrade', width: 0, height: 0, cells: 0, weight: 3, price: 20000, installCost: 5000, hpModifier: 70, acModifier: 0, allowMultiple: false, rarity: 'rare' }),
]

const SAILS: ModuleDef[] = [
  D({ id: 'sl-silk-fast', name: 'Шёлковые быстрые паруса', category: 'sails', weight: 1, price: 1500, installCost: 500, speedModifier: 5, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'common' }),
  D({ id: 'sl-storm', name: 'Штормовые паруса', category: 'sails', weight: 1, price: 6000, installCost: 1500, speedModifier: 5, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'uncommon' }),
  D({ id: 'sl-shadow-silk', name: 'Паруса теневого шёлка', category: 'sails', weight: 1, price: 9000, installCost: 2000, speedModifier: 0, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'sl-moon', name: 'Лунные паруса', category: 'sails', weight: 1, price: 12000, installCost: 2500, speedModifier: 5, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'sl-winged', name: 'Крылатые паруса', category: 'sails', width: 1, height: 2, rotatable: true, weight: 1, price: 18000, installCost: 4000, speedModifier: 10, hpModifier: -10, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'rare' }),
  D({ id: 'sl-thunder-mast', name: 'Громовая мачта', category: 'sails', width: 1, height: 2, rotatable: true, weight: 2, price: 15000, installCost: 3000, hpModifier: 20, allowedCells: ['Палуба'], allowMultiple: false, rarity: 'rare' }),
]

export const BASE_CATALOG: ModuleDef[] = [
  ...EXPANSIONS,
  ...W_LIGHT,
  ...W_MEDIUM,
  ...W_HEAVY,
  ...W_SUPER,
  ...COMMAND,
  ...GENERATORS,
  ...ENERGY,
  ...WEAPON_SUPPORT,
  ...MAGAZINES,
  ...ANCHORS,
  ...DEFENSE,
  ...MOVEMENT,
  ...REPAIR,
  ...BOARDING,
  ...STORAGE,
  ...ROOMS,
  ...HULL_UPGRADES,
  ...SAILS,
]

export const CATEGORY_LABELS: Record<Category, string> = {
  weapon: 'Орудие',
  command: 'Командное',
  generator: 'Генератор',
  energy: 'Энергия',
  weapon_support: 'Орудийное сооружение',
  storage: 'Хранение',
  anchor: 'Якорная система',
  defense: 'Защита',
  movement: 'Двигатель / движение',
  repair: 'Ремонт',
  boarding: 'Абордаж',
  room: 'Помещение',
  hull_upgrade: 'Корпусной апгрейд',
  sails: 'Паруса и мачты',
  expansion: 'Расширение корпуса',
}

export function cloneCatalog(): ModuleDef[] {
  return BASE_CATALOG.map((m) => ({ ...m, allowedCells: [...m.allowedCells], requirements: m.requirements ? [...m.requirements] : undefined }))
}
