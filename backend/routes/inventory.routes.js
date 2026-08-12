import express from 'express';
import * as inventoryMangController from '../controllers/inventoryMang.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', authenticate, adminOnly, inventoryMangController.getAll);
router.post('/add', authenticate, adminOnly, inventoryMangController.addIngredient);
router.patch('/restock/:id', authenticate, adminOnly, inventoryMangController.refillIngredient);

export default router;

