import * as ort from 'onnxruntime-node';

/**
 * Converts a raw RGB Buffer (HWC layout) into an ONNX Float32 Tensor (CHW layout)
 * with shape [1, 3, height, width], normalising pixel values from [0, 255] → [0.0, 1.0].
 * @param buffer  Raw RGB pixel buffer from sharp (.raw())
 * @param width   Image width  (1024)
 * @param height  Image height (1024)
 */
export function bufferToTensor(buffer: Buffer, width: number, height: number): ort.Tensor {
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
}
