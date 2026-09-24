import express from 'express';
import { asyncHandler } from './basic/asyncHandler';
import ExampleController from './controllers/ExampleController';

const router = express.Router();

// Internal endpoints are mounted separately so authentication or network
// restrictions can be added here without changing public API routes.
router.get('/health', asyncHandler(ExampleController.health));

export default router;
