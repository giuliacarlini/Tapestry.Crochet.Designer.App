import { useState } from 'react'
import type { Pattern } from '../../core/pattern'
import type { EditorTool } from '../preview/PreviewGrid'
import s from './EditorLayout.module.css'
import { FloatingToolbar } from './FloatingToolbar'
import { PreviewGrid } from '../preview/PreviewGrid'
import { EditorSidebar } from './EditorSidebar'

interface EditorLayoutProps {
  pattern: Pattern | null
  canEdit: boolean
  editorTool: EditorTool
  canUndo: boolean
  canRedo: boolean
  activePaletteIndex: number
  activeColorIndex: number
  activeColorHex: string
  selectedWidth: number
  selectedHeight: number
  onEditorToolChange: (tool: EditorTool) => void
  onUndo: () => void
  onRedo: () => void
  onSelectPaintColor: (index: number) => void
  onActiveColorHexChange: (hex: string) => void
  onPaintStroke: (indices: number[]) => void
  onFillCell: (index: number) => void
  onPickCellColor: (index: number) => void
  onSelectPaletteIndex: (index: number) => void
  onPaletteColorChange: (index: number, hex: string) => void
  onReplacePaletteIndex: (from: number, to: number) => void
  onDownloadProject: () => void
  onOpenProject: () => void
}

export function EditorLayout({
  pattern,
  canEdit,
  editorTool,
  canUndo,
  canRedo,
  activePaletteIndex,
  activeColorIndex,
  activeColorHex,
  selectedWidth,
  selectedHeight,
  onEditorToolChange,
  onUndo,
  onRedo,
  onSelectPaintColor,
  onActiveColorHexChange,
  onPaintStroke,
  onFillCell,
  onPickCellColor,
  onSelectPaletteIndex,
  onPaletteColorChange,
  onReplacePaletteIndex,
  onDownloadProject,
  onOpenProject,
}: EditorLayoutProps) {
  const [zoom, setZoom] = useState(4)
  const [showGrid, setShowGrid] = useState(true)

  return (
    <div className={s.editorLayout}>
      <FloatingToolbar
        editorTool={editorTool}
        canEdit={canEdit}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        showGrid={showGrid}
        palette={pattern?.palette ?? []}
        paintColorIndex={activeColorIndex}
        activeColorHex={activeColorHex}
        onEditorToolChange={onEditorToolChange}
        onUndo={onUndo}
        onRedo={onRedo}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSelectPaintColor={onSelectPaintColor}
        onActiveColorHexChange={onActiveColorHexChange}
      />

      <div className={s.editorBody}>
        <div className={s.canvasArea}>
          <PreviewGrid
            width={pattern?.width ?? selectedWidth}
            height={pattern?.height ?? selectedHeight}
            cells={pattern?.cells ?? []}
            palette={pattern?.palette ?? []}
            zoom={zoom}
            showGrid={showGrid}
            canEdit={canEdit}
            editorTool={editorTool}
            onPaintStroke={onPaintStroke}
            onFillCell={onFillCell}
            onPickCellColor={onPickCellColor}
          />
        </div>

        <EditorSidebar
          pattern={pattern}
          activePaletteIndex={activePaletteIndex}
          canEdit={canEdit}
          onSelectPaletteIndex={onSelectPaletteIndex}
          onPaletteColorChange={onPaletteColorChange}
          onReplacePaletteIndex={onReplacePaletteIndex}
          onDownloadProject={onDownloadProject}
          onOpenProject={onOpenProject}
        />
      </div>
    </div>
  )
}
