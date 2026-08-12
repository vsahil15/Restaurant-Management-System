import express from 'express';
import * as bookController from '../controllers/book.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/vacantTable', bookController.checkAvailable);
router.get('/my-bookings', authenticate, bookController.getUserBookings);
router.post('/booking', authenticate, bookController.booking);
router.delete('/cancel/booking/:id', authenticate, bookController.cancelBooking);
router.patch('/update/booking/:id', authenticate, bookController.updateBooking);
export default router;