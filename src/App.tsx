import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { Area } from 'react-easy-crop'
import './App.css'
import { extractCroppedImageData, floodFillCells, loadImageElement } from './core/image'
import { createProject, deserializeProject, serializeProject } from './core/project'
import {
  MAX_PALETTE_SIZE,
  MIN_PALETTE_SIZE,
  PALETTE_SIZE,
  RESOLUTION_PRESETS,
  createPattern,
  type PaletteColor,
  type Pattern,
  type ResolutionPreset,
} from './core/pattern'
import { runQuantizeWorker } from './workers/quantizeClient'
import { Controls, Cropper, EditorToolbar, Export, PaletteView, PreviewGrid, RowTracker, Upload } from './ui'
import type { EditorTool } from './ui/PreviewGrid'
type AppStep = 'setup' | 'editor' | 'tracker'

interface PatternSnapshot {
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

function App() {
  const [step, setStep] = useState<AppStep>('setup')
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
      setStep('editor')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel abrir o projeto selecionado')
    }
  }

  const handleBackToSetup = () => {
    setIsSetupPreviewStale(false)
    setStep('setup')
  }

  const handleGoToTracker = () => {
    if (!pattern) return
    setStep('tracker')
  }

  const handleBackFromTracker = () => {
    setStep('editor')
  }

  const handleGoToEditor = () => {
    if (!canGoToEditor) {
      return
    }

    setStep('editor')
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Tapestry Crochet Designer</p>
        <h1>MVP Fase 1</h1>
        <p>
          Fluxo em duas etapas: primeiro voce importa e configura o padrao, depois edita e salva o projeto.
        </p>
        <p className="step-pill">
          {step === 'setup'
            ? 'Etapa 1: Setup'
            : step === 'editor'
              ? 'Etapa 2: Editor'
              : 'Acompanhamento'}
        </p>
      </header>

      <input
        ref={projectInputRef}
        type="file"
        accept=".json,.tcdp.json,application/json"
        onChange={handleProjectFileSelected}
        className="hidden-input"
      />

      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

      {step === 'setup' ? (
        <section className="layout">
          <div className="column">
            <section className="panel">
              <h2>Projeto</h2>
              <div className="action-row">
                <button type="button" onClick={handleOpenProjectClick}>
                  Abrir projeto salvo
                </button>
              </div>
              <p className="hint">
                Use um arquivo `.tcdp.json` para continuar uma edicao existente sem perder alteracoes.
              </p>
            </section>

            <Upload onImageSelected={handleImageSelected} />

            {imageUrl ? (
              <Cropper
                imageSrc={imageUrl}
                onCropAreaChange={(area) => {
                  setCropAreaPixels(area)
                  setIsSetupPreviewStale(true)
                }}
              />
            ) : (
              <section className="panel">
                <h2>2. Crop e Zoom</h2>
                <p className="hint">Selecione uma imagem para ativar o cropper.</p>
              </section>
            )}

            <Controls
              title={title}
              cleanIsolated={cleanIsolated}
              canGenerate={Boolean(imageUrl)}
              isProcessing={isProcessing}
              actionLabel={`Gerar preview (${selectedResolution.label})`}
              resolutionOptions={RESOLUTION_PRESETS}
              selectedResolution={resolutionLabel}
              paletteSize={paletteSize}
              onTitleChange={(nextTitle) => {
                setTitle(nextTitle)
                setIsSetupPreviewStale(true)
              }}
              onCleanToggle={(value) => {
                setCleanIsolated(value)
                setIsSetupPreviewStale(true)
              }}
              onResolutionChange={(nextResolution) => {
                setResolutionLabel(nextResolution)
                setIsSetupPreviewStale(true)
              }}
              onPaletteSizeChange={(value) => {
                setPaletteSize(clampPaletteSize(value))
                setIsSetupPreviewStale(true)
              }}
              onGenerate={handleGeneratePattern}
            />

            {isProcessing ? <div className="loading">Processando no Web Worker...</div> : null}
          </div>

          <div className="column">
            {imageUrl ? (
              <section className="panel">
                <h2>Preview da imagem</h2>
                <img src={imageUrl} alt="Preview da imagem selecionada" className="setup-image-preview" />
              </section>
            ) : null}

            <section className="panel">
              <h2>Preview antes do editor</h2>
              {!pattern ? (
                <p className="hint">Gere um preview para conferir o resultado antes de entrar no editor.</p>
              ) : (
                <>
                  <div className="action-row">
                    <button type="button" onClick={handleGoToEditor} disabled={!canGoToEditor}>
                      Ir para editor
                    </button>
                  </div>
                  {isSetupPreviewStale ? (
                    <p className="hint">
                      O preview ficou desatualizado. Gere novamente para entrar no editor com os ajustes atuais.
                    </p>
                  ) : (
                    <p className="hint">Preview atualizado. Voce pode seguir para o editor.</p>
                  )}
                </>
              )}
            </section>

            {pattern ? (
              <>
                <PreviewGrid
                  width={pattern.width}
                  height={pattern.height}
                  cells={pattern.cells}
                  palette={pattern.palette}
                />
                <PaletteView
                  palette={pattern.palette}
                  paletteSize={pattern.palette.length}
                  activePaletteIndex={0}
                  cells={pattern.cells}
                  showEditControls={false}
                />
              </>
            ) : null}
          </div>
        </section>
      ) : step === 'editor' ? (
        <section className="layout layout-editor">
          <div className="column">
            <section className="panel">
              <h2>Projeto</h2>
              <div className="action-row">
                <button type="button" onClick={handleDownloadProject} disabled={!pattern}>
                  Salvar projeto
                </button>
                <button type="button" onClick={handleOpenProjectClick}>
                  Abrir projeto
                </button>
                <button type="button" onClick={handleBackToSetup}>
                  Voltar para setup
                </button>
                <button type="button" onClick={handleGoToTracker} disabled={!pattern}>
                  Modo acompanhamento
                </button>
              </div>
              <p className="hint">
                O projeto salvo preserva dimensoes, paleta, celulas editadas e metadados para continuar depois.
              </p>
            </section>

            <Export pattern={pattern} />
          </div>

          <div className="column">
            <PreviewGrid
              width={pattern?.width ?? selectedResolution.width}
              height={pattern?.height ?? selectedResolution.height}
              cells={pattern?.cells ?? []}
              palette={pattern?.palette ?? []}
              canEdit={canEditPattern}
              editorTool={editorTool}
              onPaintStroke={handlePaintStroke}
              onFillCell={handleFillCell}
              onPickCellColor={handlePickCellColor}
            />
          </div>

          <div className="column">
            <EditorToolbar
              editorTool={editorTool}
              canEdit={canEditPattern}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              palette={pattern?.palette ?? []}
              paintColorIndex={activeColorIndex}
              activeColorHex={activeColorHex}
              onEditorToolChange={setEditorTool}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSelectPaintColor={handleSelectPaintColor}
              onActiveColorHexChange={handleActiveColorHexChange}
            />
            <PaletteView
              palette={pattern?.palette ?? []}
              paletteSize={pattern?.palette.length ?? paletteSize}
              activePaletteIndex={activePaletteIndex}
              cells={pattern?.cells ?? []}
              canEdit={canEditPattern}
              onSelectPaletteIndex={setActivePaletteIndex}
              onPaletteColorChange={handlePaletteColorChange}
              onReplacePaletteIndex={handleReplacePaletteIndex}
            />
          </div>
        </section>
      ) : step === 'tracker' && pattern ? (
        <RowTracker
          width={pattern.width}
          height={pattern.height}
          cells={pattern.cells}
          palette={pattern.palette}
          title={title || pattern.metadata.title}
          onBack={handleBackFromTracker}
        />
      ) : null}

      <footer className="footer-note">
        Formato selecionado: {selectedResolution.label}, {paletteSize} cores.
      </footer>
    </main>
  )
}

export default App
