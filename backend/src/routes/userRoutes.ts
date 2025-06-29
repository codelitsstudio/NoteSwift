// backend/src/routes/userRoutes.ts
import { Router } from 'express';
// This path must match the folder name exactly:
import { register, getProfile } from '../controller/userController';

const router = Router();

router.post('/register', register);
router.get('/profile/:id', getProfile);

export default router;
