import { Router } from 'express';
import { RMBGRoutes } from './RMBG/routes';

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        router.use('/', RMBGRoutes.routes);

        return router;
    }
}
