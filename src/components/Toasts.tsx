import { useStore } from '../state/store'
import type { ToastKind } from '../state/store'

const COLORS: Record<ToastKind, string> = {
  info: '#5fb3c4',
  success: '#34e2a0',
  error: '#e0524d',
  warn: '#e8c06a',
}

export default function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="panel pointer-events-auto min-w-[200px] cursor-pointer px-3 py-2 text-[12px] shadow-lg"
          style={{ borderColor: COLORS[t.kind], color: COLORS[t.kind], boxShadow: `0 0 12px ${COLORS[t.kind]}55` }}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
