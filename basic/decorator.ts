import { logger } from './logger';
import {
    deleteCache, getCache, setCache,
} from '../cache/redis';

export interface CacheOptions {
    refresh?: boolean;
    ex?: number;
}

/**
 * Cache the result of an async service method in Redis.
 *
 * Key placeholders follow the repository convention, for example:
 * `@AutoCache('example:${0}', 60)`. The final options argument may contain
 * `{ refresh: true }` to bypass an existing value, or `{ ex: 0 }` to keep it
 * permanently.
 */
export function AutoCache(keyTemplate: string, ex = 300) {
    return (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            throw new TypeError('@AutoCache can only decorate a method');
        }

        descriptor.value = async function cachedMethod(...args: any[]) {
            const cacheKey = keyTemplate.replace(/\$\{(\d+)\}/g, (_match, index: string) => (
                String(args[Number(index)] ?? '')
            ));
            const options = args.at(-1) as CacheOptions | undefined;
            const shouldRefresh = Boolean(options?.refresh);

            if (!shouldRefresh) {
                try {
                    const cachedValue = await getCache(cacheKey);
                    if (cachedValue !== null) {
                        return JSON.parse(cachedValue);
                    }
                } catch (error) {
                    // Cache failures must not make the business method fail.
                    logger.warn(`[cache] read failed for ${cacheKey}`, error);
                }
            }

            const value = await originalMethod.apply(this, args);

            try {
                await setCache(cacheKey, JSON.stringify(value), options?.ex ?? ex);
            } catch (error) {
                logger.warn(`[cache] write failed for ${cacheKey}`, error);
            }

            return value;
        };

        // Keep the method available for targeted invalidation in services.
        Object.defineProperty(descriptor.value, 'clearCache', {
            value: async (...args: any[]) => {
                const cacheKey = keyTemplate.replace(/\$\{(\d+)\}/g, (_match, index: string) => (
                    String(args[Number(index)] ?? '')
                ));
                await deleteCache(cacheKey);
            },
        });

        return descriptor;
    };
}
