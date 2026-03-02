import express from 'express';
import cors from 'cors';
import * as ort from 'onnxruntime-node';
import path from 'node:path';
import fs from 'node:fs';
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

const modelPath = path.join(__dirname, 'model.onnx');

const upload = multer({ dest: 'uploads/' });

app.post('/remove-background', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image provided' });
        }
        const uploadedImagePath = file.path;
        console.log(`Procesando imagen subida: ${file.originalname}`);

        const session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['cpu'],
        });

        const imageData = await prepareImageForModel(uploadedImagePath);
        const tensor = bufferToTensor(imageData.buffer, imageData.width, imageData.height);

        const feeds = { input: tensor };

        console.log('🚀 Ejecutando inferencia en CPU...');
        const startTime = Date.now();
        const results = await session.run(feeds);
        const endTime = Date.now();
        console.log(`✅ Inferencia completada en ${endTime - startTime}ms`);

        const outputTensor = results['output'];
        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const baseName = path.parse(file.originalname).name;
        const outputPath = path.join(resultsDir, `${baseName}_${Date.now()}.png`);

        await removeBackground(uploadedImagePath, outputTensor, outputPath);

        // Upscale to original dimensions
        const { width: origW, height: origH } = await sharp(uploadedImagePath).metadata();
        const resizedBuffer = await sharp(outputPath).resize(origW, origH, { fit: 'fill' }).png().toBuffer();
        fs.writeFileSync(outputPath, resizedBuffer);

        // Eliminar el archivo temporal
        if (fs.existsSync(uploadedImagePath)) {
            fs.unlinkSync(uploadedImagePath);
        }

        console.log(`✅ Imagen enviada de vuelta (${origW}×${origH}px)`);
        res.status(200).sendFile(outputPath, {
            headers: {
                'Content-Disposition': `attachment; filename="${baseName}.png"`,
            },
        });
    } catch (err) {
        console.error('❌ Error en el endpoint:', err);
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0 && fs.existsSync(files[0].path)) {
            fs.unlinkSync(files[0].path);
        }
        res.status(500).json({ error: 'Fallo al procesar la imagen' });
    }
});

export default app;
