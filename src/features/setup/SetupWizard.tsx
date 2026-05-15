import { useEffect, useRef, useState } from 'react'
import type { Area } from 'react-easy-crop'
import { RESOLUTION_PRESETS, type Pattern } from '../../core/pattern'
import { Controls } from './Controls'
import { Cropper } from './Cropper'
import { PaletteView } from '../palette/PaletteView'
import { PreviewGrid } from '../preview/PreviewGrid'
import { Upload } from './Upload'
import shared from '../../ui/shared.module.css'
import s from './SetupWizard.module.css'
import { WizardProgress, type WizardStep } from './WizardProgress'

interface SetupWizardProps {
  imageUrl: string | null
  pattern: Pattern | null
  isProcessing: boolean
  isSetupPreviewStale: boolean
  title: string
  cleanIsolated: boolean
  resolutionLabel: string
  paletteSize: number
  canGoToEditor: boolean
  onImageSelected: (url: string) => void
  onCropAreaChange: (area: Area) => void
  onTitleChange: (title: string) => void
  onCleanToggle: (value: boolean) => void
  onResolutionChange: (label: string) => void
  onPaletteSizeChange: (value: number) => void
  onGenerate: () => Promise<void>
  onGoToEditor: () => void
  onOpenProject: () => void
}

export function SetupWizard({
  imageUrl,
  pattern,
  isProcessing,
  isSetupPreviewStale,
  title,
  cleanIsolated,
  resolutionLabel,
  paletteSize,
  canGoToEditor,
  onImageSelected,
  onCropAreaChange,
  onTitleChange,
  onCleanToggle,
  onResolutionChange,
  onPaletteSizeChange,
  onGenerate,
  onGoToEditor,
  onOpenProject,
}: SetupWizardProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>(() => (pattern ? 'preview' : 'upload'))

  // Upload → Crop: advance automatically when image is selected
  const handleImageSelectedAndAdvance = (url: string) => {
    onImageSelected(url)
    setWizardStep('crop')
  }

  // Configure → Preview: advance when pattern changes (successful generation)
  const prevPatternRef = useRef<Pattern | null>(pattern)
  useEffect(() => {
    const prevPattern = prevPatternRef.current
    prevPatternRef.current = pattern
    if (pattern !== null && pattern !== prevPattern && wizardStep === 'configure') {
      setWizardStep('preview')
    }
  }, [pattern, wizardStep])

  const STEPS: WizardStep[] = ['upload', 'crop', 'configure', 'preview']
  const currentIndex = STEPS.indexOf(wizardStep)

  const goToStep = (step: WizardStep) => {
    if (STEPS.indexOf(step) <= currentIndex) {
      setWizardStep(step)
    }
  }

  return (
    <div className={s.wizard}>
      <WizardProgress currentStep={wizardStep} onStepClick={goToStep} />

      <div className={s.content}>
        {wizardStep === 'upload' && (
          <>
            <Upload onImageSelected={handleImageSelectedAndAdvance} />
            <div className={s.altAction}>
              <span className={s.altActionLabel}>Continuando de onde parou?</span>
              <button type="button" className={shared.buttonGhost} onClick={onOpenProject}>
                Abrir projeto salvo
              </button>
            </div>
          </>
        )}

        {wizardStep === 'crop' && imageUrl && (
          <>
            <Cropper imageSrc={imageUrl} onCropAreaChange={onCropAreaChange} />
            <div className={s.nav}>
              <button
                type="button"
                className={shared.buttonGhost}
                onClick={() => setWizardStep('upload')}
              >
                ← Voltar
              </button>
              <button type="button" onClick={() => setWizardStep('configure')}>
                Continuar →
              </button>
            </div>
          </>
        )}

        {wizardStep === 'configure' && (
          <>
            <Controls
              title={title}
              cleanIsolated={cleanIsolated}
              canGenerate={Boolean(imageUrl)}
              isProcessing={isProcessing}
              actionLabel="Criar meu padrão →"
              resolutionOptions={RESOLUTION_PRESETS}
              selectedResolution={resolutionLabel}
              paletteSize={paletteSize}
              onTitleChange={onTitleChange}
              onCleanToggle={onCleanToggle}
              onResolutionChange={onResolutionChange}
              onPaletteSizeChange={onPaletteSizeChange}
              onGenerate={onGenerate}
            />
            <div className={s.nav}>
              <button
                type="button"
                className={shared.buttonGhost}
                onClick={() => setWizardStep('crop')}
              >
                ← Voltar
              </button>
            </div>
          </>
        )}

        {wizardStep === 'preview' && pattern && (
          <>
            {isSetupPreviewStale && (
              <p className={s.staleHint}>
                Preview desatualizado — clique em "Ajustar configurações" e gere novamente.
              </p>
            )}
            <div className={s.previewRow}>
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
            </div>
            <div className={s.nav}>
              <button
                type="button"
                className={shared.buttonGhost}
                onClick={() => setWizardStep('configure')}
              >
                ← Ajustar configurações
              </button>
              <button type="button" onClick={onGoToEditor} disabled={!canGoToEditor}>
                Ir para o editor →
              </button>
            </div>
          </>
        )}

        {wizardStep === 'preview' && !pattern && (
          <p className={shared.hint}>Nenhum padrão gerado ainda. Volte e configure o setup.</p>
        )}
      </div>
    </div>
  )
}
