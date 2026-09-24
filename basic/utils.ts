import { DocumentType } from '@typegoose/typegoose';
import type { Types } from 'mongoose';
import { ZodSchema, infer as ZodInfer } from 'zod';
import { ApiError } from './error';
import { Codes } from './errors';

/**
 * Validate one request source and keep the same error contract as the shared
 * service utilities, without importing the shared Redis helpers in tests.
 */
export function checkParamsType<T extends ZodSchema>(schema: T, params: unknown): ZodInfer<T> {
    const result = schema.safeParse(params);
    if (!result.success) {
        const error = result.error.issues[0];
        throw new ApiError(
            Codes.invalidParams,
            `${error.code}: [${error.path}] field ${error.message}`,
        );
    }
    return result.data;
}

export type MongooseModelType<T> = DocumentType<{[P in keyof T]: T[P] extends object
  ? T[P] extends (Types.ObjectId | Date | Buffer | Types.Decimal128 | Types.ObjectId[] | Date[] | Types.Decimal128[])
    ? T[P]
    : DocumentType<T[P]>
  : T[P]}>
