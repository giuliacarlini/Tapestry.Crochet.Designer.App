import { Fragment } from 'react'
import { cx } from './cx'
import s from './WizardProgress.module.css'

export type WizardStep = 'upload' | 'crop' | 'configure' | 'preview'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Imagem' },
  { key: 'crop', label: 'Recorte' },
  { key: 'configure', label: 'Configurar' },
  { key: 'preview', label: 'Preview' },
]

interface WizardProgressProps {
  currentStep: WizardStep
  onStepClick: (step: WizardStep) => void
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
  const currentIndex = STEPS.findIndex((st) => st.key === currentStep)

  return (
    <nav className={s.progress} aria-label="Progresso da configuração">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = step.key === currentStep

        return (
          <Fragment key={step.key}>
            {index > 0 && (
              <div className={cx(s.connector, isDone && s.connectorActive)} role="presentation" />
            )}
            <div className={s.stepItem}>
              <button
                type="button"
                className={cx(s.dot, isCurrent && s.dotCurrent, isDone && s.dotDone)}
                onClick={isDone ? () => onStepClick(step.key) : undefined}
                disabled={!isDone && !isCurrent}
                aria-label={`Etapa ${index + 1}: ${step.label}${isCurrent ? ' (atual)' : isDone ? ' (concluída, clique para voltar)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  String(index + 1)
                )}
              </button>
              <span className={cx(s.label, isCurrent && s.labelCurrent, isDone && s.labelDone)}>
                {step.label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </nav>
  )
}
