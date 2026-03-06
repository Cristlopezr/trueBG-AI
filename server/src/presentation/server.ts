import express, { Router } from 'express';
import cors from 'cors';

interface Options {
    port?: number;
    routes: Router;
    allowedOrigins: string[];
}

export class Server {
    public readonly app = express();
    public readonly port: number;
    public readonly routes: Router;
    public readonly allowedOrigins: string[];

    constructor(options: Options) {
        const { port, routes, allowedOrigins } = options;
        this.port = port || 3000;
        this.routes = routes;
        this.allowedOrigins = allowedOrigins;
    }

    async start() {
        /* this.app.use(express.json()); */
        this.app.use(
            cors({
                origin: this.allowedOrigins,
                exposedHeaders: ['Content-Disposition'],
            }),
        );
        this.app.use(this.routes);
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}