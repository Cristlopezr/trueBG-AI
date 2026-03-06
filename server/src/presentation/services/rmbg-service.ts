import * as ort from 'onnxruntime-node';
import sharp from 'sharp';

interface ImageData {
    buffer: Buffer;
    width: number;
    height: number;
    channels: number;
}

const MODEL_SIZE = 1024;
const MASK_SIZE = 1024;

interface RMBGServiceOptions {
    modelPath: string;
    intraOpNumThreads?: number;
    interOpNumThreads?: number;
    graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
}

export class RMBGService {
    private static sessionPromise: Promise<ort.InferenceSession> | null = null;

    constructor(private readonly options: RMBGServiceOptions) {}

    createOrGetSession = async (): Promise<ort.InferenceSession> => {
        if (!RMBGService.sessionPromise) {
            RMBGService.sessionPromise = ort.InferenceSession.create(this.options.modelPath, {
                executionProviders: ['cpu'],
                intraOpNumThreads: this.options.intraOpNumThreads ?? 2,
                interOpNumThreads: this.options.interOpNumThreads ?? 1,
                graphOptimizationLevel: this.options.graphOptimizationLevel ?? 'all',
            });
        }
        return RMBGService.sessionPromise;
    };

    prepareImageForModel = async (imageBuffer: Buffer): Promise<ImageData> => {
        const { data, info } = await sharp(imageBuffer)
            .resize(MODEL_SIZE, MODEL_SIZE, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        return {
            buffer: data,
            width: info.width,
            height: info.height,
            channels: info.channels,
        };
    };
    bufferToTensor = (buffer: Buffer, width: number, height: number): ort.Tensor => {
        const channels = 3;
        const pixelCount = width * height;
        const floatData = new Float32Array(channels * pixelCount);

        for (let i = 0; i < pixelCount; i++) {
            const hwcBase = i * channels;

            floatData[0 * pixelCount + i] = buffer[hwcBase + 0] / 255.0; // R
            floatData[1 * pixelCount + i] = buffer[hwcBase + 1] / 255.0; // G
            floatData[2 * pixelCount + i] = buffer[hwcBase + 2] / 255.0; // B
        }

        return new ort.Tensor('float32', floatData, [1, channels, height, width]);
    };

    removeBackground = async (imageBuffer: Buffer, maskTensor: ort.Tensor): Promise<Buffer> => {
        const floatMask = maskTensor.data as Float32Array;
        const alphaBuf = Buffer.alloc(MASK_SIZE * MASK_SIZE);

        for (let i = 0; i < floatMask.length; i++) {
            alphaBuf[i] = Math.round(Math.min(Math.max(floatMask[i] * 255, 0), 255));
        }

        // ── 2. Build the RGB buffer of the original image (resized to 1024×1024) ──
        const { data: rgbBuf } = await sharp(imageBuffer)
            .resize(MASK_SIZE, MASK_SIZE, { fit: 'fill' })
            .removeAlpha() // ensure exactly 3 channels
            .raw()
            .toBuffer({ resolveWithObject: true });

        // ── 3. Join alpha channel → RGBA → PNG buffer ───────────────────────────
        const resultBuffer = await sharp(rgbBuf, {
            raw: { width: MASK_SIZE, height: MASK_SIZE, channels: 3 },
        })
            .joinChannel(alphaBuf, {
                raw: { width: MASK_SIZE, height: MASK_SIZE, channels: 1 },
            })
            .png()
            .toBuffer();

        console.log('Background removed');
        return resultBuffer;
    };

    private saveMask = async (outputTensor: ort.Tensor, outputPath: string) => {
        const data = outputTensor.data as Float32Array;
        const pixels = new Uint8Array(data.length);

        // 1. Convertimos de Float [0-1] a Byte [0-255]
        for (let i = 0; i < data.length; i++) {
            // Clamp: nos aseguramos de no salirnos del rango 0-255
            pixels[i] = Math.round(Math.min(Math.max(data[i] * 255, 0), 255));
        }

        // 2. Leemos las dims reales del tensor (shape: [1, 1, H, W])
        const height = outputTensor.dims[2] as number;
        const width = outputTensor.dims[3] as number;
        console.log(`🔍 Mask tensor dims: height=${height}, width=${width}, total values=${data.length}`);

        await sharp(pixels, {
            raw: { width, height, channels: 1 },
        }).toFile(outputPath);

        console.log(`🖼️  Máscara guardada en: ${outputPath}`);
    };
}
