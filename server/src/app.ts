import express from 'express';
import cors from 'cors';
import * as ort from 'onnxruntime-node';
import path from 'node:path';
import sharp from 'sharp';
import { prepareImageForModel } from './prepareImageForModel';
import { bufferToTensor } from './bufferToTensor';
import { removeBackground } from './removeBackground';
import multer from 'multer';
import { envs } from './config/envs';

const app = express();

const allowedOrigins = envs.ORIGINS.split(',');

app.use(
    cors({
        origin: allowedOrigins,
        exposedHeaders: ['Content-Disposition'],
    }),
);

const modelPath = path.join(process.cwd(), 'src', 'model.onnx');

const upload = multer({ storage: multer.memoryStorage() });

app.post('/remove-background', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const imageBuffer = file.buffer;
        console.log(`Processing image: ${file.originalname}`);

        const session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['cpu'],
        });

        const imageData = await prepareImageForModel(imageBuffer);
        const tensor = bufferToTensor(imageData.buffer, imageData.width, imageData.height);

        const feeds = { input: tensor };

        const results = await session.run(feeds);

        const outputTensor = results['output'];

        const resultBuffer = await removeBackground(imageBuffer, outputTensor);

        // Upscale to original dimensions
        const { width: origW, height: origH } = await sharp(imageBuffer).metadata();
        const finalBuffer = await sharp(resultBuffer).resize(origW, origH, { fit: 'fill' }).png().toBuffer();

        const baseName = path.parse(file.originalname).name;

        console.log(`Image processed successfully (${origW}×${origH}px)`);
        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="${baseName}.png"`,
        });
        res.status(200).send(finalBuffer);
    } catch (err) {
        console.error('❌ Error processing image:', err);
        res.status(500).json({ error: 'Error processing image' });
    }
});

export default app;
