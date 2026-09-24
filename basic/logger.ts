export type LogMeta = Record<string, unknown> | Error | unknown;

function serializeMeta(meta: LogMeta) {
    if (meta instanceof Error) {
        return JSON.stringify({
            name: meta.name,
            message: meta.message,
            stack: meta.stack,
        });
    }
    try {
        return JSON.stringify(meta);
    } catch (_error) {
        return String(meta);
    }
}

function write(level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: LogMeta) {
    const suffix = meta === undefined ? '' : ` ${serializeMeta(meta)}`;
    const line = `[${new Date().toISOString()}] ${message}${suffix}`;
    // eslint-disable-next-line no-console
    console[level](line);
}

export const logger = {
    info: (message: string, meta?: LogMeta) => write('info', message, meta),
    warn: (message: string, meta?: LogMeta) => write('warn', message, meta),
    error: (message: string, meta?: LogMeta) => write('error', message, meta),
    debug: (message: string, meta?: LogMeta) => write('debug', message, meta),
};
