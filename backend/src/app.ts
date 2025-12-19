import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import splitRoutes from './routes/split';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/pdf', splitRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'Split PDF Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      split: 'POST /api/pdf/split',
      health: 'GET /api/pdf/health'
    }
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('✅ Split PDF Backend Service');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 API: http://localhost:${PORT}/api/pdf`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/pdf/health`);
});

export default app;
