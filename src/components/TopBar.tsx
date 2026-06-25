import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { Confirm } from './common'
import { downloadJSON, exportStateJSON, importStateJSON } from '../state/persistence'
import type { UISettings } from '../types'

const TABS: Array<{ id: UISettings['activeTab']; label: string; icon: string }> = [
  { id: 'ship', label: 'Корабль', icon: '⚓' },
  { id: 'shipyard', label: 'Верфь', icon: '🏗' },
  { id: 'editor', label: 'Редактор данных', icon: '🛠' },
]

export default function TopBar() {
  const { state, dispatch, saveMeta, notify, manualSave, continueLastSave } = useStore()
  const [confirm, setConfirm] = useState<null | 'new' | 'resetShip' | 'resetAll'>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const saveBadge =
    saveMeta.status === 'saved'
      ? { text: '✓ Сохранено', color: '#34e2a0' }
      : saveMeta.status === 'dirty'
        ? { text: '● Есть несохранённые изменения', color: '#e8c06a' }
        : { text: '✕ Ошибка сохранения', color: '#e0524d' }

  const doExport = () => {
    downloadJSON(`${slug(state.shipName)}-${Date.now()}.json`, exportStateJSON(state))
    notify('Состояние экспортировано в JSON', 'success')
  }

  const doImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = importStateJSON(String(reader.result))
      if (res.ok && res.state) {
        dispatch({ type: 'LOAD_STATE', state: res.state })
        notify('Импорт успешно завершён', 'success')
      } else {
        notify('Повреждённый JSON: ' + (res.error ?? 'ошибка'), 'error')
      }
    }
    reader.onerror = () => notify('Не удалось прочитать файл', 'error')
    reader.readAsText(file)
  }

  return (
    <header className="panel sticky top-0 z-30 m-2 flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚢</span>
        <div className="leading-tight">
          <div className="font-display text-sm text-gold">ВЕРФЬ НОВОГО МИРА</div>
          <div className="text-[9px] uppercase tracking-widest text-copperlight">конструктор корабля · D&D</div>
        </div>
      </div>

      {/* Вкладки */}
      <nav className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => dispatch({ type: 'SET_UI', partial: { activeTab: t.id } })}
            className={`btn px-3 py-1.5 ${state.ui.activeTab === t.id ? 'btn-gold' : ''}`}
            style={state.ui.activeTab === t.id ? { background: 'rgba(232,198,106,.15)' } : undefined}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {/* Индикатор сохранения */}
      <span className="text-[11px] font-medium" style={{ color: saveBadge.color }}>
        {saveBadge.text}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <label className="mr-1 flex cursor-pointer items-center gap-1 text-[11px] text-slate-300" title="Режим мастера: удаление модулей и спец-инструменты">
          <input
            type="checkbox"
            checked={state.ui.masterMode}
            onChange={(e) => dispatch({ type: 'SET_UI', partial: { masterMode: e.target.checked } })}
          />
          Режим мастера
        </label>
        <button className="btn btn-rune" onClick={manualSave} title="Сохранить вручную">
          💾 Сохранить
        </button>
        <button className="btn" onClick={continueLastSave} title="Загрузить последнее сохранение">
          ▶ Продолжить
        </button>
        <button className="btn" onClick={doExport} title="Экспорт состояния в JSON-файл">
          ⬇ Экспорт
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()} title="Импорт состояния из JSON">
          ⬆ Импорт
        </button>
        <button className="btn" onClick={() => setConfirm('new')} title="Начать новую игру">
          ✚ Новая игра
        </button>
        <button className="btn btn-danger" onClick={() => setConfirm('resetShip')} title="Сбросить только корабль">
          ↺ Сброс корабля
        </button>
        <button className="btn btn-danger" onClick={() => setConfirm('resetAll')} title="Полный сброс">
          ⟲ Сброс всё
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) doImport(f)
            e.target.value = ''
          }}
        />
      </div>

      {confirm === 'new' && (
        <Confirm
          text="Начать новую игру? Текущее сохранение будет перезаписано стартовым кораблём. Рекомендуется сначала сделать экспорт."
          danger
          confirmLabel="Новая игра"
          onConfirm={() => {
            dispatch({ type: 'NEW_GAME' })
            setConfirm(null)
            notify('Создан новый корабль', 'success')
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'resetShip' && (
        <Confirm
          text="Сбросить только корабль? Сетка, модули и расширения будут удалены. Ресурсы и каталог сохранятся."
          danger
          confirmLabel="Сбросить корабль"
          onConfirm={() => {
            dispatch({ type: 'RESET_SHIP' })
            setConfirm(null)
            notify('Корабль сброшен', 'info')
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === 'resetAll' && (
        <Confirm
          text="Полный сброс? Будут удалены все данные: корабль, ресурсы, каталог и сохранение. Это действие необратимо."
          danger
          confirmLabel="Сбросить всё"
          onConfirm={() => {
            dispatch({ type: 'RESET_ALL' })
            setConfirm(null)
            notify('Выполнен полный сброс', 'info')
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </header>
  )
}

function slug(s: string): string {
  return s.replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'ship'
}
