import express from 'express';
import { getEventHistory } from '../services/eventHistoryService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(getEventHistory());
});

export default router;
