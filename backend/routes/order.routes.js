import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { bookedOrNot } from '../middlewares/bookedOrNot.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, orderController.getOrder);
router.post('/add', authenticate, bookedOrNot, orderController.addToOrder);
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);

export default router;