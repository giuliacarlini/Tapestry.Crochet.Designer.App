import { useMemo, useState } from 'react'
import type { PaletteColor } from '../core/pattern'
import shared from './shared.module.css'
import s from './PaletteView.module.css'
import { cx } from './cx'
import { ColorPicker, Select } from './primitives'
import { ConfirmDialog } from './ConfirmDialog'

interface PaletteViewProps {
  palette: PaletteColor[]
  paletteSize: number
  activePaletteIndex: number
  cells: number[]
  canEdit?: boolean
  compact?: boolean
  showEditControls?: boolean
  onSelectPaletteIndex?: (index: number) => void
  onPaletteColorChange?: (index: number, hex: string) => void
  onReplacePaletteIndex?: (fromIndex: number, toIndex: number) => void
}

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i

export function PaletteView({
  palette,
  paletteSize,
  activePaletteIndex,
  cells,
  canEdit = false,
  compact = false,
  showEditControls = true,
  onSelectPaletteIndex = () => {},
  onPaletteColorChange = () => {},
  onReplacePaletteIndex = () => {},
}: PaletteViewProps) {
  const [replaceFrom, setReplaceFrom] = useState(0)
  const [replaceTo, setReplaceTo] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const usageByColor = useMemo(() => {
    const counts = new Array<number>(palette.length).fill(0)
    for (const cell of cells) {
      if (cell >= 0 && cell < counts.length) {
        counts[cell] += 1
      }
    }
    return counts
  }, [cells, palette.length])

  const paletteSelectOptions = useMemo(
    () => palette.map((entry) => ({ label: `#${entry.id} — ${entry.hex}`, value: String(entry.id) })),
    [palette],
  )

  const fromEntry = palette.find((e) => e.id === replaceFrom)
  const toEntry = palette.find((e) => e.id === replaceTo)

  return (
    <section className={shared.panel}>
      <h2>Paleta ({paletteSize} cores)</h2>

      {palette.length === 0 ? (
        <p className={shared.hint}>A paleta aparece apos gerar o padrao.</p>
      ) : (
        <>
          <div className={cx(s.paletteGrid, compact && s.compactGrid)}>
            {palette.map((entry) => {
              const isActive = entry.id === activePaletteIndex
              return (
                <article
                  key={entry.id}
                  className={cx(s.paletteItem, isActive && s.active)}
                  onClick={() => {
                    if (canEdit) {
                      onSelectPaletteIndex(entry.id)
                    }
                  }}
                >
                  <div className={s.swatch} style={{ backgroundColor: entry.hex }} />
                  <p>#{entry.id}</p>
                  <p>{entry.hex}</p>
                  <p>Uso: {usageByColor[entry.id] ?? 0}</p>
                  {showEditControls ? (
                    <>
                      <div className={shared.field}>
                        <span>Cor</span>
                        <ColorPicker
                          color={entry.hex}
                          onChange={(hex) => onPaletteColorChange(entry.id, hex)}
                          disabled={!canEdit}
                          size="sm"
                        />
                      </div>
                      <label className={shared.field}>
                        HEX
                        <input
                          type="text"
                          value={entry.hex}
                          disabled={!canEdit}
                          onChange={(event) => {
                            const value = event.target.value.toUpperCase()
                            if (HEX_COLOR_REGEX.test(value)) {
                              onPaletteColorChange(entry.id, value)
                            }
                          }}
                        />
                      </label>
                    </>
                  ) : null}
                </article>
              )
            })}
          </div>

          {showEditControls ? (
            <div className={s.replaceRow}>
              <div className={shared.field}>
                <span>Substituir cor</span>
                <Select
                  value={String(replaceFrom)}
                  options={paletteSelectOptions}
                  onChange={(value) => setReplaceFrom(Number(value))}
                  aria-label="Substituir cor"
                />
              </div>

              <div className={shared.field}>
                <span>Pela cor</span>
                <Select
                  value={String(replaceTo)}
                  options={paletteSelectOptions}
                  onChange={(value) => setReplaceTo(Number(value))}
                  aria-label="Pela cor"
                />
              </div>

              <button
                type="button"
                disabled={!canEdit || replaceFrom === replaceTo}
                onClick={() => setConfirmOpen(true)}
              >
                Aplicar substituicao
              </button>
            </div>
          ) : null}

          <ConfirmDialog
            open={confirmOpen}
            title="Substituir cor na paleta"
            description={`Substituir ${fromEntry?.hex ?? `#${replaceFrom}`} pela cor ${toEntry?.hex ?? `#${replaceTo}`} em todas as celulas do padrao?`}
            confirmLabel="Substituir"
            onConfirm={() => {
              setConfirmOpen(false)
              onReplacePaletteIndex(replaceFrom, replaceTo)
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </section>
  )
}
