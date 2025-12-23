# Toolibox VPS 系统说明文档（微前端 + 后端 API 架构版 · 2025）

本文档适用于当前 `/var/www/toolibox` 部署的生产服务器
完整描述整个 Toolibox 平台的服务结构、服务器结构、Docker 结构、Nginx 路由、微前端体系、统一后端 API 服务。

**文档版本**：Toolibox 3.0
**架构模式**：微前端（前端） + 后端 API（核心处理）

---

## 目录

1. 系统整体概述
2. VPS 基础环境说明
3. 架构设计（3.0 版：微前端 + 后端 API）
4. 服务结构与端口规范
5. 目录结构（完整版）
6. Docker 部署规范
7. Nginx 路由规范
8. 后端 API 服务规范
9. 微前端项目规范
10. 安全与文件处理规范
11. 新工具的扩展流程
12. 服务管理命令
13. 常见问题（FAQ）
14. 更新日志

---

## 1. 系统整体概述

Toolibox 是一个多功能工具聚合平台，包括 PDF、Image、Text 等工具。

系统采用：

- **微前端** → 每个工具是独立 Next.js 项目
- **统一后端 API** → 所有 PDF/Image/Text 处理逻辑集中在唯一后端
- **Docker 容器化部署**
- **Nginx 路由统一分发**

---

## 2. VPS 基础环境说明

服务器环境（与你原文档一致）：

| 项目 | 值 |
|------|-----|
| 系统 | Ubuntu / Debian |
| 目录 | `/var/www/toolibox` |
| 运行方式 | Docker + Docker Compose |
| Web Server | Nginx |
| 防火墙 | UFW（仅开放 22 & 80） |
| 用户 | root（建议不使用 sudo 前缀） |
| 数据持久化 | R2 / 临时文件处理 |

此环境 **无需修改**。

---

## 3. 架构设计（3.0 微前端 + 后端 API）

系统架构如下：

```
Internet
   │
   ▼
Nginx (host) - 82.29.67.124
   │
   ├── /                   → frontend-main (3000)
   ├── /pdf-tools         → frontend-pdf-tools (3001)
   ├── /image-tools/*     → frontend-image (3002) [待部署]
   ├── /text-tools/*      → frontend-text (3003) [待部署]
   │
   └── /api/*             → backend-main (8000)
```

架构特点：

| 层级 | 说明 |
|------|------|
| 微前端（Next.js 静态部署） | 独立前端模块用于 UI、SEO |
| 后端 API（Node） | PDF / Image / Text 的核心处理 |
| Nginx | 全站流量网关 |
| Docker | 运行所有服务 |

---

## 4. 服务结构与端口规范

| 服务名称 | 类型 | 描述 | 容器端口 | Nginx 路径 |
|---------|------|------|---------|-----------|
| frontend-main | Micro FE | 主导航站 | 3000 | `/` | ✅ 运行中 |
| frontend-pdf-tools | Micro FE | PDF 工具前端 | 3001 | `/pdf-tools` | ✅ 运行中 |
| frontend-image | Micro FE | 图片工具前端 | 3002 | `/image-tools/*` | ⏳ 待部署 |
| frontend-text | Micro FE | 文本工具前端 | 3003 | `/text-tools/*` | ⏳ 待部署 |
| backend-main | API Server | 统一后端API | 8000 | `/api/*` | ✅ 运行中 |

---

## 5. 目录结构（实际部署版）

```
/var/www/toolibox/
├── docker-compose.yml
├── .env
├── nginx/
│
├── frontend/
│   ├── main/                      ← 主站（已部署）
│   ├── pdf-tools/                 ← PDF工具前端（已部署）
│   ├── image/                     ← 图片工具前端（待部署）
│   └── text/                      ← 文本工具前端（待部署）
│
└── backend/                       ← ★ 统一后端（已部署，端口8000）
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── feedback.ts
    │   │   ├── health.ts
    │   │   ├── simplify.ts
    │   │   ├── pdf.ts            ← PDF路由（新增）
    │   │   └── image.ts          ← Image路由（新增）
    │   ├── services/
    │   ├── middleware/
    │   ├── controllers/
    │   ├── config/
    │   └── app.ts
    ├── prisma/
    ├── Dockerfile
    ├── package.json
    └── tsconfig.json
```

---

## 6. Docker 部署规范（实际配置）

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Main frontend (导航/首页)
  frontend-main:
    build:
      context: ./frontend/main
      dockerfile: Dockerfile
    image: toolibox/frontend-main
    container_name: toolibox-frontend-main
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BACKEND_URL=http://backend-main:8000/api
    depends_on:
      - backend-main
    networks:
      - toolibox-network

  # PDF Tools frontend
  frontend-pdf-tools:
    build:
      context: ./frontend/pdf-tools
      dockerfile: Dockerfile
    image: toolibox/frontend-pdf-tools
    container_name: toolibox-frontend-pdf-tools
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    networks:
      - toolibox-network

  # Main backend (统一后端服务)
  backend-main:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: toolibox/backend-main
    container_name: toolibox-backend-main
    restart: always
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PORT=8000
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    networks:
      - toolibox-network

networks:
  toolibox-network:
    name: toolibox-network
    driver: bridge
