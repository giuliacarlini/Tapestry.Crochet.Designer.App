import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import type { Pattern } from '../core/pattern'
import s from './EditorSidebar.module.css'
import shared from './shared.module.css'
import { PaletteView } from './PaletteView'
import { Export } from './Export'

interface EditorSidebarProps {
  pattern: Pattern | null
  activePaletteIndex: number
  canEdit: boolean
  onSelectPaletteIndex: (index: number) => void
  onPaletteColorChange: (index: number, hex: string) => void
  onReplacePaletteIndex: (from: number, to: number) => void
  onDownloadProject: () => void
  onOpenProject: () => void
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${s.chevron} ${open ? s.chevronOpen : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function SidebarToggleIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open
        ? <path d="M9 18l6-6-6-6" />
        : <path d="M15 18l-6-6 6-6" />}
    </svg>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className={s.section}>
      <Collapsible.Trigger className={s.sectionTrigger}>
        <span>{title}</span>
        <ChevronIcon open={open} />
      </Collapsible.Trigger>
      <Collapsible.Content className={s.sectionContent}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function EditorSidebar({
  pattern,
  activePaletteIndex,
  canEdit,
  onSelectPaletteIndex,
  onPaletteColorChange,
  onReplacePaletteIndex,
  onDownloadProject,
  onOpenProject,
}: EditorSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <aside className={`${s.sidebar} ${sidebarOpen ? s.sidebarOpen : s.sidebarClosed}`}>
      <button
        type="button"
        className={s.toggleBtn}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
      >
        <SidebarToggleIcon open={sidebarOpen} />
      </button>

      {sidebarOpen && (
        <div className={s.sidebarBody}>
          <Section title="Paleta">
            <PaletteView
              palette={pattern?.palette ?? []}
              paletteSize={pattern?.palette.length ?? 0}
              activePaletteIndex={activePaletteIndex}
              cells={pattern?.cells ?? []}
              canEdit={canEdit}
              compact
              onSelectPaletteIndex={onSelectPaletteIndex}
              onPaletteColorChange={onPaletteColorChange}
              onReplacePaletteIndex={onReplacePaletteIndex}
            />
          </Section>

          <Section title="Exportar" defaultOpen={false}>
            <div className={s.sectionPanel}>
              <Export
                pattern={pattern}
                onDownloadProject={onDownloadProject}
              />
            </div>
          </Section>

          <Section title="Projeto" defaultOpen={false}>
            <div className={s.sectionPanel}>
              <div className={shared.actionRow}>
                <button
                  type="button"
                  disabled={!pattern}
                  onClick={onDownloadProject}
                  className={s.projectBtn}
                >
                  Salvar projeto
                </button>
                <button
                  type="button"
                  className={`${shared.buttonGhost} ${s.projectBtn}`}
                  onClick={onOpenProject}
                >
                  Abrir projeto
                </button>
              </div>
              <p className={shared.hint}>
                O arquivo .tcdp.json preserva dimensoes, paleta, celulas editadas e metadados.
              </p>
            </div>
          </Section>
        </div>
      )}
    </aside>
  )
}
