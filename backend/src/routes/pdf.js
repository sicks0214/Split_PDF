const express = require('express');
const upload = require('../middleware/upload');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

router.post('/split', upload.single('file'), pdfController.split);

module.exports = router;
