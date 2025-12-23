import express from 'express';
import upload from '../middleware/upload';
import * as pdfController from '../controllers/pdfController';

const router = express.Router();

router.post('/split', upload.single('file'), pdfController.split);

export default router;
