import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import { getRoom, listInvites, respondInvite, sendInvite } from '../controllers/studyController.js';

const router = Router();
router.get('/invites', auth, listInvites);
router.post('/invite/:userId', auth, sendInvite);
router.post('/invites/:action/:inviteId', auth, respondInvite);
router.get('/rooms/:roomId', auth, getRoom);
export default router;
