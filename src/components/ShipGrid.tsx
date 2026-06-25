import React from 'react'
import { useStore } from '../state/store'
import { useDnD, DRAG_MIME } from './dnd'
import { effectiveSize } from '../logic/compute'
import { CATEGORY_COLORS, CELL_SHORT, CELL_TINT, categoryBg } from '../ui/styles'
import type { ModuleDef, ModuleInstance } from '../types'
import ModuleArt from './ModuleArt'

const CELL = 170
const PAD_LEFT = 260
const PAD_RIGHT = 220
const PAD_TOP = 80
const PAD_BOTTOM = 90

export default function ShipGrid() {
  const { state, derived, defMap, dispatch, notify } = useStore()
  const dnd = useDnD()
  const { grid, rows, cols } = derived

  const draggingInst = dnd.draggingId ? state.instances.find((i) => i.instanceId === dnd.draggingId) : undefined
  const draggingDef = draggingInst ? defMap.get(draggingInst.defId) : undefined
  const selectedInst = state.selectedInstanceId ? state.instances.find((i) => i.instanceId === state.selectedInstanceId) : undefined
  const selectedDef = selectedInst ? defMap.get(selectedInst.defId) : undefined
  const activePlacementInst = draggingInst ?? (selectedDef?.category === 'weapon' && selectedDef.cells > 0 ? selectedInst : undefined)
  const activePlacementDef = draggingDef ?? (activePlacementInst ? defMap.get(activePlacementInst.defId) : undefined)
  const activePlacementId = activePlacementInst?.instanceId ?? null

  // Оценка размещения для подсветки превью
  const preview = React.useMemo(() => {
    if (!activePlacementId || !dnd.hover || !activePlacementDef || activePlacementDef.cells === 0) return null
    const { w, h } = effectiveSize(activePlacementDef, activePlacementInst?.rotated)
    const x0 = dnd.hover.x
    const y0 = dnd.hover.y
    const cells: Array<{ x: number; y: number; typeOk: boolean; occupied: boolean; inBounds: boolean }> = []
    let inBounds = true
    let free = true
    let typeOk = true
    const allowed = new Set(activePlacementDef.allowedCells)
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const x = x0 + dx
        const y = y0 + dy
        const ib = x >= 0 && y >= 0 && x < cols && y < rows
        if (!ib) {
          inBounds = false
          cells.push({ x, y, typeOk: false, occupied: false, inBounds: false })
          continue
        }
        const cell = grid[y][x]
        const cellTypeOk = allowed.has(cell.type)
        const occupied = cell.occupiedBy != null && cell.occupiedBy !== activePlacementId
        if (!cellTypeOk) typeOk = false
        if (occupied) free = false
        cells.push({ x, y, typeOk: cellTypeOk, occupied, inBounds: true })
      }
    }
    return { cells, inBounds, free, typeOk, valid: inBounds && free && typeOk }
  }, [activePlacementId, dnd.hover, activePlacementDef, activePlacementInst?.rotated, grid, rows, cols])

  const canPlaceAt = (id: string, x: number, y: number): boolean => {
    const inst = state.instances.find((i) => i.instanceId === id)
    const def = inst && defMap.get(inst.defId)
    if (!inst || !def || def.cells === 0) return false
    const { w, h } = effectiveSize(def, inst.rotated)
    const allowed = new Set(def.allowedCells)
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = x + dx
        const cy = y + dy
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return false
        const cell = grid[cy][cx]
        if (!allowed.has(cell.type)) return false
        if (cell.occupiedBy != null && cell.occupiedBy !== id) return false
      }
    }
    return true
  }

  const placeInstanceAt = (id: string, x: number, y: number, report = false) => {
    if (!canPlaceAt(id, x, y)) {
      if (report) notify('Орудие не помещается в этот слот: проверьте размер, тип клетки и занятость.', 'warn')
      return
    }
    dispatch({ type: 'PLACE_INSTANCE', instanceId: id, x, y })
    dnd.endDrag()
  }

  const handleDrop = (x: number, y: number, e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData('text/plain') || dnd.draggingId
    dnd.endDrag()
    if (!id) return
    placeInstanceAt(id, x, y, true)
  }

  const placedBlocks = state.instances.filter((i) => {
    const def = defMap.get(i.defId)
    return i.placed && def && def.cells > 0 && i.x != null && i.y != null
  })

  return (
    <div className="panel blueprint overflow-auto p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="panel-header border-0 px-0 text-[11px]">Схема корпуса</span>
        <label className="flex items-center gap-1 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={state.ui.showGridLabels}
            onChange={(e) => dispatch({ type: 'SET_UI', partial: { showGridLabels: e.target.checked } })}
          />
          подписи клеток
        </label>
      </div>

      <div className="flex justify-center">
        <div
          className="ship-hull-stage relative"
          style={{ width: cols * CELL + PAD_LEFT + PAD_RIGHT, height: rows * CELL + PAD_TOP + PAD_BOTTOM }}
          onDragLeave={() => dnd.setHover(null)}
        >
          <div
            className="ship-hull-shadow pointer-events-none absolute"
            style={{ left: 0, top: 0, width: cols * CELL + PAD_LEFT + PAD_RIGHT, height: rows * CELL + PAD_TOP + PAD_BOTTOM }}
          />
          {/* Базовые клетки */}
          <div
            className="absolute grid"
            style={{
              left: PAD_LEFT,
              top: PAD_TOP,
              gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
              gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
            }}
          >
            {grid.flat().map((cell) => (
              <div
                key={`${cell.x},${cell.y}`}
                className={`relative border border-rune/25 ${activePlacementId ? 'cursor-crosshair' : ''}`}
                style={{ background: CELL_TINT[cell.type] ?? 'transparent' }}
                onClick={() => {
                  if (!activePlacementId || !activePlacementDef || activePlacementDef.category !== 'weapon') return
                  placeInstanceAt(activePlacementId, cell.x, cell.y, true)
                }}
                onMouseEnter={() => {
                  if (activePlacementId) dnd.setHover({ x: cell.x, y: cell.y })
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  dnd.setHover({ x: cell.x, y: cell.y })
                }}
                onDrop={(e) => handleDrop(cell.x, cell.y, e)}
              >
                {state.ui.showGridLabels && (
                  <span className="pointer-events-none absolute left-1 top-1 text-[10px] font-bold uppercase tracking-tight text-slate-300/75">
                    {CELL_SHORT[cell.type]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Превью размещения */}
          {preview && (
            <div className="pointer-events-none absolute" style={{ left: PAD_LEFT, top: PAD_TOP, width: cols * CELL, height: rows * CELL }}>
              {preview.cells
                .filter((c) => c.inBounds)
                .map((c) => {
                  const bg = c.occupied
                    ? 'rgba(224,82,77,0.45)'
                    : !c.typeOk
                      ? 'rgba(224,169,77,0.45)'
                      : preview.valid
                        ? 'rgba(52,226,160,0.40)'
                        : 'rgba(224,82,77,0.35)'
                  return (
                    <div
                      key={`p-${c.x},${c.y}`}
                      className="absolute border-2"
                      style={{
                        left: c.x * CELL,
                        top: c.y * CELL,
                        width: CELL,
                        height: CELL,
                        background: bg,
                        borderColor: preview.valid ? '#34e2a0' : '#e0524d',
                      }}
                    />
                  )
                })}
            </div>
          )}

          {/* Установленные модули */}
          <div className="pointer-events-none absolute" style={{ left: PAD_LEFT, top: PAD_TOP, width: cols * CELL, height: rows * CELL }}>
            {placedBlocks.map((inst) => (
              <PlacedBlock key={inst.instanceId} inst={inst} def={defMap.get(inst.defId)!} />
            ))}
          </div>
        </div>
      </div>

      <Legend />
    </div>
  )
}

function PlacedBlock({ inst, def }: { inst: ModuleInstance; def: ModuleDef }) {
  const { state, derived, dispatch } = useStore()
  const dnd = useDnD()
  const { w, h } = effectiveSize(def, inst.rotated)
  const status = derived.moduleStatus[inst.instanceId]
  const hasError = status && status.errors.length > 0
  const selected = state.selectedInstanceId === inst.instanceId
  const weaponFocus = state.ui.weaponRelocationMode && def.category === 'weapon'
  const dimNonWeapon = state.ui.weaponRelocationMode && def.category !== 'weapon'
  const colors = CATEGORY_COLORS[def.category]
  const tight = w * h <= 1

  const borderColor = hasError ? '#e0524d' : selected ? '#e8c66a' : colors.border
  const glow = hasError
    ? '0 0 9px rgba(224,82,77,.5)'
    : selected || weaponFocus
      ? '0 0 12px rgba(232,198,106,.65)'
      : 'none'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_MIME, inst.instanceId)
        e.dataTransfer.setData('text/plain', inst.instanceId)
        e.dataTransfer.effectAllowed = 'move'
        dnd.startDrag(inst.instanceId)
      }}
      onDragEnd={() => dnd.endDrag()}
      onClick={() => {
        dispatch({ type: 'SELECT_INSTANCE', instanceId: inst.instanceId })
        if (def.category === 'weapon') {
          dispatch({ type: 'SET_UI', partial: { weaponRelocationMode: true } })
          dnd.startDrag(inst.instanceId)
        }
      }}
      className="absolute flex cursor-grab flex-col items-center justify-center overflow-hidden rounded-sm p-0.5 text-center active:cursor-grabbing"
      style={{
        left: (inst.x ?? 0) * CELL + 1,
        top: (inst.y ?? 0) * CELL + 1,
        width: w * CELL - 2,
        height: h * CELL - 2,
        background: categoryBg(def.category, 0.9),
        border: `2px solid ${borderColor}`,
        boxShadow: glow,
        pointerEvents: dnd.draggingId === inst.instanceId ? 'none' : 'auto',
        opacity: dimNonWeapon ? 0.42 : status && !status.working ? 0.78 : 1,
      }}
      title={`${def.name}${hasError ? '\n⚠ ' + status!.errors.join('\n⚠ ') : ''}`}
    >
      <ModuleArt def={def} compact={false} />
      {selected && (
        <span className="absolute left-1 right-1 top-1 rounded-sm bg-black/75 px-1 py-0.5 text-[10px] font-bold leading-tight text-white shadow">
          {def.name}
        </span>
      )}
      {!tight && <span className="mt-1 max-w-full truncate px-0.5 text-[10px] font-bold leading-tight text-white/95 drop-shadow">{def.name}</span>}
      {def.weaponSize && !tight && (
        <span className="mt-0.5 text-[7px] uppercase tracking-wide text-white/70">
          {def.weaponSize === 'light' ? 'лёгкое' : def.weaponSize === 'medium' ? 'среднее' : def.weaponSize === 'heavy' ? 'тяжёлое' : 'сверхтяж.'}
        </span>
      )}
      {def.weaponSize && tight && <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold uppercase text-white/75">{def.weaponSize.slice(0, 1)}</span>}
      {hasError && <span className="absolute right-0.5 top-0.5 text-[10px] text-danger">⚠</span>}
      {inst.rotated && <span className="absolute bottom-0.5 left-0.5 text-[8px] text-white/60">⟳</span>}
    </div>
  )
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] text-slate-400">
      <LegendItem color="rgba(52,226,160,0.5)" label="можно поставить" />
      <LegendItem color="rgba(224,169,77,0.5)" label="неверный тип клетки" />
      <LegendItem color="rgba(224,82,77,0.5)" label="занято / не помещается" />
      <LegendItem color="#e8c66a" label="выбранный модуль" border />
      <LegendItem color="#e0524d" label="модуль с ошибкой" border />
    </div>
  )
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={border ? { border: `2px solid ${color}` } : { background: color }}
      />
      {label}
    </span>
  )
}
