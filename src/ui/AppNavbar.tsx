import * as Tabs from '@radix-ui/react-tabs'
import type { AppStep } from '../hooks'
import { cx } from './cx'
import s from './AppNavbar.module.css'

interface AppNavbarProps {
  step: AppStep
  hasPattern: boolean
  canGoToEditor: boolean
  onStepChange: (step: AppStep) => void
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 5.5L4.5 9L11 1" />
    </svg>
  )
}

export function AppNavbar({ step, hasPattern, canGoToEditor, onStepChange }: AppNavbarProps) {
  const setupCompleted = hasPattern
  const editorDisabled = !canGoToEditor && step !== 'editor'
  const trackerDisabled = !hasPattern

  return (
    <header className={s.navbar}>
      <p className={s.brand}>Tapestry Crochet Designer</p>

      <Tabs.Root value={step} onValueChange={(v) => onStepChange(v as AppStep)}>
        <Tabs.List className={s.tabList} aria-label="Navegacao do aplicativo">
          <Tabs.Trigger value="setup" className={cx(s.tab, setupCompleted && s.tabCompleted)}>
            {setupCompleted && <CheckIcon />}
            Setup
          </Tabs.Trigger>
          <Tabs.Trigger
            value="editor"
            className={cx(s.tab, hasPattern && canGoToEditor && s.tabCompleted)}
            disabled={editorDisabled}
          >
            {hasPattern && canGoToEditor && <CheckIcon />}
            Editor
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tracker"
            className={s.tab}
            disabled={trackerDisabled}
          >
            Acompanhamento
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </header>
  )
}
