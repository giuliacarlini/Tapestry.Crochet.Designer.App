import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PaletteColor } from '../core/pattern'
import shared from './shared.module.css'
import s from './RowTracker.module.css'
import { cx } from './cx'
import { Slider, Switch } from './primitives'

interface RowTrackerProps {
  width: number
  height: number
  cells: number[]
  palette: PaletteColor[]
  title?: string
  onBack?: () => void
}

export function RowTracker({ width, height, cells, palette, title, onBack }: RowTrackerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gridAreaRef = useRef<HTMLDivElement | null>(null)

  const storageKey = useMemo(() => {
    const id = `${title ?? ''}-${width}x${height}-${cells.slice(0, 20).join(',')}`
    return `tracker-row:${id}`
  }, [title, width, height, cells])

  const [currentRow, setCurrentRow] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? Math.min(Number(saved), height - 1) : 0
  })
  const [zoom, setZoom] = useState(8)
  const [showGrid, setShowGrid] = useState(true)

  useEffect(() => {
    localStorage.setItem(storageKey, String(currentRow))
  }, [storageKey, currentRow])

  const hasPattern = cells.length > 0 && palette.length > 0
  const paletteHex = useMemo(() => palette.map((entry) => entry.hex), [palette])

  const gutterRows = useMemo(() => {
    const rows: { crochetRow: number; gridY: number; arrow: string }[] = []
    for (let gridY = 0; gridY < height; gridY++) {
      const crochetRow = height - gridY
      const arrow = crochetRow % 2 === 1 ? '\u2192' : '\u2190'
      rows.push({ crochetRow, gridY, arrow })
    }
    return rows
  }, [height])

  const labelInterval = zoom < 6 ? 0 : zoom < 8 ? 10 : zoom < 10 ? 5 : zoom < 14 ? 2 : 1
  const gutterFontSize = Math.max(6, Math.min(zoom * 0.75, zoom - 1, 14))
  const activeGridY = height - 1 - currentRow

  const advanceRow = useCallback(() => {
    setCurrentRow((r) => Math.min(height - 1, r + 1))
  }, [height])

  const retreatRow = useCallback(() => {
    setCurrentRow((r) => Math.max(0, r - 1))
  }, [])

  useEffect(() => {
    if (!hasPattern || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const pixelSize = zoom
    canvas.width = width * pixelSize
    canvas.height = height * pixelSize
    context.imageSmoothingEnabled = false

    for (let index = 0; index < cells.length; index += 1) {
      const x = index % width
      const y = Math.floor(index / width)
      const paletteIndex = cells[index]
      const color = paletteHex[paletteIndex] ?? '#000000'

      context.fillStyle = color
      context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }

    if (showGrid && pixelSize >= 3) {
      context.strokeStyle = 'rgba(14, 10, 24, 0.15)'
      context.lineWidth = 1

      for (let x = 0; x <= width; x += 1) {
        const lineX = x * pixelSize + 0.5
        context.beginPath()
        context.moveTo(lineX, 0)
        context.lineTo(lineX, height * pixelSize)
        context.stroke()
      }

      for (let y = 0; y <= height; y += 1) {
        const lineY = y * pixelSize + 0.5
        context.beginPath()
        context.moveTo(0, lineY)
        context.lineTo(width * pixelSize, lineY)
        context.stroke()
      }
    }

    context.fillStyle = 'rgba(0, 0, 0, 0.45)'
    for (let row = 0; row < height; row += 1) {
      if (row !== activeGridY) {
        context.fillRect(0, row * pixelSize, width * pixelSize, pixelSize)
      }
    }
    context.strokeStyle = '#f0a040'
    context.lineWidth = 2
    context.strokeRect(1, activeGridY * pixelSize + 1, width * pixelSize - 2, pixelSize - 2)

    if (pixelSize >= 8) {
      const fontSize = Math.max(7, Math.min(pixelSize * 0.6, 20))
      context.font = `bold ${fontSize}px sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const rowStart = activeGridY * width
      let x = 0
      while (x < width) {
        const colorIndex = cells[rowStart + x]
        let groupLen = 1
        while (x + groupLen < width && cells[rowStart + x + groupLen] === colorIndex) {
          groupLen += 1
        }
        const hex = paletteHex[colorIndex] ?? '#000000'
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        const lum = (r * 299 + g * 587 + b * 114) / 1000
        context.fillStyle = lum > 140 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)'

        const label = String(groupLen)
        for (let i = 0; i < groupLen; i += 1) {
          const cellCx = (x + i) * pixelSize + pixelSize / 2
          const cy = activeGridY * pixelSize + pixelSize / 2
          context.fillText(label, cellCx, cy)
        }
        x += groupLen
      }
    }
  }, [cells, hasPattern, height, paletteHex, showGrid, width, zoom, activeGridY])

  useEffect(() => {
    if (!canvasRef.current) return
    const scrollTarget = activeGridY * zoom
    const wrap = gridAreaRef.current
    if (wrap) {
      wrap.scrollTo({ top: Math.max(0, scrollTarget - wrap.clientHeight / 2), behavior: 'smooth' })
    }
  }, [activeGridY, zoom])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault()
        advanceRow()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault()
        retreatRow()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [advanceRow, retreatRow])

  if (!hasPattern) {
    return (
      <section className={shared.panel}>
        <p className={shared.hint}>Nenhum padrao carregado para acompanhamento.</p>
        {onBack && <button type="button" onClick={onBack}>Voltar ao editor</button>}
      </section>
    )
  }

  return (
    <section className={s.trackerPage}>
      <header className={s.trackerHeader}>
        {onBack && (
          <button type="button" onClick={onBack}>
            &larr; Voltar ao editor
          </button>
        )}
        <h2>{title || 'Acompanhamento'}</h2>
        <span className={s.rowIndicator}>
          Linha {currentRow + 1} de {height}
        </span>
      </header>

      <div className={s.controls}>
        <div className={shared.rangeRow}>
          <span>Zoom da grade</span>
          <Slider min={2} max={24} step={1} value={zoom} onChange={setZoom} aria-label="Zoom da grade" />
        </div>

        <div className={shared.checkboxRow}>
          <Switch checked={showGrid} onChange={setShowGrid} aria-label="Mostrar linhas da grade" />
          <span>Mostrar linhas da grade</span>
        </div>
      </div>

      <div className={s.gridArea} ref={gridAreaRef}>
        <div className={s.rowGutter}>
          {gutterRows.map(({ crochetRow, gridY, arrow }) => {
            const isActive = gridY === activeGridY
            const showLabel = isActive || (labelInterval > 0 && crochetRow % labelInterval === 0)
            return (
              <div
                key={gridY}
                className={cx(s.gutterRow, isActive && s.gutterRowActive)}
                style={{ height: zoom, fontSize: gutterFontSize }}
              >
                {showLabel && (
                  <>
                    <span>{arrow}</span>
                    <span>{crochetRow}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className={s.canvasWrap}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      <nav className={s.nav}>
        <button type="button" disabled={currentRow <= 0} onClick={retreatRow}>
          &lt; Anterior
        </button>
        <span className={s.rowIndicator}>
          Linha {currentRow + 1} de {height}
        </span>
        <button type="button" disabled={currentRow >= height - 1} onClick={advanceRow}>
          Pr&oacute;xima &gt;
        </button>
      </nav>
    </section>
  )
}
