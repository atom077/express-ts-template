import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    test: {
        name: 'express-ts-template',
        root,
        environment: 'node',
        globals: true,
        include: ['tests/**/*.test.ts'],
    },
});
