import type { NextFunction, RequestHandler } from 'express';

export function asyncHandler(handler: RequestHandler): RequestHandler {
    return (req, res, next: NextFunction) => {
        Promise.resolve()
            .then(() => handler(req, res, next))
            .catch(next);
    };
}
