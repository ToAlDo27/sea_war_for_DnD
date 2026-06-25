import { useStore } from '../state/store'
import { SectionTitle } from './common'

export default function BuildErrorsPanel() {
  const { state, derived, defMap, dispatch } = useStore()

  const moduleErrors = state.instances
    .map((inst) => {
      const st = derived.moduleStatus[inst.instanceId]
      if (!st || !st.installed || st.errors.length === 0) return null
      const def = defMap.get(inst.defId)
      return { inst, name: def?.name ?? '—', errors: st.errors }
    })
    .filter(Boolean) as Array<{ inst: { instanceId: string }; name: string; errors: string[] }>

  const shipErrors = derived.buildErrors
  const total = shipErrors.length

  return (
    <div className="panel">
      <SectionTitle
        right={
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold"
            style={{
              color: total === 0 ? '#7fe8b0' : '#f0908c',
              border: `1px solid ${total === 0 ? '#34e2a0' : '#e0524d'}`,
            }}
          >
            {total === 0 ? 'OK' : `${total}`}
          </span>
        }
      >
        Ошибки сборки
      </SectionTitle>
      <div className="min-h-40 max-h-[38vh] space-y-1 overflow-auto p-3">
        {total === 0 && moduleErrors.length === 0 && (
          <p className="px-2 py-3 text-center text-[11px] text-rune">⚓ Корабль исправен и готов к плаванию.</p>
        )}

        {shipErrors.map((e, i) => (
          <div key={`s-${i}`} className="rounded border border-danger/50 bg-danger/10 px-2 py-1 text-[11px] text-red-200">
            ⚠ {e}
          </div>
        ))}

        {moduleErrors.map(({ inst, name, errors }) => (
          <button
            key={inst.instanceId}
            onClick={() => dispatch({ type: 'SELECT_INSTANCE', instanceId: inst.instanceId })}
            className="block w-full rounded border border-warn/40 bg-warn/5 px-2 py-1 text-left text-[11px] hover:bg-warn/15"
          >
            <span className="font-semibold text-warn">{name}:</span>{' '}
            <span className="text-slate-300">{errors.join('; ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
