import express from 'express';
import * as inventoryMangController from '../controllers/inventoryMang.controller.js';

const router = express.Router();

router.get('/',inventoryMangController.getAll);
router.post('/add',inventoryMangController.addIngredient);
router.patch('/restock/:id',inventoryMangController.refillIngredient);

export default router;

