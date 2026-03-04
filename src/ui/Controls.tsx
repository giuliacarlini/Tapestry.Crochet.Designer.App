import type { ResolutionPreset } from '../core/pattern'

interface ControlsProps {
  title: string
  cleanIsolated: boolean
  canGenerate: boolean
  isProcessing: boolean
  actionLabel?: string
  resolutionOptions: ResolutionPreset[]
  selectedResolution: string
  paletteSize: number
  onTitleChange: (title: string) => void
  onCleanToggle: (value: boolean) => void
  onResolutionChange: (resolution: string) => void
  onPaletteSizeChange: (paletteSize: number) => void
  onGenerate: () => void
}

export function Controls({
  title,
  cleanIsolated,
  canGenerate,
  isProcessing,
  actionLabel,
  resolutionOptions,
  selectedResolution,
  paletteSize,
  onTitleChange,
  onCleanToggle,
  onResolutionChange,
  onPaletteSizeChange,
  onGenerate,
}: ControlsProps) {
  return (
    <section className="panel">
      <h2>3. Gerar Padrao</h2>

      <label className="field">
        Titulo (opcional)
        <input
          type="text"
          maxLength={80}
          value={title}
          placeholder="Ex.: Rosa pixel"
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </label>

      <label className="field">
        Resolucao
        <select value={selectedResolution} onChange={(event) => onResolutionChange(event.target.value)}>
          {resolutionOptions.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Numero de cores (2 a 12)
        <input
          type="number"
          min={2}
          max={12}
          step={1}
          value={paletteSize}
          onChange={(event) => onPaletteSizeChange(Number(event.target.value))}
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={cleanIsolated}
          onChange={(event) => onCleanToggle(event.target.checked)}
        />
        Limpar pixels isolados
      </label>

      <button type="button" onClick={onGenerate} disabled={!canGenerate || isProcessing}>
        {isProcessing ? 'Processando no worker...' : actionLabel ?? `Gerar padrao ${selectedResolution}`}
      </button>
    </section>
  )
}
