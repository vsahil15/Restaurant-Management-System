import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/stats', adminController.getAdminDashboardStats);
router.get('/orders-by-date', adminController.getOrdersByDate);
router.get('/table-bill', adminController.getTableBill);
router.get('/bookings', adminController.getBookedTables);
router.delete('/booking/:id/free', adminController.freeTable);

export default router;
