# Toolibox 工具开发指导文档

> 微前端 + 后端API架构 - 通用工具开发模板

---

## 目录

1. [项目概述](#一项目概述)
2. [系统架构](#二系统架构)
3. [关键参数配置](#三关键参数配置)
4. [目录结构](#四目录结构)
5. [快速部署](#五快速部署)
6. [开发规范](#六开发规范)
7. [常见问题](#七常见问题)
8. [开发检查清单](#八开发检查清单)

---

## 一、项目概述

### 1.1 项目信息模板

| 项目 | 值 |
|------|-----|
| 项目名称 | `<your-tool-name>` |
| VPS IP | `<your-vps-ip>` |
| 项目目录 | `/var/www/toolibox/<your-tool-name>` |
| GitHub | `https://github.com/<username>/<your-tool-name>` |
| 部署方式 | Docker + Docker Compose |

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| 前端语言 | TypeScript |
| 样式 | Tailwind CSS |
| 国际化 | next-intl |
| 后端框架 | Express.js |
| 后端语言 | TypeScript |
| 文件上传 | Multer (内存存储) |
| 核心处理库 | `<根据工具类型选择>` |
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |

### 1.3 功能模块规划

| 模块 | 状态 | 说明 |
|------|------|------|
| 核心功能 | 🔄 开发中 | 工具的主要功能 |
| 文件分析 | 🔄 开发中 | 文件元数据获取 |
| 结果导出 | 🔄 开发中 | 处理结果下载 |

### 1.4 后端API端点规划

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | ✅ 必须 |
| `/api/<tool>/analyze` | POST | 文件分析 | 🔄 根据需求 |
| `/api/<tool>/process` | POST | 核心处理功能 | 🔄 根据需求 |

---

## 二、系统架构

### 2.1 架构图

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │     Nginx      │
              │  <VPS-IP>      │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │  Main   │  │Your Tool │  │ Backend │
   │ :3000   │  │  :300X   │  │  :8000  │
   └─────────┘  └──────────┘  └─────────┘
```

### 2.2 容器服务

| 容器名 | 镜像 | 端口 | 路由 |
|--------|------|------|------|
| toolibox-frontend-main | toolibox/frontend-main | 3000 | `/` |
| toolibox-frontend-`<tool-name>` | toolibox/frontend-`<tool-name>` | 300X | `/<tool-path>/*` |
| toolibox-backend-main | toolibox/backend-main | 8000 | `/api/*` |

**端口分配规则**：
- 主站前端：3000
- 工具前端：3001-3099（按工具递增）
- 统一后端：8000

### 2.3 Nginx 路由配置模板

```nginx
# /etc/nginx/sites-available/toolibox.conf

server {
    listen 80;
    server_name <your-vps-ip>;

    # Main 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 工具微前端（根据实际工具路径修改）
    location /<tool-path> {
        proxy_pass http://127.0.0.1:300X;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API（根据文件大小需求调整）
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;  # 根据需求调整
    }
}
```

---

## 三、关键参数配置

### 3.1 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| 工具前端 | 300X | 根据工具顺序分配（3001, 3002, ...） |
| 统一后端 | 8000 | 所有工具共享同一后端 |

### 3.2 环境变量

**前端 (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_MAIN_APP_URL=
```

**后端**:
```bash
PORT=8000
NODE_ENV=production
```

### 3.3 文件上传限制（根据工具需求调整）

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| 单文件大小 | 100MB | Multer配置，根据需求调整 |
| 最大文件数 | 20 | 批量上传限制 |
| 存储方式 | 内存 | memoryStorage（推荐） |
| 临时文件 | 自动清理 | 处理后立即释放 |

### 3.4 国际化配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 支持语言 | `en`, `zh` | 英文、中文（可扩展） |
| 默认语言 | `en` | 英文 |
| localePrefix | `always` | 所有路径都包含语言前缀 |

**URL 格式**:
- `/<tool-path>/en/<page>` - 英文页面
- `/<tool-path>/zh/<page>` - 中文页面

---

## 四、目录结构

```
<Your-Tool>/
├── frontend/<tool-name>/          # 工具微前端
│   ├── src/
│   │   ├── app/[locale]/          # 国际化路由
│   │   │   └── <page-name>/       # 工具主页面
│   │   │       └── page.tsx
│   │   ├── components/            # React 组件
│   │   │   ├── CoreToolArea.tsx   # 核心工具区域
│   │   │   ├── ResultPage.tsx     # 结果页面
│   │   │   ├── HowToSection.tsx   # 使用说明
│   │   │   ├── FAQSection.tsx     # 常见问题
│   │   │   ├── UseCaseCards.tsx   # 使用场景
│   │   │   ├── InlineFeedback.tsx # 反馈组件
│   │   │   ├── Breadcrumb.tsx     # 面包屑导航
│   │   │   └── layout/            # 布局组件
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts             # 后端 API 调用
│   │   │   └── utils.ts           # 前端工具函数
│   │   ├── locales/               # 翻译文件
│   │   │   ├── en.json
│   │   │   └── zh.json
│   │   ├── i18n/
│   │   │   └── request.ts         # i18n 配置
│   │   ├── config.ts              # 配置文件
│   │   ├── middleware.ts          # 中间件
│   │   └── navigation.ts          # 导航配置
│   ├── next.config.js             # basePath: '/<tool-path>'
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                       # 后端 API
│   ├── src/
│   │   ├── app.ts                 # 入口文件
│   │   └── routes/
│   │       └── <tool>.ts          # 工具 API路由
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                          # 文档
│   ├── <Tool>_Technical_Documentation.md
│   └── Toolibox_3.0_VPS.md
│
├── docker-compose.yml             # 容器编排
├── .gitignore
└── README.md
```

---

## 五、快速部署

### 5.1 本地开发

**启动后端**:
```bash
cd backend
npm install
npm run dev
```

**启动前端**（新终端）:
```bash
cd frontend/<tool-name>
npm install
npm run dev
```

**访问地址**:
- 前端: http://localhost:300X/<tool-path>/en/<page>
- 后端: http://localhost:8000/api/health

### 5.2 Docker 部署

**构建并启动**:
```bash
docker compose up -d --build
```

**查看容器状态**:
```bash
docker ps
```

**查看日志**:
```bash
docker logs toolibox-backend-main -f
docker logs toolibox-frontend-<tool-name> -f
```

### 5.3 VPS 部署流程

**1. 连接VPS并进入目录**:
```bash
ssh root@<your-vps-ip>
cd /var/www/toolibox
```

**2. 克隆或更新代码**:
```bash
# 首次部署
git clone https://github.com/<username>/<your-tool>.git

# 更新代码
cd <your-tool>
git pull origin master
```

**3. 停止旧容器（如果存在）**:
```bash
docker stop toolibox-backend-main toolibox-frontend-<tool-name>
docker rm toolibox-backend-main toolibox-frontend-<tool-name>
```

**4. 构建并启动新容器**:
```bash
docker compose up -d --build
```

**5. 验证部署**:
```bash
# 检查容器状态
docker ps

# 测试后端健康检查
curl http://localhost:8000/api/health

# 测试前端访问
curl -I http://localhost:300X/<tool-path>/en/<page>

# 测试通过Nginx访问
curl http://<your-vps-ip>/api/health
curl -I http://<your-vps-ip>/<tool-path>/en/<page>
```

---

## 六、开发规范

### 6.1 架构原则

**前后端职责严格分离**：

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| **微前端** | 纯UI展示、文件上传、结果展示 | ❌ 禁止任何核心处理逻辑 |
| **统一后端** | 所有核心处理逻辑 | 文件分析、处理、转换等 |

**为什么要后端处理？**
- ✅ 安全性：防止客户端代码被篡改
- ✅ 性能：大文件处理不经过浏览器
- ✅ 隐私：文件在服务器端处理后自动清理
- ✅ 一致性：所有用户获得相同的处理结果

**前端调用示例**：
```typescript
// ✅ 正确：前端只负责上传和展示
const processFiles = async () => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f.file));
  formData.append('options', JSON.stringify(options));

  const response = await fetch('/api/<tool>/process', {
    method: 'POST',
    body: formData
  });

  const blob = await response.blob();
  downloadBlob(blob, 'result.ext');
};

// ❌ 错误：前端不应该处理核心逻辑
import { SomeProcessingLibrary } from 'processing-lib';
const result = await SomeProcessingLibrary.process(data); // 禁止
```

### 6.2 API 接口规范

**文件分析接口模板**:
```typescript
POST /api/<tool>/analyze
Content-Type: multipart/form-data

Body:
  file: <文件>

Response:
{
  // 根据工具需求返回元数据
  fileSize: number,
  metadata: object,
  isValid: boolean
}
```

**核心处理接口模板**:
```typescript
POST /api/<tool>/process
Content-Type: multipart/form-data

Body:
  files: <文件数组>
  options: <JSON字符串>

Response:
  <处理后的文件二进制数据>
  Content-Type: <appropriate-mime-type>
  Content-Disposition: attachment; filename="result.ext"
```

### 6.3 错误处理规范

**后端错误响应**:
```typescript
{
  message: string,
  error?: string
}
```

**前端错误处理**:
```typescript
try {
  const response = await fetch('/api/<tool>/process', { ... });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Processing failed');
  }
  // 处理成功响应
} catch (error) {
  console.error('Processing error:', error);
  setError(error.message);
}
```

### 6.4 组件开发规范

**必需组件**：
1. `CoreToolArea.tsx` - 核心工具区域（文件上传、参数配置）
2. `ResultPage.tsx` - 结果展示页面
3. `HowToSection.tsx` - 使用说明
4. `FAQSection.tsx` - 常见问题
5. `InlineFeedback.tsx` - 用户反馈提示

**可选组件**：
1. `UseCaseCards.tsx` - 使用场景展示
2. `Breadcrumb.tsx` - 面包屑导航

### 6.5 国际化规范

**翻译文件结构** (`locales/en.json`, `locales/zh.json`):
```json
{
  "toolName": {
    "title": "Tool Title",
    "subtitle": "Tool Description",
    "features": "Key Features",
    "breadcrumb": {
      "home": "Home",
      "tools": "Tools",
      "current": "Current Tool"
    },
    "feedback": {
      "success": "Success message",
      "error": "Error message",
      "info": "Info message"
    },
    "howTo": {
      "title": "How to Use",
      "steps": ["Step 1", "Step 2", "Step 3"]
    },
    "faq": {
      "title": "FAQ",
      "items": [
        {
          "question": "Question 1",
          "answer": "Answer 1"
        }
      ]
    }
  }
}
```

### 6.6 Docker 配置规范

**前端 Dockerfile 模板**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 300X
ENV PORT 300X
CMD ["node", "server.js"]
```

**后端 Dockerfile 模板**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 8000
CMD ["node", "dist/app.js"]
```

**docker-compose.yml 模板**:
```yaml
version: '3.8'

services:
  backend-main:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: toolibox-backend-main
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PORT=8000
    networks:
      - toolibox-network
    restart: unless-stopped

  frontend-<tool-name>:
    build:
      context: ./frontend/<tool-name>
      dockerfile: Dockerfile
    container_name: toolibox-frontend-<tool-name>
    ports:
      - "300X:300X"
    environment:
      - NODE_ENV=production
      - PORT=300X
    networks:
      - toolibox-network
    restart: unless-stopped

networks:
  toolibox-network:
    name: toolibox-network
    external: true
```

---

## 七、常见问题

### 7.1 Dockerfile 构建失败：public 目录不存在

**症状**:
```
failed to compute cache key: "/app/public": not found
```

**原因**: Next.js standalone 模式不生成 public 目录

**解决**:
从 Dockerfile 中移除 public 目录复制：
```dockerfile
# ❌ 错误
COPY --from=builder /app/public ./public

# ✅ 正确（移除该行）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
```

### 7.2 容器名称冲突

**症状**:
```
The container name "/toolibox-backend-main" is already in use
```

**解决**:
```bash
# 停止并删除旧容器
docker stop toolibox-backend-main toolibox-frontend-<tool-name>
docker rm toolibox-backend-main toolibox-frontend-<tool-name>

# 启动新容器
docker compose up -d
```

### 7.3 网络警告

**症状**:
```
WARN: a network with name toolibox-network exists but was not created for project
```

**解决**:
在 `docker-compose.yml` 中设置网络为外部网络：
```yaml
networks:
  toolibox-network:
    name: toolibox-network
    external: true  # 添加此行
```

### 7.4 CORS 错误

**症状**: 前端无法访问后端API

**解决**:
确保后端启用了CORS：
```typescript
// backend/src/app.ts
import cors from 'cors';
app.use(cors());
```

### 7.5 文件上传大小限制

**症状**: 上传大文件时返回 413 错误

**解决**:
1. 检查 Multer 配置
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

2. 检查 Nginx 配置
```nginx
client_max_body_size 100M;
```

### 7.6 端口冲突

**症状**: 容器启动失败，提示端口已被占用

**解决**:
```bash
# 查看端口占用
lsof -i :300X
lsof -i :8000

# 停止占用端口的容器
docker stop <container-id>
```

---

## 八、开发检查清单

### 8.1 开发前准备

- [ ] 确定工具名称和路径（`<tool-name>`, `<tool-path>`）
- [ ] 分配前端端口（300X）
- [ ] 创建 GitHub 仓库
- [ ] 准备核心处理库（npm 包）
- [ ] 设计 API 接口
- [ ] 规划功能模块

### 8.2 前端开发

- [ ] 创建 Next.js 项目（App Router）
- [ ] 配置 `next.config.js` 的 `basePath`
- [ ] 配置国际化（next-intl）
- [ ] 实现核心组件
  - [ ] CoreToolArea
  - [ ] ResultPage
  - [ ] HowToSection
  - [ ] FAQSection
- [ ] 添加翻译文件（en.json, zh.json）
- [ ] 实现 API 调用层（lib/api.ts）
- [ ] 编写 Dockerfile
- [ ] 测试本地开发环境

### 8.3 后端开发

- [ ] 创建 Express 项目
- [ ] 配置 CORS
- [ ] 实现健康检查端点（`/api/health`）
- [ ] 实现文件分析端点（如需要）
- [ ] 实现核心处理端点
- [ ] 配置 Multer 文件上传
- [ ] 添加错误处理
- [ ] 编写 Dockerfile
- [ ] 测试本地开发环境

### 8.4 Docker 配置

- [ ] 编写 docker-compose.yml
- [ ] 配置容器名称
- [ ] 配置端口映射
- [ ] 配置网络（toolibox-network）
- [ ] 本地测试 Docker 构建
- [ ] 本地测试容器运行

### 8.5 部署前检查

- [ ] 更新 Nginx 配置（添加新工具路由）
- [ ] 测试 Nginx 配置语法（`nginx -t`）
- [ ] 重载 Nginx（`nginx -s reload`）
- [ ] 准备 VPS 部署目录
- [ ] 推送代码到 GitHub

### 8.6 VPS 部署

- [ ] SSH 连接到 VPS
- [ ] 克隆代码到 `/var/www/toolibox/<tool-name>`
- [ ] 停止旧容器（如果存在）
- [ ] 构建 Docker 镜像
- [ ] 启动容器
- [ ] 验证容器状态（`docker ps`）
- [ ] 测试后端健康检查
- [ ] 测试前端访问
- [ ] 测试核心功能

### 8.7 部署后验证

- [ ] `docker ps` 显示容器运行中
- [ ] `curl http://localhost:8000/api/health` 返回 JSON
- [ ] `curl http://<vps-ip>/api/health` 返回 JSON
- [ ] `curl -I http://localhost:300X/<tool-path>/en/<page>` 返回 200
- [ ] `curl -I http://<vps-ip>/<tool-path>/en/<page>` 返回 200
- [ ] 浏览器访问前端页面正常
- [ ] 核心功能实际测试可用
- [ ] 中英文切换正常
- [ ] 文件上传功能正常
- [ ] 结果下载功能正常

### 8.8 文档编写

- [ ] 编写 README.md
- [ ] 编写技术文档（参考本模板）
- [ ] 更新主站导航（添加新工具链接）
- [ ] 编写使用说明（HowToSection）
- [ ] 编写常见问题（FAQSection）

---

## 附录：服务管理命令

### 查看服务状态
```bash
# 查看所有容器
docker ps

# 查看特定容器日志
docker logs toolibox-backend-main -f
docker logs toolibox-frontend-<tool-name> -f
```

### 重启服务
```bash
# 重启所有服务
cd /var/www/toolibox/<your-tool>
docker compose restart

# 重启特定服务
docker compose restart backend-main
docker compose restart frontend-<tool-name>
```

### 更新部署
```bash
# 1. 拉取最新代码
cd /var/www/toolibox/<your-tool>
git pull origin master

# 2. 停止旧容器
docker stop toolibox-backend-main toolibox-frontend-<tool-name>
docker rm toolibox-backend-main toolibox-frontend-<tool-name>

# 3. 重新构建并启动
docker compose up -d --build

# 4. 验证部署
docker ps
curl http://<vps-ip>/api/health
```

### 清理资源
```bash
# 停止并删除容器
docker compose down

# 删除未使用的镜像
docker image prune -a

# 删除未使用的卷
docker volume prune
```

---

## 附录：参考示例

### 示例工具：Merge-PDF

完整实现参考：
- GitHub: https://github.com/sicks0214/Merge-PDF
- 技术文档: `docs/Toolibox_3.0_Merge-PDF.md`
- 前端端口: 3001
- 工具路径: `/pdf-tools`
- 核心功能: PDF 合并、页面范围选择

---

**文档版本**: 1.0
**最后更新**: 2025-12-23
**适用范围**: Toolibox 平台所有工具开发
