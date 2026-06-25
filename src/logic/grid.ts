import type { CellType } from '../types'

export interface GridLayout {
  rows: number
  cols: number
  mainRows: number
  types: CellType[][]
}

export function generateGrid(lengthLevel: number, widthLevel: number, heightLevel: number): GridLayout {
  const length = clampLevel(lengthLevel)
  const width = clampLevel(widthLevel)
  const height = clampLevel(heightLevel)

  const bodyRows = 4 + length * 2
  const mainRows = bodyRows + 2
  const cols = Math.max(4 + width * 2, height > 0 ? 6 : 4)
  const internalRows = height * 6
  const rows = mainRows + internalRows

  const types: CellType[][] = []
  for (let y = 0; y < rows; y++) {
    const row: CellType[] = []
    for (let x = 0; x < cols; x++) {
      row.push(cellTypeAt(x, y, cols, mainRows, length))
    }
    types.push(row)
  }
  return { rows, cols, mainRows, types }
}

function clampLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, Math.floor(n)))
}

function cellTypeAt(x: number, y: number, cols: number, mainRows: number, lengthLevel: number): CellType {
  if (y >= mainRows) {
    const floorStart = Math.max(0, Math.floor((cols - 6) / 2))
    if (x < floorStart || x >= floorStart + 6) return 'Пусто'
    return 'Внутренний отсек'
  }

  const endSlots = Math.min(cols, 2 + lengthLevel * 2)
  const endStart = Math.floor((cols - endSlots) / 2)
  const inEnd = x >= endStart && x < endStart + endSlots
  if (y === 0) return inEnd ? 'Нос' : 'Палуба'
  if (y === mainRows - 1) return inEnd ? 'Корма' : 'Палуба'

  const bodyY = y - 1
  const centerLeft = Math.floor((cols - 1) / 2)
  const centerRight = Math.ceil((cols - 1) / 2)

  if (bodyY < 2 + lengthLevel) return 'Палуба'
  if (x === 0) return 'Левый борт'
  if (x === cols - 1) return 'Правый борт'
  if (x === centerLeft || x === centerRight) return 'Киль'
  return 'Центр'
}
