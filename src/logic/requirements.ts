export interface ReqContext {
  bestGeneratorLevel: number // максимальный уровень среди РАБОЧИХ генераторов (0 — нет)
  lengthLevel: number
  widthLevel: number
  heightLevel: number
}

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 }

function parseLevel(s: string): number | null {
  const m = s.match(/([0-9]+)/)
  if (m) return parseInt(m[1], 10)
  const r = s.match(/\b(i{1,3}|iv|vi?|v)\b/i)
  if (r) return ROMAN[r[1].toLowerCase()] ?? null
  return null
}

/** Проверяет одно требование. Возвращает выполнено ли и текст ошибки. */
export function checkRequirement(req: string, ctx: ReqContext): { met: boolean; error?: string } {
  const low = req.toLowerCase()

  if (low.includes('генератор')) {
    const lvl = parseLevel(low)
    if (lvl && lvl > 1) {
      if (ctx.bestGeneratorLevel >= lvl) return { met: true }
      return { met: false, error: `Нужен генератор уровня ${lvl}+` }
    }
    if (ctx.bestGeneratorLevel >= 1) return { met: true }
    return { met: false, error: 'Нужен генератор' }
  }

  if (low.includes('ширин')) {
    const lvl = parseLevel(low) ?? 1
    if (ctx.widthLevel >= lvl) return { met: true }
    return { met: false, error: `Нужна ширина ${lvl}+` }
  }

  if (low.includes('длин')) {
    const lvl = parseLevel(low) ?? 1
    if (ctx.lengthLevel >= lvl) return { met: true }
    return { met: false, error: `Нужна длина ${lvl}+` }
  }

  if (low.includes('этаж')) {
    const lvl = parseLevel(low) ?? 1
    if (ctx.heightLevel >= lvl) return { met: true }
    return { met: false, error: `Нужна этажность ${lvl}+` }
  }

  // Неизвестное требование считаем выполненным (не блокируем).
  return { met: true }
}

/** Требует ли модуль наличие генератора (для подсветки энергии). */
export function requiresGenerator(requirements?: string[]): boolean {
  return !!requirements?.some((r) => r.toLowerCase().includes('генератор'))
}
