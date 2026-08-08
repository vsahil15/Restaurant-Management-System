import express from 'express';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();

router.get('/', orderController.getOrder);
router.post('/add', orderController.addToOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;