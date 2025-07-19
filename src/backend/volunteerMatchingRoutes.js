import express from 'express';
import { getMatches, postMatch } from './volunteerMatchingController.js';

const router = express.Router();

router.get('/', getMatches);
router.post('/', postMatch);

export default router;
