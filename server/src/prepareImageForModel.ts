import sharp from 'sharp';

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
export async function prepareImageForModel(imageBuffer: Buffer): Promise<ImageData> {
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
}
