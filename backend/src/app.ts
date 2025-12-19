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
// 注意：在 VPS 环境下，Nginx 会将 /api/pdf/* 代理到 4001端口并去除 /api/pdf 前缀
// 所以这里直接使用根路径，而不是 /api/pdf
app.use('/', splitRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    service: 'Split PDF Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      split: 'POST /split',
      health: 'GET /health'
    },
    note: 'In production, access via /api/pdf/* through Nginx proxy'
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
  console.log(`📝 API endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/split`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`💚 Production: Access via /api/pdf/* through Nginx`);
});

export default app;
