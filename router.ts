import express from 'express';
import { asyncHandler } from './basic/asyncHandler';
import ExampleController from './controllers/ExampleController';
import { requireToken } from './middleware/token';

const router = express.Router();

router.get('/health', asyncHandler(ExampleController.health));
router.get('/v1/examples/private', asyncHandler(requireToken()), asyncHandler(ExampleController.private));
router.get('/v1/examples/:id', asyncHandler(ExampleController.get));
router.post('/v1/examples/jobs', asyncHandler(ExampleController.enqueue));

export default router;
