import { Router } from 'express';
import { RMBGController } from './controller';
import { RMBGService } from '../services/rmbg-service';
import { envs } from '../../config/envs';
import multer from 'multer';
import path from 'node:path';

const upload = multer({ storage: multer.memoryStorage() });
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

        router.post('/remove-background', upload.single('image'), rmbgController.removeBackground);

        return router;
    }
}
