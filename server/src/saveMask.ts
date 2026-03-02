import * as ort from 'onnxruntime-node';
import sharp from 'sharp';

export async function saveMask(outputTensor: ort.Tensor, outputPath: string) {
    const data = outputTensor.data as Float32Array;
    const pixels = new Uint8Array(data.length);

    // 1. Convertimos de Float [0-1] a Byte [0-255]
    for (let i = 0; i < data.length; i++) {
        // Clamp: nos aseguramos de no salirnos del rango 0-255
        pixels[i] = Math.round(Math.min(Math.max(data[i] * 255, 0), 255));
    }

    // 2. Leemos las dims reales del tensor (shape: [1, 1, H, W])
    const height = outputTensor.dims[2] as number;
    const width  = outputTensor.dims[3] as number;
    console.log(`🔍 Mask tensor dims: height=${height}, width=${width}, total values=${data.length}`);

    await sharp(pixels, {
        raw: { width, height, channels: 1 }
    })
    .toFile(outputPath);

    console.log(`🖼️  Máscara guardada en: ${outputPath}`);
}