import type { Resources } from '../types'
import { RESOURCE_LABELS, RESOURCE_ORDER } from '../data/defaults'
import { useStore } from '../state/store'
import { SectionTitle } from './common'
import { formatGold } from '../utils'

const STEP: Partial<Record<keyof Resources, number>> = { gold: 100 }
const ICON: Record<keyof Resources, string> = {
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

export default function ResourcePanel() {
  const { state, dispatch } = useStore()
  const players = Math.max(1, state.playerCount || 1)
  const daysLeft = Math.floor(Math.min(state.resources.food, state.resources.water) / players)
  const canEdit = state.ui.masterMode

  return (
    <div className="panel">
      <SectionTitle>Ресурсы корабля</SectionTitle>
      <div className="border-b border-copperdim/40 p-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-slate-400">Игроки</span>
            <input
              className="num-input"
              type="number"
              min={1}
              value={players}
              onChange={(e) => dispatch({ type: 'SET_PLAYER_COUNT', value: parseFloat(e.target.value) || 1 })}
            />
          </label>
          <div className="rounded border border-copperdim/40 bg-black/20 px-2 py-1">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">День {state.day}</div>
            <div className="text-[11px] text-slate-200">Запас: {daysLeft} дн.</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 rounded border border-copperdim/40 bg-black/20 px-2 py-1">
          <span className="text-[10px] text-slate-400">Расход в день: {players} еды и {players} воды</span>
          <button className="btn btn-rune px-2 py-1 text-[11px]" onClick={() => dispatch({ type: 'END_DAY' })}>
            Окончание дня
          </button>
        </div>
      </div>

      <div className="space-y-1 p-2">
        {RESOURCE_ORDER.map((key) => {
          const step = STEP[key] ?? 1
          const value = state.resources[key]
          const editable = canEdit || key === 'cargo'
          return (
            <div key={key} className="flex items-center gap-2 rounded border border-copperdim/40 bg-black/20 px-2 py-1">
              <span className="w-4 text-center text-slate-400">{ICON[key]}</span>
              <span className="flex-1 text-[11px] text-slate-300">{RESOURCE_LABELS[key]}</span>
              <button
                className="btn px-1.5 py-0 leading-none"
                disabled={!editable}
                onClick={() => dispatch({ type: 'ADJUST_RESOURCE', key, delta: -step })}
              >
                -
              </button>
              <input
                className="num-input w-24"
                type="number"
                disabled={!editable}
                value={value}
                onChange={(e) => dispatch({ type: 'SET_RESOURCE', key, value: parseFloat(e.target.value) || 0 })}
                title={key === 'gold' ? `${formatGold(value)} зм` : undefined}
              />
              <button
                className="btn px-1.5 py-0 leading-none"
                disabled={!editable}
                onClick={() => dispatch({ type: 'ADJUST_RESOURCE', key, delta: step })}
              >
                +
              </button>
            </div>
          )
        })}
        {!canEdit && <div className="px-1 pt-1 text-[10px] text-slate-500">Ручное изменение доступно только в режиме мастера. Груз можно менять всегда.</div>}
      </div>
    </div>
  )
}