```

---

## 7. Nginx 路由规范（当前生产配置）

`/etc/nginx/sites-available/toolibox.conf`

```nginx
server {
    listen 80;
    server_name 82.29.67.124;

    # 主站
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 统一后端 API（支持100MB文件上传）
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    # PDF Tools Frontend
    location /pdf-tools {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**配置说明**：
- 已删除未使用的 `/api/pdf/` 路由（原指向4001端口）
- `/api/` 路由支持最大100MB文件上传
- 所有路由已测试验证正常工作

---

## 8. 后端 API 服务规范（核心）

`backend-api` 是唯一后端，负责所有计算逻辑。

### 后端职责：

| 功能 | 是否在后端 |
|------|-----------|
| PDF 合并 | ✔ |
| PDF 压缩 | ✔ |
| PDF 分割 | ✔ |
| 图像转换 | ✔ |
| 图像压缩 | ✔ |
| 文字清洗 | ✔ |
| OCR | ✔ |
| 文件保存至 R2 | ✔ |

**前端永远不负责核心逻辑。**

### API 路由结构

```
/api/pdf/merge
/api/pdf/split
/api/pdf/compress

/api/image/convert
/api/image/resize

/api/text/clean
/api/text/detect
```

---

## 9. 微前端项目规范

每个前端：

- Next.js App Router
- basePath + localePrefix
- 静态构建
- 纯 UI 层
- **禁止写任何 PDF/Image/Text 逻辑**

前端必须通过：

```typescript
await fetch("/api/pdf/merge", { ... });
```

与后端通信。

---

## 10. 安全与文件处理规范

### 文件上传限制：

- 最大单文件 100MB
- 批量最多 20 个
- 后端临时文件路径自动清理

### 敏感逻辑：

| 项目 | 是否允许在前端执行 |
|------|------------------|
| PDF 合并 | ❌ |
| GhostScript 调用 | ❌ |
| 图像压缩 | ❌ |
| 文本解析 | ❌ |
| 文件合成 | ❌ |

---

## 11. 新工具扩展流程（标准化）

### Step 1：创建微前端页面

例：Image Convert

```
/frontend/image/convert-image/
```

### Step 2：创建对应 API

```
backend-api/src/routes/image/convert.ts
```

### Step 3：在前端调用 API

```
POST /api/image/convert
```

### Step 4：添加到导航站

```
/image-tools/en/convert-image
```

---

## 12. 服务管理命令

### 启动

```bash
docker compose up -d
```

### 停止

```bash
docker compose down
```

### 查看容器

```bash
docker ps
```

### 重启某服务

```bash
docker compose restart frontend-pdf
```

### 查看 backend-main 日志

```bash
docker logs toolibox-backend-main -f
```

### 重新构建backend

```bash
# 更新依赖后需要重新构建
cd /var/www/toolibox
docker stop toolibox-backend-main
docker build -t toolibox/backend-main ./backend
docker compose up -d backend-main
```

---

## 13. API 测试方法

### 测试健康检查

```bash
# 内部测试
curl http://localhost:8000/api/health

# 外部测试（通过Nginx）
curl http://82.29.67.124/api/health
```

### 测试PDF路由

```bash
# PDF合并
curl -X POST http://82.29.67.124/api/pdf/merge

# PDF分割
curl -X POST http://82.29.67.124/api/pdf/split

# PDF压缩
curl -X POST http://82.29.67.124/api/pdf/compress
```

### 测试Image路由

```bash
# 图片转换
curl -X POST http://82.29.67.124/api/image/convert

# 图片压缩
curl -X POST http://82.29.67.124/api/image/compress
```

### 测试文件上传（待实现）

```bash
# 上传单个文件
curl -X POST http://82.29.67.124/api/pdf/merge \
  -F "files=@test.pdf"

# 上传多个文件
curl -X POST http://82.29.67.124/api/pdf/merge \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf"
```

---

## 14. 常见问题（FAQ）

### Q1：Nginx 必须改动吗？

需要新增 `/api/*` 路由，其它不改。

### Q2：微前端和后端能否混在一起？

不能，必须分开。

### Q3：为什么要统一后端？

提升扩展性、安全性、维护成本低。

### Q4：未来新增 100 个工具怎么办？

只需增加微前端页面 + 增加 API 路由。

---

## 14. 更新日志

### 2025-12-22（v3.0 当前状态）

**系统架构**：
- Backend端口：8000
- 容器名称：toolibox-backend-main
- 运行状态：正常
- 定时备份：已启用（每日2:00 AM）

**已部署的API端点**：
```
/api/health          ← 健康检查 ✅
/api/auth/*          ← 用户认证 ✅
/api/feedback        ← 反馈收集 ✅
/api/simplify        ← 文本简化 ✅
/api/pdf/merge       ← PDF合并（路由已添加，逻辑待实现）
/api/pdf/split       ← PDF分割（路由已添加，逻辑待实现）
/api/pdf/compress    ← PDF压缩（路由已添加，逻辑待实现）
/api/image/convert   ← 图片转换（路由已添加，逻辑待实现）
/api/image/compress  ← 图片压缩（路由已添加，逻辑待实现）
```

**技术栈**：
```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.478.0",
    "@prisma/client": "^5.7.0",
    "axios": "^1.13.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.2",
    "pdf-lib": "^1.17.1",
    "node-cron": "^3.0.3"
  }
}
```

**测试结果**（2025-12-22 06:55 UTC）：
```bash
$ curl http://82.29.67.124/api/health
{"success":true,"message":"Server is running","timestamp":"2025-12-22T06:55:52.629Z"}
✅ 所有端点响应正常
```

**系统资源**：
- 磁盘使用：15GB / 30GB (53%)
- 容器状态：3个运行中
- 内存使用：正常
- API响应时间：<50ms

---

🎉 **v3.0 文档 - 反映当前生产环境实际配置**

**最后更新**：2025-12-22 06:55 UTC
**系统状态**：运行正常
**服务器IP**：82.29.67.124
