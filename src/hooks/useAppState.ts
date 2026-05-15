import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { Area } from 'react-easy-crop'
import { extractCroppedImageData, floodFillCells, loadImageElement } from '../core/image'
import { createProject, deserializeProject, serializeProject } from '../core/project'
import {
  MAX_PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  PALETTE_SIZE,
  RESOLUTION_PRESETS,
  createPattern,
  type PaletteColor,
  type Pattern,
  type ResolutionPreset,
} from '../core/pattern'
import { runQuantizeWorker } from '../workers/quantizeClient'
import type { EditorTool } from '../features/preview/PreviewGrid'

export type AppStep = 'setup' | 'editor' | 'tracker'

export interface PatternSnapshot {
  palette: PaletteColor[]
  cells: number[]
}

function getResolutionByLabel(label: string): ResolutionPreset {
  return RESOLUTION_PRESETS.find((preset) => preset.label === label) ?? RESOLUTION_PRESETS[0]
}

function getResolutionLabel(width: number, height: number): string {
  const preset = RESOLUTION_PRESETS.find((entry) => entry.width === width && entry.height === height)
  return preset?.label ?? RESOLUTION_PRESETS[RESOLUTION_PRESETS.length - 1].label
}

function clampPaletteSize(value: number): number {
  if (!Number.isFinite(value)) {
    return PALETTE_SIZE
  }

  const rounded = Math.round(value)
  return Math.max(MIN_PALETTE_SIZE, Math.min(MAX_PALETTE_SIZE, rounded))
}

function snapshotPattern(pattern: Pattern): PatternSnapshot {
  return {
    palette: pattern.palette.map((entry) => ({ ...entry })),
    cells: [...pattern.cells],
  }
}

function restoreSnapshot(pattern: Pattern, snapshot: PatternSnapshot): Pattern {
  return {
    ...pattern,
    palette: snapshot.palette.map((entry) => ({ ...entry })),
    cells: [...snapshot.cells],
  }
}

