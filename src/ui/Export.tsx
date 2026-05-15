import { useMemo } from 'react'
import type { Pattern } from '../core/pattern'
import { serializePattern } from '../core/pattern'
import s from './Export.module.css'
import { useToast } from './primitives'

interface ExportProps {
  pattern: Pattern | null
  onDownloadProject: () => void
}

function toSlug(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return 'tapestry-pattern'
  }

  return trimmed.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function Export({ pattern, onDownloadProject }: ExportProps) {
  const { toast } = useToast()
  const json = useMemo(() => (pattern ? serializePattern(pattern) : ''), [pattern])

  const handleDownloadJson = () => {
    if (!pattern) {
      return
    }

    const blob = new Blob([json], { type: 'application/json' })
    const fileUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    const fileName = toSlug(pattern.metadata.title ?? 'tapestry-pattern')

    anchor.href = fileUrl
    anchor.download = `${fileName}.json`
    anchor.click()
    URL.revokeObjectURL(fileUrl)
    toast('JSON baixado com sucesso', 'success')
  }

  const handleCopyJson = async () => {
    if (!pattern) {
      return
    }

    try {
      await navigator.clipboard.writeText(json)
      toast('JSON copiado para a area de transferencia', 'success')
    } catch {
      toast('Nao foi possivel copiar', 'error')
    }
  }

  return (
    <div className={s.exportActions}>
      <button type="button" disabled={!pattern} onClick={handleDownloadJson}>
        Baixar JSON
      </button>
      <button type="button" disabled={!pattern} onClick={handleCopyJson}>
        Copiar JSON
      </button>
      <button type="button" disabled={!pattern} onClick={onDownloadProject}>
        Salvar projeto
      </button>
    </div>
  )
}
