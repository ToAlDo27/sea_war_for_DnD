import type { CellType } from '../types'

export interface GridLayout {
  rows: number
  cols: number
  /** Количество основных (верхних) рядов — палуба+борта+киль. */
  mainRows: number
  types: CellType[][]
}

/**
 * Генерирует раскладку клеток корабля исходя из уровней расширений.
 *
 * Базовая сетка 4×4:
 *   [Нос]        [Палуба] [Палуба] [Корма]
 *   [Левый борт] [Центр]  [Центр]  [Правый борт]
 *   [Левый борт] [Центр]  [Центр]  [Правый борт]
 *   [Киль]       [Внутр.] [Внутр.] [Киль]
 *
 * - Длина добавляет средние ряды (корпус удлиняется).
 * - Ширина добавляет средние колонки (корпус расширяется).
 * - Этажность добавляет нижние ряды внутренних отсеков.
 */
export function generateGrid(lengthLevel: number, widthLevel: number, heightLevel: number): GridLayout {
  const mainRows = 4 + clampLevel(lengthLevel)
  const cols = 4 + clampLevel(widthLevel)
  const internalRows = clampLevel(heightLevel)
  const rows = mainRows + internalRows

  const types: CellType[][] = []
  for (let y = 0; y < rows; y++) {
    const row: CellType[] = []
    for (let x = 0; x < cols; x++) {
      row.push(cellTypeAt(x, y, cols, mainRows, rows))
    }
    types.push(row)
  }
  return { rows, cols, mainRows, types }
}

function clampLevel(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(5, Math.floor(n)))
}

function cellTypeAt(x: number, y: number, cols: number, mainRows: number, rows: number): CellType {
  // Нижние внутренние палубы (этажность)
  if (y >= mainRows) return 'Внутренний отсек'

  const lastMain = mainRows - 1
  if (y === 0) {
    // Носовой ряд
    if (x === 0) return 'Нос'
    if (x === cols - 1) return 'Корма'
    return 'Палуба'
  }
  if (y === lastMain) {
    // Килевой ряд
    if (x === 0 || x === cols - 1) return 'Киль'
    return 'Внутренний отсек'
  }
  // Средние ряды
  if (x === 0) return 'Левый борт'
  if (x === cols - 1) return 'Правый борт'
  return 'Центр'
}
