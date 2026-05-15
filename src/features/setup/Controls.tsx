import { useMemo } from 'react'
import type { ResolutionPreset } from '../../core/pattern'
import shared from '../../ui/shared.module.css'
import { Select, Slider, Switch } from '../../ui/primitives'

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
  const resolutionSelectOptions = useMemo(
    () => resolutionOptions.map((option) => ({ label: option.label, value: option.label })),
    [resolutionOptions],
  )

  return (
    <section className={shared.panel}>
      <h2>Configurações do padrão</h2>

      <label className={shared.field}>
        Título (opcional)
        <input
          type="text"
          maxLength={80}
          value={title}
          placeholder="Ex.: Rosa pixel"
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <span className={shared.hint}>Ajuda a identificar o projeto ao salvar e exportar.</span>
      </label>

      <div className={shared.field}>
        <span>Resolução</span>
        <Select
          value={selectedResolution}
          options={resolutionSelectOptions}
          onChange={onResolutionChange}
          aria-label="Resolução"
        />
        <span className={shared.hint}>Largura × altura em pontos. Mais pontos = mais detalhes e mais tempo de criação.</span>
      </div>

      <div className={shared.field}>
        <span>Número de cores: {paletteSize}</span>
        <Slider
          min={2}
          max={12}
          step={1}
          value={paletteSize}
          onChange={onPaletteSizeChange}
          aria-label="Número de cores"
        />
        <span className={shared.hint}>Use 4–8 cores para um padrão mais fácil de bordar com fios reais.</span>
      </div>

      <div className={shared.field}>
        <div className={shared.checkboxRow}>
          <Switch
            checked={cleanIsolated}
            onChange={onCleanToggle}
            aria-label="Limpar pixels isolados"
          />
          <span>Limpar pixels isolados</span>
        </div>
        <span className={shared.hint}>Remove pontos soltos — recomendado para crochê tapestry.</span>
      </div>

      <button type="button" onClick={onGenerate} disabled={!canGenerate || isProcessing}>
        {isProcessing ? 'Processando...' : actionLabel ?? `Gerar padrão ${selectedResolution}`}
      </button>
    </section>
  )
}
