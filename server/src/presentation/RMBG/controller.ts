import { Request, Response } from 'express';
import { CustomError } from '../../domain/custom-error';
import { RMBGService } from '../services/rmbg-service';
import sharp from 'sharp';
import path from 'node:path';

export class RMBGController {
    constructor(private readonly rmbgService: RMBGService) {}

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        console.error('Error processing image:', error);
        return res.status(500).json({ error: 'Error processing image' });
    };

    removeBackground = async (req: Request, res: Response) => {
        try {
            const file = req.file;
            if (!file) {
                throw CustomError.badRequest('No image provided');
            }

            const imageBuffer = file.buffer;
            console.log(`Processing image: ${file.originalname}`);

            const session = await this.rmbgService.createOrGetSession();

            const imageData = await this.rmbgService.prepareImageForModel(imageBuffer);
            const tensor = this.rmbgService.bufferToTensor(imageData.buffer, imageData.width, imageData.height);

            const feeds = { input: tensor };

            const results = await session.run(feeds);

            const outputTensor = results['output'];

            const resultBuffer = await this.rmbgService.removeBackground(imageBuffer, outputTensor);

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
            this.handleError(err, res);
        }
    };
}
