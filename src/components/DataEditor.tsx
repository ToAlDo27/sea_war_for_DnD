import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { CATEGORY_LABELS } from '../data/catalog'
import { CATEGORY_LIST } from '../state/store'
import { RARITY_LABELS, RARITY_ORDER, RARITY_COLORS } from '../ui/styles'
import { Confirm, Field } from './common'
import { downloadJSON, importStateJSON } from '../state/persistence'
import { exportStateJSON } from '../state/persistence'
import { uid } from '../utils'
import type { CellType, Category, ModuleDef, Rarity } from '../types'

const CELL_TYPES: CellType[] = ['Нос', 'Корма', 'Левый борт', 'Правый борт', 'Центр', 'Киль', 'Внутренний отсек', 'Палуба']

export default function DataEditor() {
  const { state, dispatch, notify, manualSave } = useStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all')
  const [rarFilter, setRarFilter] = useState<Rarity | 'all'>('all')
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = state.catalog.filter((d) => {
    if (catFilter !== 'all' && d.category !== catFilter) return false
    if (rarFilter !== 'all' && d.rarity !== rarFilter) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const editing = editId ? state.catalog.find((d) => d.id === editId) : null

  const addModule = () => {
    const def: ModuleDef = {
      id: uid('mod'),
      name: 'Новый модуль',
      category: 'room',
      width: 1,
      height: 1,
      cells: 1,
      weight: 1,
      price: 1000,
      installCost: 0,
      rarity: 'common',
      allowMultiple: true,
      allowedCells: ['Центр', 'Внутренний отсек'],
    }
    dispatch({ type: 'ADD_MODULE_DEF', def })
    setEditId(def.id)
    notify('Модуль добавлен', 'success')
  }

  const update = (patch: Partial<ModuleDef>) => {
    if (!editing) return
    dispatch({ type: 'UPDATE_MODULE_DEF', def: { ...editing, ...patch } })
  }

  const exportCatalog = () => {
    downloadJSON(`catalog-${Date.now()}.json`, JSON.stringify(state.catalog, null, 2))
    notify('Каталог экспортирован', 'success')
  }

  const importCatalog = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) throw new Error('Ожидался массив модулей')
        dispatch({ type: 'IMPORT_CATALOG', catalog: parsed })
        notify('Каталог импортирован', 'success')
      } catch (e) {
        notify('Ошибка импорта каталога: ' + (e instanceof Error ? e.message : ''), 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-3">
      <div className="panel flex flex-wrap items-center justify-between gap-2 p-3">
        <h2 className="font-display text-lg text-gold">🛠 Редактор данных (мастерский инструмент)</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-rune" onClick={addModule}>
            + Добавить модуль
          </button>
          <button className="btn" onClick={exportCatalog}>
            Экспорт каталога
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Импорт каталога
          </button>
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            Сбросить каталог
          </button>
          <button className="btn btn-gold" onClick={manualSave}>
            Сохранить изменения
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importCatalog(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <BaseStatsEditor />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.2fr]">
        {/* Список модулей */}
        <div className="panel flex max-h-[60vh] flex-col">
          <div className="space-y-2 border-b border-copperdim/40 p-2">
            <input
              className="text-input w-full"
              placeholder="Поиск по названию…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <select className="text-input flex-1" value={catFilter} onChange={(e) => setCatFilter(e.target.value as Category | 'all')}>
                <option value="all">Все категории</option>
                {CATEGORY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <select className="text-input flex-1" value={rarFilter} onChange={(e) => setRarFilter(e.target.value as Rarity | 'all')}>
                <option value="all">Все редкости</option>
                {RARITY_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {RARITY_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-400">Найдено: {filtered.length} из {state.catalog.length}</div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-1">
            {filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => setEditId(d.id)}
                className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-[12px] hover:bg-copper/15 ${editId === d.id ? 'bg-copper/20' : ''}`}
              >
                <span className="truncate text-slate-100">{d.name}</span>
                <span className="ml-2 shrink-0 text-[9px]" style={{ color: RARITY_COLORS[d.rarity] }}>
                  {CATEGORY_LABELS[d.category]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="panel max-h-[60vh] overflow-auto p-3">
          {!editing ? (
            <p className="py-8 text-center text-sm text-slate-500">Выберите модуль из списка для редактирования или добавьте новый.</p>
          ) : (
            <ModuleForm def={editing} update={update} onDelete={() => {
              dispatch({ type: 'DELETE_MODULE_DEF', id: editing.id })
              setEditId(null)
              notify('Модуль удалён', 'info')
            }} />
          )}
        </div>
      </div>

      {confirmReset && (
        <Confirm
          text="Сбросить каталог модулей к базовым данным? Все изменения каталога будут потеряны."
          danger
          confirmLabel="Сбросить каталог"
          onConfirm={() => {
            dispatch({ type: 'RESET_CATALOG' })
            setEditId(null)
            setConfirmReset(false)
            notify('Каталог сброшен', 'info')
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}

function num(v: string): number {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function ModuleForm({ def, update, onDelete }: { def: ModuleDef; update: (p: Partial<ModuleDef>) => void; onDelete: () => void }) {
  const toggleCell = (c: CellType) => {
    const has = def.allowedCells.includes(c)
    update({ allowedCells: has ? def.allowedCells.filter((x) => x !== c) : [...def.allowedCells, c] })
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base text-gold">Редактирование</h3>
        <button className="btn btn-danger px-2 py-1 text-[11px]" onClick={onDelete}>
          🗑 Удалить модуль
        </button>
      </div>

      <Field label="Название">
        <input className="text-input" value={def.name} onChange={(e) => update({ name: e.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Категория">
          <select className="text-input" value={def.category} onChange={(e) => update({ category: e.target.value as Category })}>
            {CATEGORY_LIST.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Редкость">
          <select className="text-input" value={def.rarity} onChange={(e) => update({ rarity: e.target.value as Rarity })}>
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>
                {RARITY_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Ширина"><input className="num-input" type="number" value={def.width} onChange={(e) => update({ width: num(e.target.value) })} /></Field>
        <Field label="Высота"><input className="num-input" type="number" value={def.height} onChange={(e) => update({ height: num(e.target.value) })} /></Field>
        <Field label="Клетки"><input className="num-input" type="number" value={def.cells} onChange={(e) => update({ cells: num(e.target.value) })} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Вес"><input className="num-input" type="number" value={def.weight} onChange={(e) => update({ weight: num(e.target.value) })} /></Field>
        <Field label="Цена"><input className="num-input" type="number" value={def.price} onChange={(e) => update({ price: num(e.target.value) })} /></Field>
        <Field label="Установка"><input className="num-input" type="number" value={def.installCost} onChange={(e) => update({ installCost: num(e.target.value) })} /></Field>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Field label="ХП-мод"><input className="num-input" type="number" value={def.hpModifier ?? 0} onChange={(e) => update({ hpModifier: num(e.target.value) })} /></Field>
        <Field label="КД-мод"><input className="num-input" type="number" value={def.acModifier ?? 0} onChange={(e) => update({ acModifier: num(e.target.value) })} /></Field>
        <Field label="Скор-мод"><input className="num-input" type="number" value={def.speedModifier ?? 0} onChange={(e) => update({ speedModifier: num(e.target.value) })} /></Field>
        <Field label="Нагр-мод"><input className="num-input" type="number" value={def.maxLoadModifier ?? 0} onChange={(e) => update({ maxLoadModifier: num(e.target.value) })} /></Field>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Field label="МЭ ген"><input className="num-input" type="number" value={def.energyGeneration ?? 0} onChange={(e) => update({ energyGeneration: num(e.target.value) })} /></Field>
        <Field label="МЭ запас"><input className="num-input" type="number" value={def.energyStorage ?? 0} onChange={(e) => update({ energyStorage: num(e.target.value) })} /></Field>
        <Field label="Ур. генер."><input className="num-input" type="number" value={def.generatorLevel ?? 0} onChange={(e) => update({ generatorLevel: num(e.target.value) })} /></Field>
        <Field label="Расход МЭ"><input className="num-input" type="number" value={def.energyCost ?? 0} onChange={(e) => update({ energyCost: num(e.target.value) })} /></Field>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-slate-200">
        <input type="checkbox" checked={!!def.rotatable} onChange={(e) => update({ rotatable: e.target.checked })} />
        Можно поворачивать
      </label>
      <label className="flex items-center gap-2 text-[12px] text-slate-200">
        <input type="checkbox" checked={def.allowMultiple} onChange={(e) => update({ allowMultiple: e.target.checked })} />
        Можно покупать несколько копий
      </label>

      <Field label="Требования (через запятую)">
        <input
          className="text-input"
          value={(def.requirements ?? []).join(', ')}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
            update({ requirements: arr.length ? arr : undefined })
          }}
        />
      </Field>

      <div>
        <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Допустимые клетки</div>
        <div className="flex flex-wrap gap-1">
          {CELL_TYPES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCell(c)}
              className={`chip ${def.allowedCells.includes(c) ? 'text-rune' : 'text-slate-500'}`}
              style={def.allowedCells.includes(c) ? { borderColor: '#34e2a0' } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Field label="Урон (для орудий)"><input className="text-input" value={def.damage ?? ''} onChange={(e) => update({ damage: e.target.value || undefined })} /></Field>
      <Field label="Описание"><textarea className="text-input min-h-[48px]" value={def.description ?? ''} onChange={(e) => update({ description: e.target.value || undefined })} /></Field>
      <Field label="Эффект"><textarea className="text-input min-h-[48px]" value={def.effect ?? ''} onChange={(e) => update({ effect: e.target.value || undefined })} /></Field>
    </div>
  )
}

function BaseStatsEditor() {
  const { state, dispatch } = useStore()
  const set = (patch: Record<string, number>) => dispatch({ type: 'SET_BASE', partial: patch })
  const items: Array<[string, keyof typeof state, number]> = [
    ['База ХП', 'baseHP', state.baseHP],
    ['Текущие ХП', 'currentHP', state.currentHP],
    ['База КД', 'baseAC', state.baseAC],
    ['База скорости', 'baseSpeed', state.baseSpeed],
    ['База нагрузки', 'baseMaxLoad', state.baseMaxLoad],
    ['Лимит орудий', 'baseWeaponLimit', state.baseWeaponLimit],
    ['Лимит тяжёлых', 'baseHeavyWeaponLimit', state.baseHeavyWeaponLimit],
    ['Лимит сверхтяж.', 'baseSuperHeavyWeaponLimit', state.baseSuperHeavyWeaponLimit],
    ['База ген. (уровень)', 'baseMaxGeneratorLevel', state.baseMaxGeneratorLevel],
    ['Уровень длины', 'lengthLevel', state.lengthLevel],
    ['Уровень ширины', 'widthLevel', state.widthLevel],
    ['Уровень этажности', 'heightLevel', state.heightLevel],
  ]
  return (
    <div className="panel p-3">
      <h3 className="mb-2 font-display text-base text-gold">Базовые параметры корабля</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(([label, key, value]) => (
          <Field key={key} label={label}>
            <input
              className="num-input"
              type="number"
              value={value as number}
              onChange={(e) => set({ [key]: num(e.target.value) })}
            />
          </Field>
        ))}
      </div>
    </div>
  )
}
