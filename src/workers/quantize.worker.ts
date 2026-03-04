/// <reference lib="webworker" />

import { cleanIsolatedPixels, quantizeMedianCut, resizeImageDataBilinear, rgbToHex } from '../core/image'
import { MAX_PALETTE_SIZE, MIN_PALETTE_SIZE } from '../core/pattern'
import type { QuantizeWorkerError, QuantizeWorkerRequest, QuantizeWorkerSuccess } from './types'

const worker = self as DedicatedWorkerGlobalScope

worker.onmessage = (event: MessageEvent<QuantizeWorkerRequest>) => {
  try {
    const { image, cleanIsolated, width, height, paletteSize } = event.data

    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new Error('Resolucao invalida para processamento')
    }

    if (
      !Number.isInteger(paletteSize) ||
      paletteSize < MIN_PALETTE_SIZE ||
      paletteSize > MAX_PALETTE_SIZE
    ) {
      throw new Error('Quantidade de cores invalida. Use entre 2 e 12.')
    }

    const resized = resizeImageDataBilinear(
      image.data,
      image.width,
      image.height,
      width,
      height,
    )

    const quantized = quantizeMedianCut(resized, width, height, paletteSize)

    const cells = cleanIsolated
      ? cleanIsolatedPixels(quantized.cells, width, height, paletteSize)
      : quantized.cells

    const payload: QuantizeWorkerSuccess = {
      width,
      height,
      palette: quantized.palette.map(rgbToHex),
      cells,
    }

    worker.postMessage(payload)
  } catch (error) {
    const payload: QuantizeWorkerError = {
      error: error instanceof Error ? error.message : 'Erro desconhecido no worker de quantizacao',
    }
    worker.postMessage(payload)
  }
}

export {}
