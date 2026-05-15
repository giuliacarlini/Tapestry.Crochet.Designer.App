import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import shared from '../../ui/shared.module.css'
import s from './Upload.module.css'
import { cx } from '../../ui/cx'

interface UploadProps {
  onImageSelected: (imageUrl: string) => void
}

export function Upload({ onImageSelected }: UploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const processFile = useCallback(
    (file: File) => {
      const isSupported = file.type === 'image/png' || file.type === 'image/jpeg'
      if (!isSupported) return

      const previewUrl = URL.createObjectURL(file)
      onImageSelected(previewUrl)
    },
    [onImageSelected],
  )

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processFile(file)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <section className={shared.panel}>
      <h2>Imagem de referência</h2>
      <div
        className={cx(s.dropzone, isDragOver && s.dropzoneActive)}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <svg className={s.dropzoneIcon} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="38" cy="40" r="28" fill="currentColor" opacity="0.1" />
          <circle cx="38" cy="40" r="28" stroke="currentColor" strokeWidth="2.5" />
          <path d="M12 40 Q22 22 38 40 Q54 58 64 40" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M38 14 Q20 26 38 40 Q56 54 38 66" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M18 20 Q24 32 38 40 Q52 48 56 60" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M20 58 Q28 48 38 40 Q48 32 62 22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M64 40 Q72 34 75 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className={s.dropzoneText}>
          Arraste uma foto aqui ou{' '}
          <span className={s.dropzoneTextAccent}>clique para escolher</span>
        </p>
        <p className={s.dropzoneHint}>PNG ou JPG · Qualquer tamanho</p>
      </div>
      <input
        ref={inputRef}
        className={s.hiddenInput}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileChange}
      />
    </section>
  )
}
