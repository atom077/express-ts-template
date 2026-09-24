import { ErrorCode, Codes } from './errors';

export class ApiError extends Error {
    public readonly code: ErrorCode;

    public readonly body: Record<string, unknown>;

    constructor(code: ErrorCode = Codes.internalError, message = '', body: Record<string, unknown> = {}) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.body = body;
    }
}
