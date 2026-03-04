import { useMemo } from 'react'
import type { Pattern } from '../core/pattern'
import { serializePattern } from '../core/pattern'

interface ExportProps {
  pattern: Pattern | null
}

function toSlug(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return 'tapestry-pattern'
  }

  return trimmed.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function Export({ pattern }: ExportProps) {
  const json = useMemo(() => (pattern ? serializePattern(pattern) : ''), [pattern])

  const handleDownload = () => {
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
  }

  return (
    <section className="panel">
      <h2>6. Exportar JSON</h2>
      <button type="button" disabled={!pattern} onClick={handleDownload}>
        Baixar JSON
      </button>

      <textarea readOnly rows={12} value={json} placeholder="JSON do padrao sera exibido aqui." />
    </section>
  )
}
