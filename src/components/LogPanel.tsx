import { useStore } from '../state/store'
import { SectionTitle } from './common'
import type { LogEntry } from '../types'

const KIND_COLOR: Record<LogEntry['kind'], string> = {
  info: '#8aa0b4',
  buy: '#e8c66a',
  build: '#34e2a0',
  warn: '#e8c06a',
  error: '#e0524d',
  system: '#5fb3c4',
}

export default function LogPanel() {
  const { state } = useStore()
  const entries = [...state.log].slice(-40).reverse()
  return (
    <div className="panel">
      <SectionTitle>Журнал событий</SectionTitle>
      <div className="min-h-40 max-h-[38vh] space-y-1 overflow-auto p-3">
        {entries.map((e) => (
          <div key={e.id} className="flex gap-2 text-[11px]">
            <span className="shrink-0 text-slate-600">{new Date(e.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
            <span style={{ color: KIND_COLOR[e.kind] }}>{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
