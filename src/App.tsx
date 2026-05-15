import styles from './App.module.css'
import { useAppState } from './hooks'
import { TooltipProvider, ToastProvider } from './ui/primitives'
import { AppNavbar } from './ui/AppNavbar'
import { SetupWizard } from './features/setup/SetupWizard'
import { EditorLayout } from './features/editor/EditorLayout'
import { RowTracker } from './features/tracking/RowTracker'

function App() {
  const state = useAppState()

  return (
    <TooltipProvider>
    <ToastProvider>
    <main className={styles.appShell}>
      <AppNavbar
        step={state.step}
        hasPattern={Boolean(state.pattern)}
        canGoToEditor={state.canGoToEditor}
        onStepChange={state.setStep}
      />

      <input
        ref={state.projectInputRef}
        type="file"
        accept=".json,.tcdp.json,application/json"
        onChange={state.handleProjectFileSelected}
        className={styles.hiddenInput}
      />

      {state.errorMessage ? <p className={styles.errorMessage}>{state.errorMessage}</p> : null}

      {state.step === 'setup' ? (
        <SetupWizard
          imageUrl={state.imageUrl}
          pattern={state.pattern}
          isProcessing={state.isProcessing}
          isSetupPreviewStale={state.isSetupPreviewStale}
          title={state.title}
          cleanIsolated={state.cleanIsolated}
          resolutionLabel={state.resolutionLabel}
          paletteSize={state.paletteSize}
          canGoToEditor={state.canGoToEditor}
          onImageSelected={state.handleImageSelected}
          onCropAreaChange={state.handleCropAreaChange}
          onTitleChange={state.handleTitleChange}
          onCleanToggle={state.handleCleanToggle}
          onResolutionChange={state.handleResolutionChange}
          onPaletteSizeChange={state.handlePaletteSizeChange}
          onGenerate={state.handleGeneratePattern}
          onGoToEditor={() => state.setStep('editor')}
          onOpenProject={state.handleOpenProjectClick}
        />
      ) : state.step === 'editor' ? (
        <EditorLayout
          pattern={state.pattern}
          canEdit={state.canEditPattern}
          editorTool={state.editorTool}
          canUndo={state.undoStack.length > 0}
          canRedo={state.redoStack.length > 0}
          activePaletteIndex={state.activePaletteIndex}
          activeColorIndex={state.activeColorIndex}
          activeColorHex={state.activeColorHex}
          selectedWidth={state.selectedResolution.width}
          selectedHeight={state.selectedResolution.height}
          onEditorToolChange={state.setEditorTool}
          onUndo={state.handleUndo}
          onRedo={state.handleRedo}
          onSelectPaintColor={state.handleSelectPaintColor}
          onActiveColorHexChange={state.handleActiveColorHexChange}
          onPaintStroke={state.handlePaintStroke}
          onFillCell={state.handleFillCell}
          onPickCellColor={state.handlePickCellColor}
          onSelectPaletteIndex={state.setActivePaletteIndex}
          onPaletteColorChange={state.handlePaletteColorChange}
          onReplacePaletteIndex={state.handleReplacePaletteIndex}
          onDownloadProject={state.handleDownloadProject}
          onOpenProject={state.handleOpenProjectClick}
        />
      ) : state.step === 'tracker' && state.pattern ? (
        <RowTracker
          width={state.pattern.width}
          height={state.pattern.height}
          cells={state.pattern.cells}
          palette={state.pattern.palette}
          title={state.title || state.pattern.metadata.title}
        />
      ) : null}
    </main>
    </ToastProvider>
    </TooltipProvider>
  )
}

export default App
