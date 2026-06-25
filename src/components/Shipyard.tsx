import { useStore } from '../state/store'
import { CATEGORY_LABELS } from '../data/catalog'
import { RESOURCE_LABELS } from '../data/defaults'
import { CATEGORY_COLORS, RARITY_COLORS, RARITY_LABELS } from '../ui/styles'
import { formatGold } from '../utils'
import type { CargoSaleShipyardOffer, ModuleDef, ResourceShipyardOffer, Resources } from '../types'
import ModuleArt from './ModuleArt'

const RESOURCE_ICON: Record<keyof Resources, string> = {
  gold: '◈',
  food: '🍖',
  water: '💧',
  repairMaterials: '🔧',
  ammo: '◉',
  magicAmmo: '✦',
  powder: '✹',
  cargo: '▣',
  valuables: '◆',
}

export default function Shipyard() {
  const { state, dispatch, notify } = useStore()
  const gold = state.resources.gold

  const buy = (offerId: string, def: ModuleDef) => {
    const cost = def.category === 'expansion' ? def.price : def.price + def.installCost
    if (gold < cost) {
      notify('Недостаточно золота', 'error')
      return
    }
    dispatch({ type: 'BUY_OFFER', offerId })
    notify(`Куплено: ${def.name}`, 'success')
  }

  const buyResource = (offer: ResourceShipyardOffer) => {
    if (gold < offer.price) {
      notify('Недостаточно золота', 'error')
      return
    }
    dispatch({ type: 'BUY_OFFER', offerId: offer.offerId })
    notify(`Куплено: ${RESOURCE_LABELS[offer.resourceKey]} x${offer.quantity}`, 'success')
  }

  const sellCargo = (offer: CargoSaleShipyardOffer) => {
    if (state.resources.cargo < offer.quantity) {
      notify('Недостаточно груза', 'error')
      return
    }
    dispatch({ type: 'BUY_OFFER', offerId: offer.offerId })
    notify(`Продан груз: ${offer.quantity} ед.`, 'success')
  }

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-display text-xl text-gold">⚓ Верфь Нового Мира</h2>
          <p className="text-[11px] text-slate-400">Каждый визит верфь предлагает 1–6 случайных модулей. Легендарные товары здесь не появляются.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gold">Золото: {formatGold(gold)} зм</span>
          <button className="btn btn-gold px-4 py-2 text-sm" onClick={() => dispatch({ type: 'GENERATE_SHIPYARD' })}>
            🔄 Обновить предложения
          </button>
        </div>
      </div>

      {/* Случайные предложения */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {state.shipyardOffers.length === 0 && (
          <div className="panel col-span-full p-8 text-center text-sm text-slate-400">
            Нет активных предложений. Нажмите «Обновить предложения», чтобы верфь сгенерировала товары.
          </div>
        )}
        {state.shipyardOffers.map((offer) => {
          if (offer.type === 'resource') {
            return <ResourceOfferCard key={offer.offerId} offer={offer} onBuy={() => buyResource(offer)} gold={gold} />
          }
          if (offer.type === 'cargo_sale') {
            return <CargoSaleCard key={offer.offerId} offer={offer} onSell={() => sellCargo(offer)} cargo={state.resources.cargo} />
          }
          const def = state.catalog.find((d) => d.id === offer.defId)
          if (!def) return null
          return <OfferCard key={offer.offerId} def={def} onBuy={() => buy(offer.offerId, def)} gold={gold} />
        })}
      </div>

      {/* Расширения корпуса — всегда доступны */}
      <ExpansionsSection />
    </div>
  )
}

