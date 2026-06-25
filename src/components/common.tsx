import React from 'react'

export function StatRow({
  label,
  value,
  danger,
  warn,
  good,
  title,
}: {
  label: string
  value: React.ReactNode
  danger?: boolean
  warn?: boolean
  good?: boolean
  title?: string
}) {
  const color = danger ? '#f0908c' : warn ? '#e8c06a' : good ? '#7fe8b0' : undefined
  return (
    <div className="stat-row" title={title}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  )
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="panel-header flex items-center justify-between px-3 py-2 text-[11px]">
      <span>{children}</span>
      {right}
    </div>
  )
}

/** Числовой степпер: − [поле] + */
export function Stepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  className,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  className?: string
}) {
  const clamp = (v: number) => {
    let x = v
    if (min != null) x = Math.max(min, x)
    if (max != null) x = Math.min(max, x)
    return x
  }
  return (
    <div className={`flex items-stretch gap-1 ${className ?? ''}`}>
      <button className="btn px-2 py-0.5 leading-none" onClick={() => onChange(clamp(value - step))} title="Уменьшить">
        −
      </button>
      <input
        className="num-input w-20"
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
      />
      <button className="btn px-2 py-0.5 leading-none" onClick={() => onChange(clamp(value + step))} title="Увеличить">
        +
      </button>
    </div>
  )
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`panel blueprint max-h-[88vh] w-full overflow-hidden ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header flex items-center justify-between px-4 py-3">
          <span className="text-sm">{title}</span>
          <button className="btn btn-danger px-2 py-0.5" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="max-h-[78vh] overflow-auto p-4">{children}</div>
      </div>
    </div>
  )
}

export function Confirm({
  text,
  confirmLabel = 'Подтвердить',
  onConfirm,
  onCancel,
  danger,
}: {
  text: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  return (
    <Modal title="Подтверждение" onClose={onCancel}>
      <p className="mb-4 text-sm leading-relaxed text-slate-200">{text}</p>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>
          Отмена
        </button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-rune'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="chip" style={color ? { color, borderColor: color } : undefined}>
      {children}
    </span>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  )
}
