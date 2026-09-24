import type { NextFunction, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../basic/error';
import { Codes } from '../basic/errors';
import { BaseRequest } from '../basic/route';
import { TOKEN_SECRET } from '../config/config';

type TokenUser = {
    id: string;
    objectId: string;
    unionId: string;
    sessionToken?: string;
    [key: string]: unknown;
};

function readToken(req: BaseRequest) {
    const authorization = req.header('authorization');
    if (authorization?.startsWith('Bearer ')) {
        return authorization.slice('Bearer '.length).trim();
    }
    return req.header('x-moji-token') || null;
}

function toUser(payload: string | JwtPayload): TokenUser {
    if (typeof payload === 'string') {
        throw new ApiError(Codes.notAllowed, 'invalid token payload');
    }
    const userId = String(payload.userId || payload.objectId || payload.sub || '');
    if (!userId) {
        throw new ApiError(Codes.notAllowed, 'invalid token payload');
    }
    return {
        ...payload,
        id: userId,
        objectId: userId,
        unionId: payload.unionId ? String(payload.unionId) : userId,
    };
}

/** Optional token validation, equivalent to the repository's global token layer. */
export function optionalToken() {
    return (req: BaseRequest, _res: Response, next: NextFunction) => {
        const token = readToken(req);
        if (!token) {
            next();
            return;
        }
        if (!TOKEN_SECRET) {
            next(new ApiError(Codes.internalError, 'TOKEN_SECRET is not configured'));
            return;
        }
        try {
            req.user = toUser(jwt.verify(token, TOKEN_SECRET));
            next();
        } catch (_error) {
            next(new ApiError(Codes.notAllowed, 'invalid token'));
        }
    };
}

/** Required token validation for protected routes. */
export function requireToken() {
    return (req: BaseRequest, _res: Response, next: NextFunction) => {
        if (!req.user?.objectId) {
            next(new ApiError(Codes.notAllowed, 'unauthorized'));
            return;
        }
        next();
    };
}
