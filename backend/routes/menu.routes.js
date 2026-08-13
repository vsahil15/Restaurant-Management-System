import express from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', menuController.listMenu);

// Admin-only endpoints
router.post('/add', authenticate, adminOnly, menuController.addMenuItem);
router.patch('/update/:id', authenticate, adminOnly, menuController.updateMenuItem);
router.delete('/delete/:id', authenticate, adminOnly, menuController.deleteMenuItem);

export default router;
