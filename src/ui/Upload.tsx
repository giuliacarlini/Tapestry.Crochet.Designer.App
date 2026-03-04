import type { ChangeEvent } from 'react'

interface UploadProps {
  onImageSelected: (imageUrl: string) => void
}

export function Upload({ onImageSelected }: UploadProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const isSupported = file.type === 'image/png' || file.type === 'image/jpeg'
    if (!isSupported) {
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onImageSelected(previewUrl)
    event.target.value = ''
  }

  return (
    <section className="panel">
      <h2>1. Upload</h2>
      <label className="hint" htmlFor="upload-input">
        PNG ou JPG
      </label>
      <input id="upload-input" type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
    </section>
  )
}
