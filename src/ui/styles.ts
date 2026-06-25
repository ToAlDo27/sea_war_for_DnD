import type { Category, Rarity } from '../types'

export interface CatColor {
  base: string
  border: string
}

// Цвета категорий (тёмная морская палитра)
export const CATEGORY_COLORS: Record<Category, CatColor> = {
  weapon: { base: '#7f1d2e', border: '#d2483f' },
  command: { base: '#2f6b66', border: '#54b3aa' },
  generator: { base: '#4a2f7a', border: '#9166d6' },
  energy: { base: '#2f3f8f', border: '#5f78e0' },
  weapon_support: { base: '#6e2630', border: '#bf5a55' },
  storage: { base: '#5a3f24', border: '#a9803f' },
  anchor: { base: '#2c4a66', border: '#5f93c4' },
  defense: { base: '#37566f', border: '#6fa8cf' },
  movement: { base: '#256b3f', border: '#4fc07a' },
  repair: { base: '#8a4a1f', border: '#e0903f' },
  boarding: { base: '#5a1d22', border: '#bf4a44' },
  room: { base: '#454c57', border: '#8a96a4' },
  hull_upgrade: { base: '#3f5867', border: '#7fa6bd' },
  sails: { base: '#2f6b6b', border: '#5fc4c4' },
  expansion: { base: '#8a6d2f', border: '#e8c66a' },
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  very_rare: 'Очень редкий',
  legendary: 'Легендарный',
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9aa7b3',
  uncommon: '#4fae6a',
  rare: '#4f86d6',
  very_rare: '#b063d6',
  legendary: '#e0a93f',
}

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'very_rare', 'legendary']

// Короткие подписи типов клеток для отрисовки
export const CELL_SHORT: Record<string, string> = {
  Пусто: '',
  Нос: 'НОС',
  Корма: 'КОРМ',
  'Левый борт': 'ЛБ',
  'Правый борт': 'ПБ',
  Центр: 'ЦНТ',
  Киль: 'КИЛЬ',
  'Внутренний отсек': 'ВНУ',
  Палуба: 'ПАЛ',
}

// Цвет фона клетки по типу (чертёжный)
export const CELL_TINT: Record<string, string> = {
  Пусто: 'transparent',
  Нос: 'rgba(95, 179, 196, 0.10)',
  Корма: 'rgba(95, 179, 196, 0.10)',
  'Левый борт': 'rgba(176, 122, 60, 0.10)',
  'Правый борт': 'rgba(176, 122, 60, 0.10)',
  Центр: 'rgba(52, 226, 160, 0.06)',
  Киль: 'rgba(120, 140, 170, 0.14)',
  'Внутренний отсек': 'rgba(52, 226, 160, 0.10)',
  Палуба: 'rgba(140, 160, 180, 0.06)',
}

export function categoryBg(cat: Category, alpha = 0.85): string {
  const c = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.room
  return hexToRgba(c.base, alpha)
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
