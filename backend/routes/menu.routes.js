import express from 'express';
import * as menuController from '../controllers/menu.controller.js';

const router = express.Router();

router.get('/', menuController.listMenu);
router.post('/add', menuController.addMenuItem);

export default router;
