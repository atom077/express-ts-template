import { z } from 'zod';
import { BaseRequest, BaseResponse } from '../basic/route';
import { checkParamsType } from '../basic/utils';
import { enqueueExampleJob } from '../queue/exampleQueue';
import ExampleService from '../services/example';

class ExampleController {
    async health(_req: BaseRequest, res: BaseResponse) {
        res.send({ status: 'ok' });
    }

    async get(req: BaseRequest, res: BaseResponse) {
        const rule = z.object({
            id: z.string().min(1),
        });
        const params = checkParamsType(rule, req.params);
        const result = await ExampleService.get(params.id);
        res.send(result);
    }

    async private(req: BaseRequest, res: BaseResponse) {
        res.send({
            authenticated: true,
            userId: req.user?.objectId,
        });
    }

    async enqueue(req: BaseRequest, res: BaseResponse) {
        const rule = z.object({
            id: z.string().min(1),
            delayMs: z.number().int().min(0).max(24 * 60 * 60 * 1000)
                .optional(),
        });
        const body = checkParamsType(rule, req.body);
        const job = await enqueueExampleJob({
            id: body.id,
            requestedAt: new Date().toISOString(),
        }, body.delayMs);
        res.status(202).send({
            queue: 'express-ts-template:example',
            jobId: job.id,
        });
    }
}

export default new ExampleController();
