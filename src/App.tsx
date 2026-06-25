import { useStore } from './state/store'
import { DnDProvider } from './components/dnd'
import TopBar from './components/TopBar'
import StatusPanel from './components/StatusPanel'
import ResourcePanel from './components/ResourcePanel'
import ShipGrid from './components/ShipGrid'
import InventoryPanel from './components/InventoryPanel'
import SelectedModulePanel from './components/SelectedModulePanel'
import BuildErrorsPanel from './components/BuildErrorsPanel'
import Shipyard from './components/Shipyard'
import DataEditor from './components/DataEditor'
import LogPanel from './components/LogPanel'
import Toasts from './components/Toasts'

export default function App() {
  const { state, dispatch } = useStore()
  const tab = state.ui.activeTab

  return (
    <div className="min-h-screen pb-6">
      <TopBar />

      <main className="px-2">
        {tab === 'ship' && (
          <DnDProvider>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-[300px_minmax(920px,1fr)_320px] 2xl:grid-cols-[320px_minmax(1180px,1fr)_340px]">
              <div className="space-y-2">
                <StatusPanel />
                <ResourcePanel />
              </div>

              <div className="space-y-2">
                <div className="panel flex items-center justify-between p-3">
                  <div className="text-[11px] text-slate-400">
                    Перетаскивайте модули из инвентаря на сетку. Покупка модулей - только на верфи.
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <label className="flex items-center gap-1 text-[10px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={state.ui.weaponRelocationMode}
                        onChange={(e) => dispatch({ type: 'SET_UI', partial: { weaponRelocationMode: e.target.checked } })}
                      />
                      Режим орудий
                    </label>
                    <button className="btn btn-rune px-3 py-2 text-sm" onClick={() => dispatch({ type: 'AUTO_PLACE_WEAPONS' })}>
                      Расставить орудия
                    </button>
                    <button className="btn btn-gold px-5 py-2 text-sm" onClick={() => dispatch({ type: 'SET_UI', partial: { activeTab: 'shipyard' } })}>
                      Открыть верфь
                    </button>
                  </div>
                </div>
                <ShipGrid />
                <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
                  <BuildErrorsPanel />
                  <LogPanel />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <InventoryPanel />
                <SelectedModulePanel />
              </div>
            </div>
          </DnDProvider>
        )}

        {tab === 'shipyard' && (
          <div className="mx-auto max-w-[1400px]">
            <Shipyard />
          </div>
        )}

        {tab === 'editor' && (
          <div className="mx-auto max-w-[1400px]">
            <DataEditor />
          </div>
        )}
      </main>

      <FloatingFireButton />
      <Toasts />
    </div>
  )
}

function FloatingFireButton() {
  const { state, derived, defMap, dispatch } = useStore()
  const inst = state.selectedInstanceId ? state.instances.find((i) => i.instanceId === state.selectedInstanceId) : null
  const def = inst ? defMap.get(inst.defId) : null
  if (!inst || !def || def.category !== 'weapon') return null

  const status = derived.moduleStatus[inst.instanceId]
  const canFire = !!status?.installed && !!status?.working && status.errors.length === 0
  const disabledReason = !status?.installed
    ? 'Орудие не установлено на корабль'
    : status.errors.length > 0
      ? `Нельзя стрелять: ${status.errors.join('; ')}`
      : !status.working
        ? 'Нельзя стрелять: не выполнены условия работы модуля'
        : `Выстрелить: ${def.name}`

  return (
    <button
      className={`fixed bottom-5 right-5 z-50 flex min-w-[170px] items-center justify-center gap-2 rounded border-2 px-5 py-4 text-sm font-bold uppercase tracking-wide shadow-lg ${
        canFire
          ? 'border-danger/60 bg-black/80 text-red-200 hover:bg-danger/20'
          : 'cursor-not-allowed border-slate-600 bg-black/65 text-slate-500 opacity-70'
      }`}
      disabled={!canFire}
      onClick={() => {
        if (canFire) dispatch({ type: 'FIRE_WEAPON', instanceId: inst.instanceId })
      }}
      title={disabledReason}
    >
      <span className="cannon-shot-art cannon-shot-art-lg" aria-hidden="true" />
      {canFire ? 'Огонь' : 'Огонь заблокирован'}
    </button>
  )
}
