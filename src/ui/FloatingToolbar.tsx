import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { PaletteColor } from '../core/pattern'
import type { EditorTool } from './PreviewGrid'
import s from './FloatingToolbar.module.css'
import { Tooltip, Slider, Switch, ColorPicker } from './primitives'

interface FloatingToolbarProps {
  editorTool: EditorTool
  canEdit: boolean
  canUndo: boolean
  canRedo: boolean
  zoom: number
  showGrid: boolean
  palette: PaletteColor[]
  paintColorIndex: number
  activeColorHex: string
  onEditorToolChange: (tool: EditorTool) => void
  onUndo: () => void
  onRedo: () => void
  onZoomChange: (zoom: number) => void
  onShowGridChange: (show: boolean) => void
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

export function FloatingToolbar({
  editorTool,
  canEdit,
  canUndo,
  canRedo,
  zoom,
  showGrid,
  palette,
  paintColorIndex,
  activeColorHex,
  onEditorToolChange,
  onUndo,
  onRedo,
  onZoomChange,
  onShowGridChange,
  onSelectPaintColor,
  onActiveColorHexChange,
}: FloatingToolbarProps) {
  return (
    <div className={s.toolbar} role="toolbar" aria-label="Ferramentas do editor">
      {/* Tool selector */}
      <div className={s.group}>
        <ToggleGroup.Root
          type="single"
          value={editorTool}
          onValueChange={(value) => {
            if (value) onEditorToolChange(value as EditorTool)
          }}
          className={s.toggleGroup}
          aria-label="Ferramenta ativa"
          disabled={!canEdit}
        >
          <Tooltip content="Lapis (P)">
            <ToggleGroup.Item value="paint" className={s.toolBtn} aria-label="Lapis">
              <PencilIcon />
            </ToggleGroup.Item>
          </Tooltip>
          <Tooltip content="Borracha (E)">
            <ToggleGroup.Item value="erase" className={s.toolBtn} aria-label="Borracha">
              <EraserIcon />
            </ToggleGroup.Item>
          </Tooltip>
          <Tooltip content="Balde (B)">
            <ToggleGroup.Item value="fill" className={s.toolBtn} aria-label="Balde">
              <BucketIcon />
            </ToggleGroup.Item>
          </Tooltip>
          <Tooltip content="Seletor (I)">
            <ToggleGroup.Item value="picker" className={s.toolBtn} aria-label="Seletor">
              <PickerIcon />
            </ToggleGroup.Item>
          </Tooltip>
        </ToggleGroup.Root>
      </div>

      <div className={s.separator} />

      {/* Undo / Redo */}
      <div className={s.group}>
        <Tooltip content="Desfazer (Ctrl+Z)">
          <button
            type="button"
            className={s.toolBtn}
            onClick={onUndo}
            disabled={!canEdit || !canUndo}
            aria-label="Desfazer"
          >
            <UndoIcon />
          </button>
        </Tooltip>
        <Tooltip content="Refazer (Ctrl+Y)">
          <button
            type="button"
            className={s.toolBtn}
            onClick={onRedo}
            disabled={!canEdit || !canRedo}
            aria-label="Refazer"
          >
            <RedoIcon />
          </button>
        </Tooltip>
      </div>

      <div className={s.separator} />

      {/* Zoom */}
      <div className={s.group}>
        <span className={s.label}>Zoom</span>
        <Slider
          min={2}
          max={8}
          step={1}
          value={zoom}
          onChange={onZoomChange}
          aria-label="Zoom da grade"
        />
        <span className={s.zoomValue}>{zoom}x</span>
      </div>

      <div className={s.separator} />

      {/* Grid toggle */}
      <div className={s.group}>
        <Switch
          checked={showGrid}
          onChange={onShowGridChange}
          aria-label="Mostrar grade"
        />
        <span className={s.label}>Grade</span>
      </div>

      <div className={s.separator} />

      {/* Active color */}
      <div className={s.group}>
        <ColorPicker
          color={activeColorHex}
          onChange={onActiveColorHexChange}
          disabled={!canEdit}
        />
        <span className={s.colorHex}>{activeColorHex}</span>
      </div>

      {/* Palette quick-select */}
      {palette.length > 0 && (
        <>
          <div className={s.separator} />
          <div className={s.group}>
            {palette.map((entry) => {
              const isActive = entry.id === paintColorIndex
              return (
                <Tooltip key={`ft-color-${entry.id}`} content={entry.hex}>
                  <button
                    type="button"
                    className={`${s.colorChip} ${isActive ? s.colorChipActive : ''}`}
                    style={{ backgroundColor: entry.hex }}
                    onClick={() => onSelectPaintColor(entry.id)}
                    disabled={!canEdit}
                    aria-label={`Cor ${entry.hex}`}
                  />
                </Tooltip>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
