import { useStore } from '../state/store'
import { CATEGORY_LABELS } from '../data/catalog'
import { CATEGORY_COLORS, RARITY_COLORS, RARITY_LABELS } from '../ui/styles'
import { SectionTitle } from './common'
import { formatGold } from '../utils'
import ModuleArt from './ModuleArt'

export default function SelectedModulePanel() {
  const { state, derived, defMap, dispatch } = useStore()
  const inst = state.selectedInstanceId ? state.instances.find((i) => i.instanceId === state.selectedInstanceId) : null
  const def = inst ? defMap.get(inst.defId) : null

  if (!inst || !def) {
    return (
      <div className="panel">
        <SectionTitle>Выбранный модуль</SectionTitle>
        <p className="px-3 py-6 text-center text-[11px] text-slate-500">Модуль не выбран. Кликните на модуль в сетке или инвентаре.</p>
      </div>
    )
  }

  const status = derived.moduleStatus[inst.instanceId]
  const placed = inst.placed
  const working = status?.working
  const errors = status?.errors ?? []
  const colors = CATEGORY_COLORS[def.category]

  const statusText = !placed ? 'Не установлен' : working ? 'Установлен корректно' : 'Установлен с ошибками'
  const statusColor = !placed ? '#9aa7b3' : working ? '#7fe8b0' : '#f0908c'

  const rows: Array<[string, React.ReactNode]> = [
    ['Категория', CATEGORY_LABELS[def.category]],
    ['Редкость', <span style={{ color: RARITY_COLORS[def.rarity] }}>{RARITY_LABELS[def.rarity]}</span>],
    ['Размер', def.cells === 0 ? 'апгрейд (0 клеток)' : `${def.width}×${def.height} (${def.cells} кл.)${inst.rotated ? ' · повёрнут' : ''}`],
    ['Вес', def.weight],
    ['Цена', `${formatGold(def.price)} зм`],
    ['Установка', `${formatGold(def.installCost)} зм`],
  ]
  if (def.hpModifier) rows.push(['ХП-модификатор', signed(def.hpModifier)])
  if (def.acModifier) rows.push(['КД-модификатор', signed(def.acModifier)])
  if (def.speedModifier) rows.push(['Скорость', `${signed(def.speedModifier)} фт`])
  if (def.maxLoadModifier) rows.push(['Макс. нагрузка', signed(def.maxLoadModifier)])
  if (def.energyGeneration) rows.push(['Генерация МЭ', def.energyGeneration])
  if (def.energyStorage) rows.push(['Запас МЭ', def.energyStorage])
  if (def.generatorLevel) rows.push(['Уровень генератора', def.generatorLevel])
  if (def.energyCost) rows.push(['Расход МЭ', def.energyCost])
  if (def.damage) rows.push(['Урон', def.damage])
  if (def.range) rows.push(['Дальность', def.range])

  return (
    <div className="panel flex min-h-0 flex-col">
      <SectionTitle>Выбранный модуль</SectionTitle>
      <div className="min-h-0 flex-1 overflow-auto p-3" style={{ borderTop: `2px solid ${colors.border}` }}>
        <div className="mb-2 flex items-start gap-3">
          <ModuleArt def={def} />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base text-gold">{def.name}</h3>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{CATEGORY_LABELS[def.category]}</div>
          </div>
        </div>
        <div className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: statusColor, border: `1px solid ${statusColor}` }}>
          {statusText}
        </div>

        <div className="space-y-0.5">
          {rows.map(([k, v], idx) => (
            <div key={idx} className="stat-row">
              <span className="stat-label">{k}</span>
              <span className="stat-value">{v}</span>
            </div>
          ))}
        </div>

        {def.requirements && def.requirements.length > 0 && (
          <InfoBlock title="Требования" text={def.requirements.join(', ')} />
        )}
        {def.allowedCells.length > 0 && <InfoBlock title="Допустимые клетки" text={def.allowedCells.join(', ')} />}
        {def.description && <InfoBlock title="Описание" text={def.description} italic />}
        {def.effect && <InfoBlock title="Эффект" text={def.effect} italic />}

        {errors.length > 0 && (
          <div className="mt-2 rounded border border-danger/60 bg-danger/10 p-2">
            <div className="mb-1 text-[10px] font-bold uppercase text-danger">Ошибки модуля</div>
            <ul className="space-y-0.5">
              {errors.map((e, i) => (
                <li key={i} className="text-[11px] text-red-200">
                  ⚠ {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Действия */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {def.rotatable && (
            <button className="btn px-2 py-1 text-[11px]" onClick={() => dispatch({ type: 'ROTATE_INSTANCE', instanceId: inst.instanceId })}>
              ⟳ Повернуть
            </button>
          )}
          {placed ? (
            <button className="btn btn-rune px-2 py-1 text-[11px]" onClick={() => dispatch({ type: 'UNPLACE_INSTANCE', instanceId: inst.instanceId })}>
              ↩ Вернуть в инвентарь
            </button>
          ) : def.cells === 0 ? (
            <button className="btn btn-rune px-2 py-1 text-[11px]" onClick={() => dispatch({ type: 'INSTALL_UPGRADE', instanceId: inst.instanceId })}>
              Установить апгрейд
            </button>
          ) : (
            <span className="text-[10px] text-slate-500">Перетащите модуль на сетку для установки.</span>
          )}
          {(state.ui.masterMode || state.ui.activeTab === 'editor') && (
            <button className="btn btn-danger px-2 py-1 text-[11px]" onClick={() => dispatch({ type: 'DELETE_INSTANCE', instanceId: inst.instanceId })}>
              🗑 Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ title, text, italic }: { title: string; text: string; italic?: boolean }) {
  return (
    <div className="mt-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-copperlight">{title}</div>
      <div className={`text-[11px] text-slate-300 ${italic ? 'italic' : ''}`}>{text}</div>
    </div>
  )
}

function signed(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`
}
