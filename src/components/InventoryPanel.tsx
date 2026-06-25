import { useStore } from '../state/store'
import { useDnD, DRAG_MIME } from './dnd'
import { CATEGORY_LABELS } from '../data/catalog'
import { CATEGORY_COLORS, RARITY_COLORS, RARITY_LABELS } from '../ui/styles'
import { SectionTitle } from './common'
import type { ModuleDef, ModuleInstance } from '../types'
import ModuleArt from './ModuleArt'

export default function InventoryPanel() {
  const { state, defMap } = useStore()

  const inventory = state.instances.filter((i) => !i.placed)
  const upgrades = state.instances.filter((i) => {
    const def = defMap.get(i.defId)
    return i.placed && def && def.cells === 0
  })

  return (
    <div className="panel flex min-h-0 flex-col">
      <SectionTitle right={<span className="text-[10px] text-slate-400">{inventory.length} шт.</span>}>
        Инвентарь
      </SectionTitle>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-auto p-2">
        {inventory.length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-slate-500">
            Инвентарь пуст. Откройте «Верфь» и купите модули.
          </p>
        )}
        {inventory.map((inst) => {
          const def = defMap.get(inst.defId)
          if (!def) return null
          return <InventoryItem key={inst.instanceId} inst={inst} def={def} />
        })}

        {upgrades.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 px-1 text-[10px] uppercase tracking-wide text-copperlight">Установленные корпусные апгрейды</div>
            {upgrades.map((inst) => {
              const def = defMap.get(inst.defId)!
              return <UpgradeItem key={inst.instanceId} inst={inst} def={def} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function InventoryItem({ inst, def }: { inst: ModuleInstance; def: ModuleDef }) {
  const { state, dispatch } = useStore()
  const dnd = useDnD()
  const colors = CATEGORY_COLORS[def.category]
  const selected = state.selectedInstanceId === inst.instanceId
  const isUpgrade = def.cells === 0
  const selectForPlacement = () => {
    dispatch({ type: 'SELECT_INSTANCE', instanceId: inst.instanceId })
    if (!isUpgrade && def.category === 'weapon') {
      dispatch({ type: 'SET_UI', partial: { weaponRelocationMode: true } })
      dnd.startDrag(inst.instanceId)
    }
  }

  return (
    <div
      draggable={!isUpgrade}
      onDragStart={(e) => {
        if (isUpgrade) return
        e.dataTransfer.setData(DRAG_MIME, inst.instanceId)
        e.dataTransfer.setData('text/plain', inst.instanceId)
        e.dataTransfer.effectAllowed = 'move'
        dnd.startDrag(inst.instanceId)
        dispatch({ type: 'SELECT_INSTANCE', instanceId: inst.instanceId })
      }}
      onDragEnd={() => dnd.endDrag()}
      onClick={selectForPlacement}
      className={`rounded border bg-black/30 p-1.5 ${isUpgrade ? '' : 'cursor-grab active:cursor-grabbing'}`}
      style={{ borderColor: selected ? '#e8c66a' : 'rgba(176,122,60,.35)', borderLeft: `3px solid ${colors.border}` }}
    >
      <div className="flex items-start gap-2">
        <ModuleArt def={def} compact />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[12px] font-semibold leading-tight text-slate-100">{def.name}</span>
            <span className="shrink-0 text-[9px]" style={{ color: RARITY_COLORS[def.rarity] }}>
              {RARITY_LABELS[def.rarity]}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
            <span>{CATEGORY_LABELS[def.category]}</span>
            <span>{isUpgrade ? '0 кл.' : `${def.width}×${def.height}${inst.rotated ? ' ⟳' : ''}`}</span>
            <span>вес {def.weight}</span>
          </div>
        </div>
      </div>
      {(def.effect || def.description) && (
        <div className="mt-0.5 line-clamp-2 text-[10px] italic text-slate-500">{def.effect ?? def.description}</div>
      )}
      <div className="mt-1 flex flex-wrap gap-1">
        {isUpgrade ? (
          <button className="btn btn-rune px-2 py-0.5 text-[10px]" onClick={() => dispatch({ type: 'INSTALL_UPGRADE', instanceId: inst.instanceId })}>
            Установить
          </button>
        ) : (
          <>
            <button
              className="btn px-2 py-0.5 text-[10px]"
              onClick={(e) => {
                e.stopPropagation()
                selectForPlacement()
              }}
            >
              Выбрать
            </button>
            {def.rotatable && (
              <button className="btn px-2 py-0.5 text-[10px]" onClick={() => dispatch({ type: 'ROTATE_INSTANCE', instanceId: inst.instanceId })}>
                ⟳ Повернуть
              </button>
            )}
          </>
        )}
        {state.ui.masterMode && (
          <button className="btn btn-danger px-2 py-0.5 text-[10px]" onClick={() => dispatch({ type: 'DELETE_INSTANCE', instanceId: inst.instanceId })}>
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}

function UpgradeItem({ inst, def }: { inst: ModuleInstance; def: ModuleDef }) {
  const { dispatch } = useStore()
  const colors = CATEGORY_COLORS[def.category]
  const mods: string[] = []
  if (def.hpModifier) mods.push(`ХП ${def.hpModifier > 0 ? '+' : ''}${def.hpModifier}`)
  if (def.acModifier) mods.push(`КД ${def.acModifier > 0 ? '+' : ''}${def.acModifier}`)
  if (def.speedModifier) mods.push(`Скор ${def.speedModifier > 0 ? '+' : ''}${def.speedModifier}`)
  return (
    <div className="mb-1 flex items-center justify-between gap-2 rounded border border-copperdim/40 bg-black/30 px-2 py-1" style={{ borderLeft: `3px solid ${colors.border}` }}>
      <ModuleArt def={def} compact />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-slate-100">{def.name}</div>
        <div className="text-[9px] text-slate-400">{mods.join(' · ') || 'апгрейд'}</div>
      </div>
      <button className="btn px-2 py-0.5 text-[10px]" onClick={() => dispatch({ type: 'UNPLACE_INSTANCE', instanceId: inst.instanceId })}>
        Снять
      </button>
    </div>
  )
}
