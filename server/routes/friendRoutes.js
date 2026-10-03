import { Router } from 'express';
import auth from '../middleware/authMiddleware.js';
import { listRequests, respond, sendRequest, status } from '../controllers/friendController.js';
const router = Router();
router.get('/requests', auth, listRequests);
router.get('/status/:userId', auth, status);
router.post('/request/:userId', auth, sendRequest);
router.post('/:action/:requestId', auth, respond);
export default router;
