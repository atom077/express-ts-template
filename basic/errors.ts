export const Codes = {
    OK: 200,
    notAllowed: 100000006,
    invalidParams: 100000002,
    internalError: 100000003,
} as const;

export type ErrorCode = typeof Codes[keyof typeof Codes];
