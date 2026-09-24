const APP_NAME = process.env.APP_NAME || 'express-ts-template';
const PORT = Number(process.env.PORT) || 3020;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || `${APP_NAME}:`;
const QUEUE_ENABLED = process.env.QUEUE_ENABLED === 'true';
const QUEUE_WORKER_ENABLED = process.env.QUEUE_WORKER_ENABLED === 'true';
const QUEUE_REDIS_URL = process.env.QUEUE_REDIS_URL || REDIS_URL;
const QUEUE_CONCURRENCY = Number(process.env.QUEUE_CONCURRENCY) || 5;
const TOKEN_SECRET = process.env.TOKEN_SECRET || '';

const APPLICATION_CONFIGS = {
    server: {
        appName: APP_NAME,
        port: PORT,
        nodeEnv: NODE_ENV,
    },
    database: {
        uri: process.env.MONGO_URI || '',
        dbName: process.env.MONGO_DB_NAME || APP_NAME,
    },
    redis: {
        enabled: REDIS_ENABLED,
        url: REDIS_URL,
        keyPrefix: REDIS_KEY_PREFIX,
    },
    queue: {
        enabled: QUEUE_ENABLED,
        workerEnabled: QUEUE_WORKER_ENABLED,
        redisUrl: QUEUE_REDIS_URL,
        concurrency: QUEUE_CONCURRENCY,
    },
    auth: {
        tokenSecret: TOKEN_SECRET,
    },
};

export {
    APP_NAME,
    PORT,
    NODE_ENV,
    REDIS_ENABLED,
    REDIS_URL,
    REDIS_KEY_PREFIX,
    QUEUE_ENABLED,
    QUEUE_WORKER_ENABLED,
    QUEUE_REDIS_URL,
    QUEUE_CONCURRENCY,
    TOKEN_SECRET,
    APPLICATION_CONFIGS,
};
