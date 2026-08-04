import express from 'express';

const router = express.Router();

router.get('/',orderController.getOrder);
router.post('/add',orderController.)addToOrder;
router.patch('/:id/cancel', orderController.cancelOrder);