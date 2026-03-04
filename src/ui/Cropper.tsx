import { useState } from 'react'
import EasyCropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

interface CropperProps {
  imageSrc: string
  onCropAreaChange: (area: Area) => void
}

export function Cropper({ imageSrc, onCropAreaChange }: CropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <section className="panel">
      <h2>2. Crop e Zoom</h2>
      <div className="cropper-shell">
        <EasyCropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, areaPixels) => onCropAreaChange(areaPixels)}
        />
      </div>

      <label className="range-row">
        Zoom
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
      </label>
    </section>
  )
}
