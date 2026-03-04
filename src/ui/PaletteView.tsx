import { useMemo, useState } from 'react'
import type { PaletteColor } from '../core/pattern'

interface PaletteViewProps {
  palette: PaletteColor[]
  paletteSize: number
  activePaletteIndex: number
  cells: number[]
  canEdit?: boolean
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
  showEditControls = true,
  onSelectPaletteIndex = () => {},
  onPaletteColorChange = () => {},
  onReplacePaletteIndex = () => {},
}: PaletteViewProps) {
  const [replaceFrom, setReplaceFrom] = useState(0)
  const [replaceTo, setReplaceTo] = useState(0)

  const usageByColor = useMemo(() => {
    const counts = new Array<number>(palette.length).fill(0)
    for (const cell of cells) {
      if (cell >= 0 && cell < counts.length) {
        counts[cell] += 1
      }
    }
    return counts
  }, [cells, palette.length])

  return (
    <section className="panel">
      <h2>5. Paleta ({paletteSize} cores)</h2>

      {palette.length === 0 ? (
        <p className="hint">A paleta aparece apos gerar o padrao.</p>
      ) : (
        <>
          <div className="palette-grid">
            {palette.map((entry) => {
              const isActive = entry.id === activePaletteIndex
              return (
                <article
                  key={entry.id}
                  className={`palette-item ${isActive ? 'active-palette-item' : ''}`}
                  onClick={() => {
                    if (canEdit) {
                      onSelectPaletteIndex(entry.id)
                    }
                  }}
                >
                  <div className="swatch" style={{ backgroundColor: entry.hex }} />
                  <p>#{entry.id}</p>
                  <p>{entry.hex}</p>
                  <p>Uso: {usageByColor[entry.id] ?? 0}</p>
                  {showEditControls ? (
                    <>
                      <label className="field">
                        Cor
                        <input
                          type="color"
                          value={entry.hex}
                          disabled={!canEdit}
                          onChange={(event) => onPaletteColorChange(entry.id, event.target.value)}
                        />
                      </label>
                      <label className="field">
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
            <div className="replace-row">
              <label className="field">
                Substituir cor
                <select
                  value={replaceFrom}
                  onChange={(event) => setReplaceFrom(Number(event.target.value))}
                  disabled={!canEdit}
                >
                  {palette.map((entry) => (
                    <option key={`from-${entry.id}`} value={entry.id}>
                      #{entry.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Pela cor
                <select
                  value={replaceTo}
                  onChange={(event) => setReplaceTo(Number(event.target.value))}
                  disabled={!canEdit}
                >
                  {palette.map((entry) => (
                    <option key={`to-${entry.id}`} value={entry.id}>
                      #{entry.id}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={!canEdit || replaceFrom === replaceTo}
                onClick={() => onReplacePaletteIndex(replaceFrom, replaceTo)}
              >
                Aplicar substituicao
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
