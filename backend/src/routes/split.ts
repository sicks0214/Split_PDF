import express from 'express';
import multer from 'multer';
import { splitPDFHandler, healthCheck } from '../controllers/splitController';

const router = express.Router();

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) // 默认 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// 路由定义
router.post('/split', upload.single('file'), splitPDFHandler);
router.get('/health', healthCheck);

export default router;