function toSlug(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return 'tapestry-project'
  }

  return trimmed.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export interface UseAppStateReturn {
  step: AppStep
  setStep: (step: AppStep) => void

  imageUrl: string | null
  cropAreaPixels: Area | null

  title: string
  cleanIsolated: boolean
  resolutionLabel: string
  paletteSize: number
  selectedResolution: ResolutionPreset
  isSetupPreviewStale: boolean
  isProcessing: boolean
  errorMessage: string

  pattern: Pattern | null
  activePaletteIndex: number
  editorTool: EditorTool
  undoStack: PatternSnapshot[]
  redoStack: PatternSnapshot[]

  canEditPattern: boolean
  canGoToEditor: boolean
  activeColorIndex: number
  drawColorIndex: number
  activeColorHex: string

  projectInputRef: React.RefObject<HTMLInputElement>

  handleImageSelected: (imageUrl: string) => void
  handleGeneratePattern: () => Promise<void>
  handleCropAreaChange: (area: Area) => void
  handleTitleChange: (title: string) => void
  handleCleanToggle: (value: boolean) => void
  handleResolutionChange: (label: string) => void
  handlePaletteSizeChange: (value: number) => void

  handlePaintStroke: (indices: number[]) => void
  handleFillCell: (startIndex: number) => void
  handlePickCellColor: (index: number) => void
  handleSelectPaintColor: (paletteIndex: number) => void
  handleActiveColorHexChange: (hex: string) => void
  handleUndo: () => void
  handleRedo: () => void
  handlePaletteColorChange: (index: number, hex: string) => void
  handleReplacePaletteIndex: (fromIndex: number, toIndex: number) => void
  setActivePaletteIndex: (index: number) => void
  setEditorTool: (tool: EditorTool) => void

  handleDownloadProject: () => void
  handleOpenProjectClick: () => void
  handleProjectFileSelected: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function useAppState(): UseAppStateReturn {
  const [step, setStepRaw] = useState<AppStep>('setup')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropAreaPixels, setCropAreaPixels] = useState<Area | null>(null)
  const [title, setTitle] = useState('')
  const [cleanIsolated, setCleanIsolated] = useState(true)
  const [resolutionLabel, setResolutionLabel] = useState('150x150')
  const [paletteSize, setPaletteSize] = useState(PALETTE_SIZE)
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [activePaletteIndex, setActivePaletteIndex] = useState(0)
  const [editorTool, setEditorTool] = useState<EditorTool>('paint')
  const [undoStack, setUndoStack] = useState<PatternSnapshot[]>([])
  const [redoStack, setRedoStack] = useState<PatternSnapshot[]>([])
  const [isSetupPreviewStale, setIsSetupPreviewStale] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const imageUrlRef = useRef<string | null>(null)
  const projectInputRef = useRef<HTMLInputElement | null>(null)

  const selectedResolution = useMemo(() => getResolutionByLabel(resolutionLabel), [resolutionLabel])
  const canEditPattern = step === 'editor' && Boolean(pattern) && !isProcessing
  const canGoToEditor = Boolean(pattern) && !isSetupPreviewStale && !isProcessing
  const activeColorIndex =
    pattern && pattern.palette.length > 0
      ? Math.max(0, Math.min(pattern.palette.length - 1, activePaletteIndex))
      : 0
  const drawColorIndex = editorTool === 'erase' ? 0 : activeColorIndex
  const activeColorHex = pattern?.palette[activeColorIndex]?.hex ?? '#000000'

  const setStep = (next: AppStep) => {
    if (next === 'setup' && step !== 'setup') {
      setIsSetupPreviewStale(false)
    }
    setStepRaw(next)
  }

  const applyPatternEdit = (updater: (current: Pattern) => Pattern | null) => {
    if (!pattern) {
      return
    }

    const nextPattern = updater(pattern)
    if (!nextPattern) {
      return
    }

    setUndoStack((previous) => [...previous, snapshotPattern(pattern)])
    setRedoStack([])
    setPattern(nextPattern)
  }

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!pattern || pattern.palette.length === 0) {
      return
    }

    if (activePaletteIndex >= pattern.palette.length) {
      setActivePaletteIndex(0)
    }
  }, [activePaletteIndex, pattern])

  const handleImageSelected = (nextImageUrl: string) => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
    }

    imageUrlRef.current = nextImageUrl
    setImageUrl(nextImageUrl)
    setCropAreaPixels(null)
    setPattern(null)
    setUndoStack([])
    setRedoStack([])
    setActivePaletteIndex(0)
    setIsSetupPreviewStale(true)
    setErrorMessage('')
  }

  const handleGeneratePattern = async () => {
    if (!imageUrl) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const image = await loadImageElement(imageUrl)

      const effectiveCropArea = cropAreaPixels ?? {
        x: 0,
        y: 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }

      const cropped = extractCroppedImageData(image, effectiveCropArea)
      const nextPaletteSize = clampPaletteSize(paletteSize)

      const workerResult = await runQuantizeWorker({
        image: cropped,
        cleanIsolated,
        width: selectedResolution.width,
        height: selectedResolution.height,
        paletteSize: nextPaletteSize,
      })

      const nextPattern = createPattern(workerResult.palette, workerResult.cells, {
        title,
        config: {
          width: workerResult.width,
          height: workerResult.height,
          paletteSize: nextPaletteSize,
        },
      })

      setPaletteSize(nextPaletteSize)
      setPattern(nextPattern)
      setActivePaletteIndex(0)
      setEditorTool('paint')
      setUndoStack([])
      setRedoStack([])
      setIsSetupPreviewStale(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Nao foi possivel processar a imagem selecionada',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCropAreaChange = (area: Area) => {
    setCropAreaPixels(area)
    setIsSetupPreviewStale(true)
  }

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle)
    setIsSetupPreviewStale(true)
  }

  const handleCleanToggle = (value: boolean) => {
    setCleanIsolated(value)
    setIsSetupPreviewStale(true)
  }

  const handleResolutionChange = (label: string) => {
    setResolutionLabel(label)
    setIsSetupPreviewStale(true)
  }

  const handlePaletteSizeChange = (value: number) => {
    setPaletteSize(clampPaletteSize(value))
    setIsSetupPreviewStale(true)
  }

  const handlePaintStroke = (indices: number[]) => {
    applyPatternEdit((current) => {
      if (indices.length === 0) {
        return null
      }

      const colorIndex = Math.max(0, Math.min(current.palette.length - 1, drawColorIndex))
      const nextCells = [...current.cells]
      let changed = false

      for (const index of indices) {
        if (index < 0 || index >= nextCells.length) {
          continue
        }

        if (nextCells[index] !== colorIndex) {
          nextCells[index] = colorIndex
          changed = true
        }
      }

      if (!changed) {
        return null
      }

      return {
        ...current,
        cells: nextCells,
      }
    })
  }

  const handleFillCell = (startIndex: number) => {
    applyPatternEdit((current) => {
      if (startIndex < 0 || startIndex >= current.cells.length) {
        return null
      }

      const colorIndex = Math.max(0, Math.min(current.palette.length - 1, drawColorIndex))
      const nextCells = floodFillCells(
        current.cells,
        current.width,
        current.height,
        startIndex,
        colorIndex,
      )

      const changed = nextCells.some((cell, index) => cell !== current.cells[index])
      if (!changed) {
        return null
      }

      return {
        ...current,
        cells: nextCells,
      }
    })
  }

  const handlePickCellColor = (index: number) => {
    if (!pattern || index < 0 || index >= pattern.cells.length) {
      return
    }

    const nextIndex = pattern.cells[index]
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= pattern.palette.length) {
      return
    }

    setActivePaletteIndex(nextIndex)
    setEditorTool('paint')
  }

  const handleSelectPaintColor = (paletteIndex: number) => {
    if (!pattern || paletteIndex < 0 || paletteIndex >= pattern.palette.length) {
      return
    }

    setActivePaletteIndex(paletteIndex)
    if (editorTool === 'picker') {
      setEditorTool('paint')
    }
  }

  const handlePaletteColorChange = (index: number, hex: string) => {
    const normalizedHex = hex.toUpperCase()

    applyPatternEdit((current) => {
      if (index < 0 || index >= current.palette.length) {
        return null
      }

      if (current.palette[index].hex === normalizedHex) {
        return null
      }

      const nextPalette = current.palette.map((entry) => ({ ...entry }))
      nextPalette[index] = {
        ...nextPalette[index],
        hex: normalizedHex,
      }

      return {
        ...current,
        palette: nextPalette,
      }
    })
  }

  const handleActiveColorHexChange = (hex: string) => {
    if (!pattern || pattern.palette.length === 0) {
      return
    }

    handlePaletteColorChange(activeColorIndex, hex)
  }

  const handleUndo = () => {
    if (!pattern || undoStack.length === 0) {
      return
    }

    const previous = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, snapshotPattern(pattern)])
    setPattern(restoreSnapshot(pattern, previous))
  }

  const handleRedo = () => {
    if (!pattern || redoStack.length === 0) {
      return
    }

    const next = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack, snapshotPattern(pattern)])
    setPattern(restoreSnapshot(pattern, next))
  }

  const handleReplacePaletteIndex = (fromIndex: number, toIndex: number) => {
    applyPatternEdit((current) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= current.palette.length ||
        toIndex >= current.palette.length
      ) {
        return null
      }

      const nextCells = current.cells.map((cell) => (cell === fromIndex ? toIndex : cell))
      const changed = nextCells.some((cell, index) => cell !== current.cells[index])
      if (!changed) {
        return null
      }

      return {
        ...current,
        cells: nextCells,
      }
    })

    if (activePaletteIndex === fromIndex) {
      setActivePaletteIndex(toIndex)
    }
  }

  const handleDownloadProject = () => {
    if (!pattern) {
      return
    }

    const project = createProject({
      pattern,
      cleanIsolated,
      name: title || pattern.metadata.title,
    })

    const json = serializeProject(project)
    const blob = new Blob([json], { type: 'application/json' })
    const fileUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    const fileName = toSlug(project.metadata.name ?? 'tapestry-project')

    anchor.href = fileUrl
    anchor.download = `${fileName}.tcdp.json`
    anchor.click()
    URL.revokeObjectURL(fileUrl)
  }

  const handleOpenProjectClick = () => {
    projectInputRef.current?.click()
  }

  const handleProjectFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const project = deserializeProject(await file.text())

      setPattern(project.pattern)
      setTitle(project.settings.title ?? project.pattern.metadata.title ?? '')
      setCleanIsolated(project.settings.cleanIsolated)
      setPaletteSize(project.settings.paletteSize)
      setResolutionLabel(getResolutionLabel(project.settings.width, project.settings.height))
      setActivePaletteIndex(0)
      setEditorTool('paint')
      setUndoStack([])
      setRedoStack([])
      setIsSetupPreviewStale(false)
      setErrorMessage('')
      setStepRaw('editor')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel abrir o projeto selecionado')
    }
  }

  return {
    step,
    setStep,
    imageUrl,
    cropAreaPixels,
    title,
    cleanIsolated,
    resolutionLabel,
    paletteSize,
    selectedResolution,
    isSetupPreviewStale,
    isProcessing,
    errorMessage,
    pattern,
    activePaletteIndex,
    editorTool,
    undoStack,
    redoStack,
    canEditPattern,
    canGoToEditor,
    activeColorIndex,
    drawColorIndex,
    activeColorHex,
    projectInputRef,
    handleImageSelected,
    handleGeneratePattern,
    handleCropAreaChange,
    handleTitleChange,
    handleCleanToggle,
    handleResolutionChange,
    handlePaletteSizeChange,
    handlePaintStroke,
    handleFillCell,
    handlePickCellColor,
    handleSelectPaintColor,
    handleActiveColorHexChange,
    handleUndo,
    handleRedo,
    handlePaletteColorChange,
    handleReplacePaletteIndex,
    setActivePaletteIndex,
    setEditorTool,
    handleDownloadProject,
    handleOpenProjectClick,
    handleProjectFileSelected,
  }
}
