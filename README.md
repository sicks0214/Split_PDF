# Split PDF Tool

完整的 PDF 分割工具，支持三种分割模式：按页码范围、固定页数、提取指定页面。

## 功能特性

- ✅ **三种分割模式**
  - 📄 按页码范围（1-3, 5, 8-10）
  - 📊 固定页数（每 N 页一个文件）
  - 🎯 提取指定页面（1, 3, 7）

- ✅ **技术栈**
  - 前端：Next.js 14 + TypeScript + Tailwind CSS
  - 后端：Express + TypeScript + pdf-lib
  - 部署：Docker + Docker Compose

- ✅ **SEO 优化**
  - 完整的 How-to 教程
  - FAQ 常见问题
  - 使用场景说明

## 项目结构

```
split-pdf-tool/
├── frontend/               # Next.js 前端应用
│   ├── src/
│   │   ├── app/           # 页面和布局
│   │   ├── components/    # React 组件
│   │   ├── lib/           # API 调用
│   │   └── types/         # TypeScript 类型
│   ├── Dockerfile
│   └── package.json
├── backend/               # Express 后端 API
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── controllers/  # 请求处理
│   │   ├── services/     # PDF 处理逻辑
│   │   ├── utils/        # 工具函数
│   │   └── types/        # TypeScript 类型
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml     # Docker 编排配置
```

## 本地开发

### 前提条件

- Node.js 18+
- npm 或 yarn
- Docker 和 Docker Compose（可选）

### 方式 1：分别运行前后端

#### 1. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将运行在 `http://localhost:4001`

#### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:3002`

### 方式 2：使用 Docker Compose

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 `http://localhost:3002` 查看应用。

## 部署到 VPS

### 1. 准备 VPS 环境

确保 VPS 已安装：
- Docker
- Docker Compose
- Nginx

### 2. 上传代码

```bash
# 打包项目
tar -czf split-pdf-tool.tar.gz split-pdf-tool/

# 上传到 VPS
scp split-pdf-tool.tar.gz toolibox@82.29.67.124:/var/www/

# 在 VPS 上解压
ssh toolibox@82.29.67.124
cd /var/www
tar -xzf split-pdf-tool.tar.gz
```

### 3. 构建 Docker 镜像

```bash
cd /var/www/split-pdf-tool

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 验证运行状态
docker ps
```

### 4. 配置 Nginx 反向代理

在 `/etc/nginx/sites-available/toolibox.conf` 中添加：

```nginx
# Split PDF 前端
location /pdf-tools/split-pdf {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Split PDF API
location /api/pdf/split {
    proxy_pass http://127.0.0.1:4001/api/pdf/split;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 50M;
}
```

重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 验证部署

```bash
# 检查后端健康
curl http://localhost:4001/api/pdf/health

# 检查前端
curl http://localhost:3002

# 通过浏览器访问
# http://82.29.67.124/pdf-tools/split-pdf
```

## API 文档

### POST /api/pdf/split

分割 PDF 文件。

**请求格式：** `multipart/form-data`

**参数：**
- `file`: PDF 文件
- `commands`: 命令字符串

**命令格式：**

```bash
# 按范围分割
--mode range --range 1-3,5,8-10

# 固定页数分割
--mode fixed --pages-per-file 5

# 提取指定页
--mode extract --pages 1,3,7
```

**响应：**
- 单个文件：直接返回 PDF
- 多个文件：返回 ZIP 压缩包

### GET /api/pdf/health

健康检查端点。

**响应：**
```json
{
  "success": true,
  "message": "Split PDF service is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 技术细节

### 后端架构

- **多阶段 Docker 构建**：优化镜像大小
- **TypeScript 编译**：在构建阶段完成
- **pdf-lib 库**：纯 JavaScript，无需外部依赖
- **Multer**：处理文件上传
- **Archiver**：生成 ZIP 文件

### 前端架构

- **Next.js Standalone**：优化部署体积
- **Tailwind CSS**：快速样式开发
- **客户端组件**：交互式文件上传
- **Axios**：API 请求处理

## 故障排查

### 后端容器无法启动

```bash
# 查看日志
docker logs split-pdf-backend

# 常见问题：
# 1. 端口被占用 - 修改 docker-compose.yml 中的端口
# 2. TypeScript 编译失败 - 检查 tsconfig.json 配置
```

### 前端构建失败

```bash
# 检查 Node.js 版本
node -v  # 应该是 18+

# 清理并重新构建
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

### CORS 错误

在 `backend/.env` 中设置：

```
CORS_ORIGIN=http://your-frontend-domain.com
```

## 许可证

MIT License

## 联系方式

- 项目仓库：GitHub
- 问题反馈：Issues
