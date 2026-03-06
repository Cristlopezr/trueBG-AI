import { Router, Request, Response, NextFunction } from 'express';
import { RMBGController } from './controller';
import { RMBGService } from '../services/rmbg-service';
import { CustomError } from '../../domain/custom-error';
import { envs } from '../../config/envs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
        const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

        if (isMimeValid && isExtValid) {
            return cb(null, true);
        }

        cb(CustomError.badRequest(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    },
});

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Wraps multer to convert MulterError into CustomError
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return next(CustomError.payloadTooLarge('File too large. Max size is 10MB.'));
        }
        if (err) return next(err);
        next();
    });
};

const modelPath = path.join(process.cwd(), 'src', 'model.onnx');
export class RMBGRoutes {
    static get routes(): Router {
        const router = Router();

        const rmbgService = new RMBGService({
            modelPath,
            intraOpNumThreads: envs.ONNX_INTRA_THREADS,
            interOpNumThreads: envs.ONNX_INTER_THREADS,
        });
        const rmbgController = new RMBGController(rmbgService);

        router.post('/remove-background', limiter, handleUpload, rmbgController.removeBackground);

        return router;
    }
}
