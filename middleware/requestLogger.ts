import type { RequestHandler } from 'express';
import { logger } from '../basic/logger';

export const requestLogger: RequestHandler = (req, res, next) => {
    const startedAt = Date.now();
    res.once('finish', () => {
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: Date.now() - startedAt,
        });
    });
    next();
};
