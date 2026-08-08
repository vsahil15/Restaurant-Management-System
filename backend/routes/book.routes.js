import express from 'express';
import * as bookController from '../controllers/book.controller.js';

const router= express.Router();

router.get('/vacantTable',bookController.checkAvailable)
router.post('/booking',bookController.booking);
router.delete('cancel/booking/:id',bookController.cancelBooking);
router.patch('update/booking/:id',bookController.updateBooking);
export default router;