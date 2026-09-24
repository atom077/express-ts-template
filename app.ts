import express from 'express';
import cors from 'cors';
import { asyncHandler } from './basic/asyncHandler';
import errorMiddleware from './middleware/error';
import { requestLogger } from './middleware/requestLogger';
import { optionalToken } from './middleware/token';
import router from './router';
import internalRouter from './internal_router';

export function createApp() {
    const app = express();
    app.set('trust proxy', true);

    app.use(requestLogger);
    app.use(express.json());
    app.use(cors({
        allowedHeaders: ['*'],
    }));
    app.use(asyncHandler(optionalToken()));

    app.use('/api', router);
    app.use('/internal', internalRouter);
    app.use(errorMiddleware);

    return app;
}
