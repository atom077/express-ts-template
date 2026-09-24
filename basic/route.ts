import { Request, Response } from 'express';

export interface BaseRequest<T = unknown> extends Request {
    user?: {
        [key: string]: any
        id: string
        objectId: string
        unionId: string
        sessionToken?: string
    }
    Params?: T;
}

export type BaseResponse<ResBody = any> = Response<ResBody>;
