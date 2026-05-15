import { useCallback, useEffect, useMemo, useRef, type PointerEvent } from 'react'
import type { PaletteColor } from '../core/pattern'
import shared from './shared.module.css'
import s from './PreviewGrid.module.css'
import { cx } from './cx'

export type EditorTool = 'paint' | 'erase' | 'fill' | 'picker'

interface PreviewGridProps {
  width: number
  height: number
  cells: number[]
  palette: PaletteColor[]
  zoom?: number
  showGrid?: boolean
  canEdit?: boolean
  editorTool?: EditorTool
  onPaintStroke?: (indices: number[]) => void
  onFillCell?: (index: number) => void
  onPickCellColor?: (index: number) => void
}

function getCellIndexFromPointer(
  event: PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  zoom: number,
): number | null {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const cellX = Math.floor(x / zoom)
  const cellY = Math.floor(y / zoom)

  if (cellX < 0 || cellX >= width || cellY < 0 || cellY >= height) {
    return null
  }

  return cellY * width + cellX
}

export function PreviewGrid({
  width,
  height,
  cells,
  palette,
  zoom = 4,
  showGrid = true,
  canEdit = false,
  editorTool = 'paint',
  onPaintStroke = () => {},
  onFillCell = () => {},
  onPickCellColor = () => {},
}: PreviewGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const strokeIndicesRef = useRef<Set<number>>(new Set())
  const hasPattern = cells.length > 0 && palette.length > 0

  const paletteHex = useMemo(() => palette.map((entry) => entry.hex), [palette])

  const commitStroke = useCallback(() => {
    if (!isDrawingRef.current) {
      return
    }

    isDrawingRef.current = false

    if (strokeIndicesRef.current.size === 0) {
      return
    }

    onPaintStroke(Array.from(strokeIndicesRef.current))
    strokeIndicesRef.current.clear()
  }, [onPaintStroke])

  useEffect(() => {
    const handlePointerUp = () => {
      commitStroke()
    }

    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  }, [commitStroke])

  useEffect(() => {
    if (!hasPattern || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

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

  }, [cells, hasPattern, height, paletteHex, showGrid, width, zoom])

  const canvasClassName = canEdit
    ? cx(
        s.editableCanvas,
        editorTool === 'fill' && s.toolFill,
        editorTool === 'picker' && s.toolPicker,
      )
    : undefined

  return (
    <div className={s.canvasContainer}>
      {!hasPattern ? (
        <p className={shared.hint}>Gere um padrao para visualizar o grid.</p>
      ) : (
        <div className={shared.canvasWrap}>
          <canvas
            ref={canvasRef}
            className={canvasClassName}
            onPointerDown={(event) => {
              if (!canEdit || !canvasRef.current) {
                return
              }

              const index = getCellIndexFromPointer(event, canvasRef.current, width, height, zoom)
              if (index === null) {
                return
              }

              if (editorTool === 'fill') {
                onFillCell(index)
                return
              }

              if (editorTool === 'picker') {
                onPickCellColor(index)
                return
              }

              isDrawingRef.current = true
              strokeIndicesRef.current.clear()
              strokeIndicesRef.current.add(index)
            }}
            onPointerMove={(event) => {
              if (!canEdit || !isDrawingRef.current || !canvasRef.current) {
                return
              }

              const index = getCellIndexFromPointer(event, canvasRef.current, width, height, zoom)
              if (index === null) {
                return
              }

              strokeIndicesRef.current.add(index)
            }}
            onPointerLeave={() => {
              commitStroke()
            }}
          />
        </div>
      )}
    </div>
  )
}
