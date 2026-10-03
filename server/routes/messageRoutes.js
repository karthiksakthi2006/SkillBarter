import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import { getOrCreateConversation, listConversations, sendMessage } from '../controllers/messageController.js';
const router = Router();
router.get('/conversations', auth, listConversations);
router.post('/conversations/:userId', auth, getOrCreateConversation);
router.post('/', auth, sendMessage);
export default router;
