import { useRef } from 'react'
import type { PaletteColor } from '../core/pattern'
import type { EditorTool } from './PreviewGrid'

interface EditorToolbarProps {
  editorTool: EditorTool
  canEdit: boolean
  canUndo: boolean
  canRedo: boolean
  palette: PaletteColor[]
  paintColorIndex: number
  activeColorHex: string
  onEditorToolChange: (tool: EditorTool) => void
  onUndo: () => void
  onRedo: () => void
  onSelectPaintColor: (paletteIndex: number) => void
  onActiveColorHexChange: (hex: string) => void
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l4-1 10-10-3-3L5 16l-1 4z" />
      <path d="M13 6l3 3" />
    </svg>
  )
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 15l7-8a2 2 0 013 0l8 8a2 2 0 010 3l-3 3H9l-6-6a2 2 0 010-3z" />
      <path d="M10 21h10" />
    </svg>
  )
}

function BucketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10l7-7 7 7-7 7-7-7z" />
      <path d="M14 14h6" />
      <path d="M17 14a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function PickerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4l6 6" />
      <path d="M8 10l6-6 6 6-6 6-6-6z" />
      <path d="M7 13l-3 7 7-3" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 7l-5 5 5 5" />
      <path d="M4 12h9a7 7 0 110 14" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 7l5 5-5 5" />
      <path d="M20 12h-9a7 7 0 100 14" />
    </svg>
  )
}

export function EditorToolbar({
  editorTool,
  canEdit,
  canUndo,
  canRedo,
  palette,
  paintColorIndex,
  activeColorHex,
  onEditorToolChange,
  onUndo,
  onRedo,
  onSelectPaintColor,
  onActiveColorHexChange,
}: EditorToolbarProps) {
  const colorInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <section className="panel editor-toolbar-panel">
      <h2>Ferramentas</h2>

      <div className="editor-toolbar editor-toolbar-vertical">
        <button
          type="button"
          className={`tool-icon-button has-tooltip ${editorTool === 'paint' ? 'active-tool' : ''}`}
          onClick={() => onEditorToolChange('paint')}
          disabled={!canEdit}
          aria-label="Lapis"
          data-tooltip="Lapis"
        >
          <PencilIcon />
          <span className="sr-only">Lapis</span>
        </button>
        <button
          type="button"
          className={`tool-icon-button has-tooltip ${editorTool === 'erase' ? 'active-tool' : ''}`}
          onClick={() => onEditorToolChange('erase')}
          disabled={!canEdit}
          aria-label="Borracha"
          data-tooltip="Borracha"
        >
          <EraserIcon />
          <span className="sr-only">Borracha</span>
        </button>
        <button
          type="button"
          className={`tool-icon-button has-tooltip ${editorTool === 'fill' ? 'active-tool' : ''}`}
          onClick={() => onEditorToolChange('fill')}
          disabled={!canEdit}
          aria-label="Balde"
          data-tooltip="Balde"
        >
          <BucketIcon />
          <span className="sr-only">Balde</span>
        </button>
        <button
          type="button"
          className={`tool-icon-button has-tooltip ${editorTool === 'picker' ? 'active-tool' : ''}`}
          onClick={() => onEditorToolChange('picker')}
          disabled={!canEdit}
          aria-label="Seletor"
          data-tooltip="Seletor"
        >
          <PickerIcon />
          <span className="sr-only">Seletor</span>
        </button>

        <hr className="toolbar-divider" />

        <button
          type="button"
          className="tool-icon-button has-tooltip"
          onClick={onUndo}
          disabled={!canEdit || !canUndo}
          aria-label="Desfazer"
          data-tooltip="Desfazer"
        >
          <UndoIcon />
          <span className="sr-only">Desfazer</span>
        </button>
        <button
          type="button"
          className="tool-icon-button has-tooltip"
          onClick={onRedo}
          disabled={!canEdit || !canRedo}
          aria-label="Refazer"
          data-tooltip="Refazer"
        >
          <RedoIcon />
          <span className="sr-only">Refazer</span>
        </button>
      </div>

      <p className="toolbar-section-label">Paleta</p>
      <div className="toolbar-palette" aria-label="Selecao rapida de cor">
        {palette.map((entry) => {
          const isActive = entry.id === paintColorIndex
          return (
            <button
              key={`toolbar-color-${entry.id}`}
              type="button"
              className={`toolbar-color-chip has-tooltip ${isActive ? 'toolbar-color-chip-active' : ''}`}
              style={{ backgroundColor: entry.hex }}
              data-tooltip={entry.hex}
              onClick={() => onSelectPaintColor(entry.id)}
              disabled={!canEdit}
            />
          )
        })}
      </div>

      <div
        className="active-color-swatch-row"
        onClick={() => {
          if (canEdit) colorInputRef.current?.click()
        }}
      >
        <span
          className="active-color-swatch has-tooltip"
          data-tooltip="Clique para editar a cor ativa"
          style={{ backgroundColor: activeColorHex }}
        />
        <span className="active-color-hex">{activeColorHex}</span>
        <input
          ref={colorInputRef}
          type="color"
          value={activeColorHex}
          onChange={(event) => onActiveColorHexChange(event.target.value)}
          disabled={!canEdit}
          className="sr-only-color-input"
        />
      </div>
    </section>
  )
}
