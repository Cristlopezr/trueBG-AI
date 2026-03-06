import { Server } from './presentation/server';
import { envs } from './config/envs';
import { AppRoutes } from './presentation/routes';

(async () => {
    const server = new Server({
        port: envs.PORT,
        routes: AppRoutes.routes,
        allowedOrigins: envs.ORIGINS.split(','),
    });
    await server.start();
})();
