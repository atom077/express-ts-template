import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../basic/error';
import { Codes } from '../basic/errors';
import { logger } from '../basic/logger';

const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
    if (res.headersSent) {
        return;
    }

    if (error instanceof ApiError) {
        res.status(400).json({
            code: error.code,
            message: error.message,
            ...error.body,
        });
        return;
    }

    const normalizedError = error instanceof Error ? error : new Error(String(error));
    logger.error('unknown error caught', normalizedError);
    res.status(500).json({
        code: Codes.internalError,
        message: process.env.NODE_ENV === 'production' ? 'internal server error' : normalizedError.message,
    });
};

export default errorMiddleware;
