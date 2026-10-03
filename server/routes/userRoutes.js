import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import { getProfile, searchUsers, updateMe } from '../controllers/userController.js';
const router = Router();
router.get('/search', auth, searchUsers);
router.get('/:username', auth, getProfile);
router.put('/me', auth, updateMe);
export default router;
