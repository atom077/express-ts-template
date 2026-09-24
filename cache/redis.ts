import Redis from 'ioredis';
import { logger } from '../basic/logger';
import {
    REDIS_ENABLED, REDIS_KEY_PREFIX, REDIS_URL,
} from '../config/config';

/**
 * Template cache client. It is lazy and disabled by default so importing a
 * service or running tests never connects to a production Redis instance.
 */
export const cacheRedis = new Redis(REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    keyPrefix: REDIS_KEY_PREFIX,
});

cacheRedis.on('error', error => {
    if (REDIS_ENABLED) {
        logger.warn('[redis-cache] connection error', error);
    }
});

async function ensureConnected() {
    if (!REDIS_ENABLED) {
        return false;
    }
    if (cacheRedis.status === 'wait') {
        await cacheRedis.connect();
    }
    return true;
}

export async function getCache(key: string) {
    if (!(await ensureConnected())) {
        return null;
    }
    return cacheRedis.get(key);
}

export async function setCache(key: string, value: string, expiresInSeconds?: number) {
    if (!(await ensureConnected())) {
        return false;
    }
    if (expiresInSeconds === 0) {
        await cacheRedis.set(key, value);
    } else {
        await cacheRedis.setex(key, expiresInSeconds || 300, value);
    }
    return true;
}

export async function deleteCache(key: string) {
    if (!(await ensureConnected())) {
        return false;
    }
    await cacheRedis.del(key);
    return true;
}

export async function connectCache() {
    await ensureConnected();
}

export async function closeCache() {
    if (cacheRedis.status !== 'wait' && cacheRedis.status !== 'end') {
        await cacheRedis.quit();
    }
}
