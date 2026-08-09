import express from 'express';
import * as inventoryMangController from '../controllers/inventoryMang.controller.js';

const router = express.Router();

router.get('/',inventoryMangController.getAll);

export default router;

