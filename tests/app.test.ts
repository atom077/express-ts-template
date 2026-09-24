import request from 'supertest';
import { createApp } from '../app';

describe('express-ts-template', () => {
    const app = createApp();

    it('exposes a health endpoint', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    it('validates and handles route parameters', async () => {
        const response = await request(app).get('/api/v1/examples/demo');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe('demo');
        expect(response.body.generatedAt).toEqual(expect.any(String));
    });

    it('rejects protected routes without a token', async () => {
        const response = await request(app).get('/api/v1/examples/private');

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(100000006);
    });
});
