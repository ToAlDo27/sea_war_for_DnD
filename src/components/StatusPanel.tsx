import { useStore } from '../state/store'
import { SectionTitle, StatRow } from './common'

const HEEL_LABELS: Record<string, string> = {
  none: 'нет',
  light: 'лёгкий',
  dangerous: 'опасный',
  critical: 'критический',
}

export default function StatusPanel() {
  const { state, derived, defMap, dispatch } = useStore()
  const d = derived

  const hpOver = state.currentHP > d.maxHP
  const overload = d.totalLoad > d.maxLoad
  const weaponsOver = d.weaponsUsed > d.weaponLimit
  const heavyOver = d.heavyWeaponsUsed > d.heavyWeaponLimit
  const superOver = d.superHeavyWeaponsUsed > d.superHeavyWeaponLimit
  const generators = state.instances
    .filter((inst) => inst.placed && defMap.get(inst.defId)?.category === 'generator')
    .map((inst) => ({ inst, def: defMap.get(inst.defId)!, status: d.moduleStatus[inst.instanceId] }))

  return (
    <div className="panel">
      <SectionTitle
        right={
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{
              color: d.seaworthy ? '#7fe8b0' : '#f0908c',
              border: `1px solid ${d.seaworthy ? '#34e2a0' : '#e0524d'}`,
              boxShadow: d.seaworthy ? '0 0 8px rgba(52,226,160,.4)' : '0 0 8px rgba(224,82,77,.4)',
            }}
          >
            {d.seaworthy ? 'Готов' : 'Есть ошибки'}
          </span>
        }
      >
        Статус корабля
      </SectionTitle>

      <div className="px-3 pb-3 pt-1">
        <input
          className="text-input mb-2 w-full text-center font-display text-base tracking-wide text-gold"
          value={state.shipName}
          onChange={(e) => dispatch({ type: 'SET_SHIP_NAME', name: e.target.value })}
          spellCheck={false}
        />

        <StatRow label="Размер сетки" value={`${d.cols} x ${d.rows} (${d.totalCells} кл.)`} />
        <StatRow label="Свободные клетки" value={d.freeCells} good={d.freeCells > 0} />
        <div className="grid grid-cols-3 gap-1 py-1 text-center text-[11px]">
          <LevelBox label="Длина" lvl={state.lengthLevel} />
          <LevelBox label="Ширина" lvl={state.widthLevel} />
          <LevelBox label="Этаж." lvl={state.heightLevel} />
        </div>

        <div className="stat-row">
          <span className="stat-label">Текущие ХП</span>
          <div className="flex items-center gap-1">
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'SET_CURRENT_HP', value: state.currentHP - 10 })}>-</button>
            <input
              className="num-input w-16"
              type="number"
              value={state.currentHP}
              onChange={(e) => dispatch({ type: 'SET_CURRENT_HP', value: parseFloat(e.target.value) || 0 })}
              style={hpOver ? { color: '#f0908c', borderColor: '#e0524d' } : undefined}
            />
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'SET_CURRENT_HP', value: state.currentHP + 10 })}>+</button>
          </div>
        </div>
        <StatRow label="Максимальные ХП" value={d.maxHP} good={!hpOver} danger={hpOver} />

        <StatRow label="Класс защиты (КД)" value={d.ac} />
        <StatRow label="Скорость" value={`${d.speed} фт`} warn={d.speed < state.baseSpeed} />

        <StatRow label="Общая нагрузка" value={`${d.totalLoad}`} danger={overload} />
        <StatRow label="Макс. нагрузка" value={d.maxLoad} />
        <StatRow label="Нагрузка ЛБ / ПБ" value={`${d.loadLeft} / ${d.loadRight}`} />
        <StatRow
          label="Крен"
          value={`${HEEL_LABELS[d.heelLevel]} (${d.heelDiff})`}
          warn={d.heelLevel === 'light' || d.heelLevel === 'dangerous'}
          danger={d.heelLevel === 'critical'}
        />

        <div className="mt-2 rounded border border-rune/40 bg-black/25 p-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-display text-[12px] uppercase tracking-wide text-rune">Магическая энергия</span>
            <button className="btn btn-rune px-2 py-1 text-[10px]" onClick={() => dispatch({ type: 'END_ROUND' })}>
              Окончание раунда
            </button>
          </div>
          <StatRow label="Запас МЭ" value={`${state.currentEnergy} / ${d.energyStorage}`} danger={state.currentEnergy > d.energyStorage} />
          <StatRow label="Генерация / раунд" value={`+${d.energyGeneration}`} good={d.energyGeneration > 0} />
          <StatRow label="Активный расход" value={d.energyUsed} warn={d.energyUsed > state.currentEnergy} />
          <StatRow label="Уровень генератора" value={`${d.bestGeneratorLevel} / лимит ${d.maxGeneratorLevel}`} />

          {generators.length > 0 && (
            <div className="mt-2 space-y-1">
              {generators.map(({ inst, def, status }) => (
                <button
                  key={inst.instanceId}
                  className="block w-full rounded border bg-black/25 px-2 py-1 text-left text-[10px]"
                  style={{ borderColor: status?.working ? '#34e2a0' : '#e0524d' }}
                  onClick={() => dispatch({ type: 'SELECT_INSTANCE', instanceId: inst.instanceId })}
                >
                  <span className="font-semibold text-slate-100">{def.name}</span>
                  <span className={status?.working ? 'ml-1 text-rune' : 'ml-1 text-danger'}>
                    {status?.working ? 'работает' : 'ошибка'}
                  </span>
                  <span className="block text-slate-400">
                    Формула: +{def.energyGeneration ?? 0} МЭ/раунд, ёмкость {def.energyStorage ?? 0}, уровень {def.generatorLevel ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <StatRow label="Орудия" value={`${d.weaponsUsed} / ${d.weaponLimit}`} danger={weaponsOver} />
        <StatRow label="Тяжёлые орудия" value={`${d.heavyWeaponsUsed} / ${d.heavyWeaponLimit}`} danger={heavyOver} />
        <StatRow label="Сверхтяжёлые орудия" value={`${d.superHeavyWeaponsUsed} / ${d.superHeavyWeaponLimit}`} danger={superOver} />
      </div>
    </div>
  )
}

function LevelBox({ label, lvl }: { label: string; lvl: number }) {
  return (
    <div className="rounded border border-copperdim/60 bg-black/30 py-1">
      <div className="text-[10px] uppercase text-slate-400">{label}</div>
      <div className="font-display text-gold">
        {lvl}
        <span className="text-[10px] text-slate-500"> / 5</span>
      </div>
    </div>
  )
}
