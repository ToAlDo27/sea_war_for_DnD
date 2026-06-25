import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

interface DnDValue {
  draggingId: string | null
  hover: { x: number; y: number } | null
  startDrag: (id: string) => void
  endDrag: () => void
  setHover: (c: { x: number; y: number } | null) => void
}

const DnDContext = createContext<DnDValue | null>(null)

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)

  const startDrag = useCallback((id: string) => setDraggingId(id), [])
  const endDrag = useCallback(() => {
    setDraggingId(null)
    setHover(null)
  }, [])

  const value = useMemo<DnDValue>(
    () => ({ draggingId, hover, startDrag, endDrag, setHover }),
    [draggingId, hover, startDrag, endDrag],
  )
  return <DnDContext.Provider value={value}>{children}</DnDContext.Provider>
}

export function useDnD(): DnDValue {
  const ctx = useContext(DnDContext)
  if (!ctx) throw new Error('useDnD вне DnDProvider')
  return ctx
}

export const DRAG_MIME = 'application/x-ship-module'
