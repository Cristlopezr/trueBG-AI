import sharp from 'sharp';
import fs from 'node:fs';

export interface ImageData {
    buffer: Buffer;
    width: number;
    height: number;
    channels: number;
}

const MODEL_SIZE = 1024;

/**
 * Prepares an image for model inference:
 * - Resizes to MODEL_SIZE×MODEL_SIZE
 * - Converts to RGB (removes alpha channel)
 * - Returns raw pixel buffer + metadata
 */
export async function prepareImageForModel(imagePath: string): Promise<ImageData> {
    if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
    }

    const { data, info } = await sharp(imagePath)
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
}
