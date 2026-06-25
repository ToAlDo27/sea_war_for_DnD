import { useStore } from '../state/store'
import { SectionTitle, StatRow } from './common'

const HEEL_LABELS: Record<string, string> = {
  none: 'нет',
  light: 'лёгкий',
  dangerous: 'опасный',
  critical: 'критический',
}

export default function StatusPanel() {
  const { state, derived, dispatch } = useStore()
  const d = derived

  const hpOver = state.currentHP > d.maxHP
  const overload = d.totalLoad > d.maxLoad
  const weaponsOver = d.weaponsUsed > d.weaponLimit
  const heavyOver = d.heavyWeaponsUsed > d.heavyWeaponLimit
  const superOver = d.superHeavyWeaponsUsed > d.superHeavyWeaponLimit

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
            {d.seaworthy ? '⚓ Готов к плаванию' : '⚠ Есть ошибки'}
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

        <StatRow label="Размер сетки" value={`${d.cols} × ${d.rows} (${d.totalCells} кл.)`} />
        <StatRow label="Свободные клетки" value={d.freeCells} good={d.freeCells > 0} />
        <div className="grid grid-cols-3 gap-1 py-1 text-center text-[11px]">
          <LevelBox label="Длина" lvl={state.lengthLevel} />
          <LevelBox label="Ширина" lvl={state.widthLevel} />
          <LevelBox label="Этаж." lvl={state.heightLevel} />
        </div>

        {/* ХП */}
        <div className="stat-row">
          <span className="stat-label">Текущие ХП</span>
          <div className="flex items-center gap-1">
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'SET_CURRENT_HP', value: state.currentHP - 10 })}>
              −
            </button>
            <input
              className="num-input w-16"
              type="number"
              value={state.currentHP}
              onChange={(e) => dispatch({ type: 'SET_CURRENT_HP', value: parseFloat(e.target.value) || 0 })}
              style={hpOver ? { color: '#f0908c', borderColor: '#e0524d' } : undefined}
            />
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'SET_CURRENT_HP', value: state.currentHP + 10 })}>
              +
            </button>
          </div>
        </div>
        <StatRow label="Максимальные ХП" value={d.maxHP} good={!hpOver} danger={hpOver} title="База + модули + расширения" />

        <StatRow label="Класс защиты (КД)" value={d.ac} />
        <StatRow label="Скорость" value={`${d.speed} фт`} warn={d.speed < state.baseSpeed} />

        {/* Нагрузка */}
        <StatRow label="Общая нагрузка" value={`${d.totalLoad}`} danger={overload} />
        <StatRow label="Макс. нагрузка" value={d.maxLoad} />
        <StatRow label="Нагрузка ЛБ / ПБ" value={`${d.loadLeft} / ${d.loadRight}`} />
        <StatRow
          label="Крен"
          value={`${HEEL_LABELS[d.heelLevel]} (Δ${d.heelDiff})`}
          warn={d.heelLevel === 'light' || d.heelLevel === 'dangerous'}
          danger={d.heelLevel === 'critical'}
        />

        {/* Энергия */}
        <StatRow label="Генерация МЭ / раунд" value={d.energyGeneration} good={d.energyGeneration > 0} />
        <StatRow label="Расход МЭ (актив.)" value={d.energyUsed} warn={d.energyUsed > d.energyGeneration && d.energyGeneration > 0} />
        <StatRow label="Максимальный запас МЭ" value={d.energyStorage} />
        <div className="stat-row">
          <span className="stat-label">Текущий запас МЭ</span>
          <div className="flex items-center gap-1">
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'ADJUST_CURRENT_ENERGY', delta: -1 })}>
              −
            </button>
            <input
              className="num-input w-14"
              type="number"
              value={state.currentEnergy}
              onChange={(e) => dispatch({ type: 'SET_CURRENT_ENERGY', value: parseFloat(e.target.value) || 0 })}
            />
            <button className="btn px-1.5 py-0" onClick={() => dispatch({ type: 'ADJUST_CURRENT_ENERGY', delta: 1 })}>
              +
            </button>
          </div>
        </div>
        <StatRow label="Макс. уровень генератора" value={`${d.bestGeneratorLevel} / лимит ${d.maxGeneratorLevel}`} />

        {/* Орудия */}
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
