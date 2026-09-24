import { Job, Queue, Worker } from 'bullmq';
import { logger } from '../basic/logger';
import {
    QUEUE_CONCURRENCY, QUEUE_ENABLED, QUEUE_REDIS_URL,
} from '../config/config';

export const EXAMPLE_QUEUE_NAME = 'express-ts-template:example';
export const EXAMPLE_JOB_NAME = 'example-job';

export type ExampleJobData = {
    id: string;
    requestedAt: string;
};

export type ExampleJobResult = {
    id: string;
    processedAt: string;
};

let exampleQueue: Queue<ExampleJobData, ExampleJobResult> | undefined;
let exampleWorker: Worker<ExampleJobData, ExampleJobResult> | undefined;

export function getExampleQueue() {
    if (!QUEUE_ENABLED) {
        throw new Error('BullMQ is disabled; set QUEUE_ENABLED=true to enqueue jobs');
    }
    exampleQueue ||= new Queue<ExampleJobData, ExampleJobResult>(EXAMPLE_QUEUE_NAME, {
        connection: {
            url: QUEUE_REDIS_URL,
        },
        defaultJobOptions: {
            removeOnComplete: { age: 60 * 60, count: 1000 },
            removeOnFail: { age: 24 * 60 * 60, count: 5000 },
        },
    });
    return exampleQueue;
}

export async function enqueueExampleJob(data: ExampleJobData, delay = 0) {
    const job = await getExampleQueue().add(EXAMPLE_JOB_NAME, data, { delay });
    return job;
}

export function startExampleWorker() {
    if (!QUEUE_ENABLED || exampleWorker) {
        return exampleWorker;
    }
    exampleWorker = new Worker<ExampleJobData, ExampleJobResult>(
        EXAMPLE_QUEUE_NAME,
        async (job: Job<ExampleJobData>) => {
            logger.info(`[queue] processing ${job.name}`, { jobId: job.id, data: job.data });
            return {
                id: job.data.id,
                processedAt: new Date().toISOString(),
            };
        },
        {
            connection: {
                url: QUEUE_REDIS_URL,
                maxRetriesPerRequest: null,
            },
            concurrency: QUEUE_CONCURRENCY,
        },
    );
    exampleWorker.on('failed', (job, error) => {
        logger.error('[queue] example job failed', { jobId: job?.id, error });
    });
    exampleWorker.on('error', error => {
        logger.error('[queue] worker error', error);
    });
    return exampleWorker;
}

export async function closeExampleQueue() {
    await exampleWorker?.close();
    await exampleQueue?.close();
    exampleWorker = undefined;
    exampleQueue = undefined;
}