function ResourceOfferCard({ offer, onBuy, gold }: { offer: ResourceShipyardOffer; onBuy: () => void; gold: number }) {
  const afford = gold >= offer.price
  return (
    <div className="panel flex flex-col p-3" style={{ borderTop: '3px solid #34e2a0' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-rune/60 bg-black/30 text-2xl">
          {RESOURCE_ICON[offer.resourceKey]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-slate-100">{RESOURCE_LABELS[offer.resourceKey]}</h3>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-rune">Ресурс верфи</div>
          <div className="mt-1 text-[12px] text-slate-300">Партия: {offer.quantity} ед.</div>
        </div>
      </div>
      <div className="mt-auto pt-3">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Случайный объём 1-30</span>
          <span className="font-bold text-gold">{formatGold(offer.price)} зм</span>
        </div>
        <button className={`btn w-full py-1.5 ${afford ? 'btn-gold' : ''}`} disabled={!afford} onClick={onBuy}>
          {afford ? 'Купить ресурс' : 'Недостаточно золота'}
        </button>
      </div>
    </div>
  )
}

function CargoSaleCard({ offer, onSell, cargo }: { offer: CargoSaleShipyardOffer; onSell: () => void; cargo: number }) {
  const canSell = cargo >= offer.quantity
  return (
    <div className="panel flex flex-col p-3" style={{ borderTop: '3px solid #e8c66a' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-gold/60 bg-black/30 text-2xl">
          ▣
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-slate-100">Скупка груза</h3>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gold">Продажа товара</div>
          <div className="mt-1 text-[12px] text-slate-300">Нужно: {offer.quantity} ед. груза</div>
        </div>
      </div>
      <div className="mt-auto pt-3">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">В наличии: {cargo}</span>
          <span className="font-bold text-gold">+{formatGold(offer.price)} зм</span>
        </div>
        <button className={`btn w-full py-1.5 ${canSell ? 'btn-gold' : ''}`} disabled={!canSell} onClick={onSell}>
          {canSell ? 'Продать груз' : 'Недостаточно груза'}
        </button>
      </div>
    </div>
  )
}

function OfferCard({ def, onBuy, gold }: { def: ModuleDef; onBuy: () => void; gold: number }) {
  const colors = CATEGORY_COLORS[def.category]
  const total = def.category === 'expansion' ? def.price : def.price + def.installCost
  const afford = gold >= total
  const mods = statMods(def)

  return (
    <div className="panel flex flex-col p-3" style={{ borderTop: `3px solid ${colors.border}` }}>
      <div className="flex items-start gap-2">
        <ModuleArt def={def} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight text-slate-100">{def.name}</h3>
            <span className="shrink-0 text-[9px] font-bold uppercase" style={{ color: RARITY_COLORS[def.rarity] }}>
              {RARITY_LABELS[def.rarity]}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-slate-400">
            <span>{CATEGORY_LABELS[def.category]}</span>
            <span>{def.cells === 0 ? 'апгрейд' : `${def.width}×${def.height} · ${def.cells} кл.`}</span>
            <span>вес {def.weight}</span>
            {def.rotatable && <span>⟳ поворот</span>}
          </div>
        </div>
      </div>

      {mods.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {mods.map((m, i) => (
            <span key={i} className="chip text-[9px]" style={{ color: m.color, borderColor: m.color }}>
              {m.text}
            </span>
          ))}
        </div>
      )}

      {def.damage && <div className="mt-1 text-[10px] text-red-200">Урон: {def.damage}{def.range ? ` · ${def.range}` : ''}</div>}
      {def.requirements && <div className="mt-1 text-[10px] text-amber-200">Требует: {def.requirements.join(', ')}</div>}
      {def.allowedCells.length > 0 && (
        <div className="mt-1 text-[9px] text-slate-500">Клетки: {def.allowedCells.join(', ')}</div>
      )}
      {(def.effect || def.description) && (
        <div className="mt-1 line-clamp-2 text-[10px] italic text-slate-400">{def.effect ?? def.description}</div>
      )}

      <div className="mt-auto pt-2">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            {formatGold(def.price)}
            {def.installCost ? ` + ${formatGold(def.installCost)} устан.` : ''}
          </span>
          <span className="font-bold text-gold">{formatGold(total)} зм</span>
        </div>
        <button className={`btn w-full py-1.5 ${afford ? 'btn-gold' : ''}`} disabled={!afford} onClick={onBuy}>
          {afford ? 'Купить' : 'Недостаточно золота'}
        </button>
      </div>
    </div>
  )
}

function ExpansionsSection() {
  const { state, dispatch, notify } = useStore()
  const gold = state.resources.gold
  const types: Array<{ t: 'length' | 'width' | 'height'; label: string; cur: number }> = [
    { t: 'length', label: 'Длина', cur: state.lengthLevel },
    { t: 'width', label: 'Ширина', cur: state.widthLevel },
    { t: 'height', label: 'Этажность', cur: state.heightLevel },
  ]

  const buyExp = (def: ModuleDef) => {
    if (gold < def.price) {
      notify('Недостаточно золота', 'error')
      return
    }
    dispatch({ type: 'BUY_EXPANSION', defId: def.id })
    notify(`Установлено: ${def.name}`, 'success')
  }

  return (
    <div className="panel p-4">
      <h3 className="mb-2 font-display text-lg text-gold">Расширения корпуса</h3>
      <p className="mb-3 text-[11px] text-slate-400">Расширения меняют сам корабль: добавляют клетки, ХП, лимиты и нагрузку. Доступен только следующий уровень.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {types.map(({ t, label, cur }) => {
          const next = state.catalog.find((d) => d.category === 'expansion' && d.expansionType === t && d.level === cur + 1)
          return (
            <div key={t} className="rounded border border-copperdim/50 bg-black/25 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-display text-gold">{label}</span>
                <span className="text-[11px] text-slate-400">уровень {cur} / 5</span>
              </div>
              {next ? (
                <>
                  <div className="mb-1 text-[12px] font-semibold text-slate-100">{next.name}</div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {statMods(next).map((m, i) => (
                      <span key={i} className="chip text-[9px]" style={{ color: m.color, borderColor: m.color }}>
                        {m.text}
                      </span>
                    ))}
                  </div>
                  <button className={`btn w-full py-1.5 ${gold >= next.price ? 'btn-gold' : ''}`} disabled={gold < next.price} onClick={() => buyExp(next)}>
                    {gold >= next.price ? `Купить — ${formatGold(next.price)} зм` : 'Недостаточно золота'}
                  </button>
                </>
              ) : (
                <div className="py-4 text-center text-[11px] text-rune">Максимальный уровень достигнут</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function statMods(def: ModuleDef): Array<{ text: string; color: string }> {
  const out: Array<{ text: string; color: string }> = []
  const push = (text: string, color = '#9aa7b3') => out.push({ text, color })
  if (def.hpModifier) push(`ХП ${sg(def.hpModifier)}`, def.hpModifier > 0 ? '#7fe8b0' : '#f0908c')
  if (def.acModifier) push(`КД ${sg(def.acModifier)}`, def.acModifier > 0 ? '#7fb0e8' : '#f0908c')
  if (def.speedModifier) push(`Скор ${sg(def.speedModifier)}`, def.speedModifier > 0 ? '#7fe8b0' : '#f0908c')
  if (def.maxLoadModifier) push(`Нагр ${sg(def.maxLoadModifier)}`, '#e8c66a')
  if (def.weaponLimitMod) push(`Оруд +${def.weaponLimitMod}`, '#d2483f')
  if (def.heavyWeaponLimitMod) push(`Тяж +${def.heavyWeaponLimitMod}`, '#d2483f')
  if (def.superHeavyWeaponLimitMod) push(`Сверхтяж +${def.superHeavyWeaponLimitMod}`, '#d2483f')
  if (def.energyGeneration) push(`МЭ-ген ${def.energyGeneration}`, '#5f78e0')
  if (def.energyStorage) push(`МЭ-зап ${def.energyStorage}`, '#5f78e0')
  if (def.energyCost) push(`МЭ-расх ${def.energyCost}`, '#b063d6')
  if (def.cargoCapacity) push(`груз ${def.cargoCapacity}`, '#a9803f')
  return out
}
function sg(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`
}
