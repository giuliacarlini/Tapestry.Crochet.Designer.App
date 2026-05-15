import type { PaletteColor } from '../../core/pattern'
import type { EditorTool } from '../preview/PreviewGrid'
import shared from '../../ui/shared.module.css'
import s from './EditorToolbar.module.css'
import { cx } from '../../ui/cx'
import { Tooltip, ColorPicker } from '../../ui/primitives'

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
  return (
    <section className={cx(shared.panel, s.toolbarPanel)}>
      <h2>Ferramentas</h2>

      <div className={s.toolbarVertical}>
        <div className={s.toolTray}>
          <Tooltip content="Lapis">
            <button
              type="button"
              className={cx(s.toolIconButton, editorTool === 'paint' && s.activeTool)}
              onClick={() => onEditorToolChange('paint')}
              disabled={!canEdit}
              aria-label="Lapis"
            >
              <PencilIcon />
            </button>
          </Tooltip>
          <Tooltip content="Borracha">
            <button
              type="button"
              className={cx(s.toolIconButton, editorTool === 'erase' && s.activeTool)}
              onClick={() => onEditorToolChange('erase')}
              disabled={!canEdit}
              aria-label="Borracha"
            >
              <EraserIcon />
            </button>
          </Tooltip>
          <Tooltip content="Balde">
            <button
              type="button"
              className={cx(s.toolIconButton, editorTool === 'fill' && s.activeTool)}
              onClick={() => onEditorToolChange('fill')}
              disabled={!canEdit}
              aria-label="Balde"
            >
              <BucketIcon />
            </button>
          </Tooltip>
          <Tooltip content="Seletor">
            <button
              type="button"
              className={cx(s.toolIconButton, editorTool === 'picker' && s.activeTool)}
              onClick={() => onEditorToolChange('picker')}
              disabled={!canEdit}
              aria-label="Seletor"
            >
              <PickerIcon />
            </button>
          </Tooltip>
        </div>

        <div className={s.toolTray}>
          <Tooltip content="Desfazer">
            <button
              type="button"
              className={s.toolIconButton}
              onClick={onUndo}
              disabled={!canEdit || !canUndo}
              aria-label="Desfazer"
            >
              <UndoIcon />
            </button>
          </Tooltip>
          <Tooltip content="Refazer">
            <button
              type="button"
              className={s.toolIconButton}
              onClick={onRedo}
              disabled={!canEdit || !canRedo}
              aria-label="Refazer"
            >
              <RedoIcon />
            </button>
          </Tooltip>
        </div>
      </div>

      <p className={s.sectionLabel}>Paleta</p>
      <div className={s.paletteStrip} aria-label="Selecao rapida de cor">
        {palette.map((entry) => {
          const isActive = entry.id === paintColorIndex
          return (
            <Tooltip key={`toolbar-color-${entry.id}`} content={entry.hex}>
              <button
                type="button"
                className={cx(s.colorChip, isActive && s.colorChipActive)}
                style={{ backgroundColor: entry.hex }}
                onClick={() => onSelectPaintColor(entry.id)}
                disabled={!canEdit}
              />
            </Tooltip>
          )
        })}
      </div>

      <div className={s.activeColorRow}>
        <ColorPicker
          color={activeColorHex}
          onChange={onActiveColorHexChange}
          disabled={!canEdit}
        />
        <span className={s.activeColorHex}>{activeColorHex}</span>
      </div>
    </section>
  )
}
