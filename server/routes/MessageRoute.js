import express from 'express';
import { addMessage, getMessages ,UpateMessageStatus,updateUserMessageToDelivered,InitialupdateUserMessageToDelivered,updateMessageStatusToRead} from '../controllers/MessageController.js';

const router = express.Router();

router.post('/', addMessage);
router.get('/:chatId', getMessages);
router.post("/updateStatus",UpateMessageStatus)
router.put("/status/sender/:senderId",updateUserMessageToDelivered)
router.put("/status/receiver/:receiverId",InitialupdateUserMessageToDelivered)
router.put("/status/read/:chatId/:currentUser", updateMessageStatusToRead);

export default router