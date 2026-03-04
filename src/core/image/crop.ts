export interface CropAreaPixels {
  x: number
  y: number
  width: number
  height: number
}

export async function loadImageElement(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao carregar imagem selecionada'))
    image.src = source
  })
}

export function extractCroppedImageData(
  image: HTMLImageElement,
  requestedArea: CropAreaPixels,
): { data: Uint8ClampedArray; width: number; height: number } {
  const safeX = Math.max(0, Math.min(Math.floor(requestedArea.x), image.naturalWidth - 1))
  const safeY = Math.max(0, Math.min(Math.floor(requestedArea.y), image.naturalHeight - 1))
  const maxWidth = Math.max(1, image.naturalWidth - safeX)
  const maxHeight = Math.max(1, image.naturalHeight - safeY)
  const safeWidth = Math.max(1, Math.min(Math.floor(requestedArea.width), maxWidth))
  const safeHeight = Math.max(1, Math.min(Math.floor(requestedArea.height), maxHeight))

  const canvas = document.createElement('canvas')
  canvas.width = safeWidth
  canvas.height = safeHeight
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context indisponivel no navegador')
  }

  context.drawImage(image, safeX, safeY, safeWidth, safeHeight, 0, 0, safeWidth, safeHeight)
  const imageData = context.getImageData(0, 0, safeWidth, safeHeight)

  return {
    data: imageData.data,
    width: safeWidth,
    height: safeHeight,
  }
}
