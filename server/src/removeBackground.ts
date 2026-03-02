import * as ort from 'onnxruntime-node';
import sharp from 'sharp';

// RMBG-1.4 outputs a 1024×1024 mask
const MASK_SIZE = 1024;

/**
 * Removes the background from an image using the segmentation mask produced by RMBG-1.4.
 *
 * Strategy:
 *   1. Resize the original image to 1024×1024 (same size the model used).
 *   2. Convert the Float32 mask tensor → Uint8 grayscale buffer (white = keep, black = remove).
 *   3. Join the mask as the Alpha channel on top of the RGB image → RGBA.
 *   4. Save as PNG (PNG supports transparency; JPEG does not).
 *
 * @param imagePath     Path to the original source image.
 * @param maskTensor    The output tensor from RMBG-1.4 (shape [1,1,1024,1024], float32, values 0–1).
 * @param outputPath    Where to write the result PNG (e.g. './result.png').
 */
export async function removeBackground(
    imagePath: string,
    maskTensor: ort.Tensor,
    outputPath: string,
): Promise<void> {
    // ── 1. Build the alpha (mask) buffer ────────────────────────────────────
    // RMBG-1.4 already outputs values in [0, 1] — no sigmoid needed
    const floatMask = maskTensor.data as Float32Array;
    const alphaBuf = Buffer.alloc(MASK_SIZE * MASK_SIZE);

    for (let i = 0; i < floatMask.length; i++) {
        alphaBuf[i] = Math.round(Math.min(Math.max(floatMask[i] * 255, 0), 255));
    }

    // ── 2. Build the RGB buffer of the original image (resized to 1024×1024) ──
    const { data: rgbBuf } = await sharp(imagePath)
        .resize(MASK_SIZE, MASK_SIZE, { fit: 'fill' })
        .removeAlpha()          // ensure exactly 3 channels
        .raw()
        .toBuffer({ resolveWithObject: true });

    // ── 3. Join alpha channel → RGBA → PNG ──────────────────────────────────
    await sharp(rgbBuf, {
        raw: { width: MASK_SIZE, height: MASK_SIZE, channels: 3 },
    })
        .joinChannel(alphaBuf, {
            raw: { width: MASK_SIZE, height: MASK_SIZE, channels: 1 },
        })
        .png()
        .toFile(outputPath);

    console.log(`✅ Background removed → ${outputPath}`);
}
