import http from 'http';
import process from 'process';
import { createApp } from './app';
import { closeCache, connectCache } from './cache/redis';
import { APP_NAME, PORT, QUEUE_WORKER_ENABLED } from './config/config';
import { logger } from './basic/logger';
import { closeExampleQueue, startExampleWorker } from './queue/exampleQueue';

const app = createApp();
let server: http.Server | undefined;
let shuttingDown = false;
const SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * 在这里初始化 MongoDB、PostgreSQL、Redis 等服务级资源。
 */
async function init() {
    await connectCache();
    if (QUEUE_WORKER_ENABLED) {
        startExampleWorker();
    }
}

/**
 * 在这里释放 init 中创建的服务级资源。
 */
async function releaseServer() {
    await closeExampleQueue();
    await closeCache();
}

async function startServer() {
    await init();
    server = app.listen(PORT, () => {
        logger.info(`${APP_NAME} is running at ${PORT}`);
    });
    return server;
}

async function stopServer() {
    if (!server) {
        await releaseServer();
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`server close timed out after ${SHUTDOWN_TIMEOUT_MS}ms`));
        }, SHUTDOWN_TIMEOUT_MS);

        server?.close(error => {
            clearTimeout(timeout);
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
    server = undefined;
    await releaseServer();
    logger.info(`${APP_NAME} is closed`);
}

function handleShutdown(signal: string) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;

    stopServer()
        .then(() => {
            logger.info(`received ${signal}, shutdown completed`);
            process.exit(0);
        })
        .catch(error => {
            logger.error('Error while shutting down server', error);
            process.exit(1);
        });
}

if (require.main === module) {
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    startServer().catch(error => {
        logger.error('Error starting server', error);
        process.exit(1);
    });
}

export {
    app,
    init,
    releaseServer,
    startServer,
    stopServer,
};
