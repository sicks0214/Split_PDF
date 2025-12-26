# Merge-PDF 技术文档

> PDF 合并工具 - 微前端 + 后端API架构

---

## 目录

1. [项目概述](#一项目概述)
2. [系统架构](#二系统架构)
3. [关键参数配置](#三关键参数配置)
4. [目录结构](#四目录结构)
5. [快速部署](#五快速部署)
6. [开发规范](#六开发规范)
7. [常见问题](#七常见问题)
8. [更新日志](#八更新日志)

---

## 一、项目概述

### 1.1 项目信息

| 项目 | 值 |
|------|-----|
| 项目名称 | Merge-PDF |
| VPS IP | 82.29.67.124 |
| 项目目录 | /var/www/toolibox/Merge-PDF |
| GitHub | https://github.com/sicks0214/Merge-PDF |
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
| PDF处理 | pdf-lib |
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |

### 1.3 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| PDF 合并 | ✅ 已完成 | 支持多文件合并、页面范围选择、拖拽排序 |
| PDF 分析 | ✅ 已完成 | 获取PDF页数、加密状态检测 |

### 1.4 后端API端点

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | ✅ |
| `/api/pdf/analyze` | POST | PDF分析（页数、加密状态） | ✅ |
| `/api/pdf/merge` | POST | PDF合并（支持页面范围） | ✅ |

---

## 二、系统架构

### 2.1 架构图

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │     Nginx      │
              │  82.29.67.124  │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │  Main   │  │PDF Tools │  │ Backend │
   │ :3000   │  │  :3001   │  │  :8000  │
   └─────────┘  └──────────┘  └─────────┘
```

### 2.2 容器服务

| 容器名 | 镜像 | 端口 | 路由 |
|--------|------|------|------|
| toolibox-frontend-main | toolibox/frontend-main | 3000 | `/` |
| toolibox-frontend-pdf-tools | toolibox/frontend-pdf-tools | 3001 | `/pdf-tools/*` |
| toolibox-backend-main | toolibox/backend-main | 8000 | `/api/*` |

### 2.3 Nginx 路由配置

```nginx
# /etc/nginx/sites-available/toolibox.conf

server {
    listen 80;
    server_name 82.29.67.124;

    # Main 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PDF Tools 微前端
    location /pdf-tools {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API（支持100MB文件上传）
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
```

---

## 三、关键参数配置

### 3.1 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| PDF Tools Frontend | 3001 | PDF 工具微前端 |
| Backend API | 8000 | 统一后端服务 |

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

### 3.3 文件上传限制

| 参数 | 值 | 说明 |
|------|-----|------|
| 单文件大小 | 100MB | Multer配置 |
| 最大文件数 | 20 | 批量上传限制 |
| 存储方式 | 内存 | memoryStorage |
| 临时文件 | 自动清理 | 处理后立即释放 |

### 3.4 国际化配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 支持语言 | `en`, `zh` | 英文、中文 |
| 默认语言 | `en` | 英文 |
| localePrefix | `always` | 所有路径都包含语言前缀 |

**URL 示例**:
- `/pdf-tools/en/merge-pdf` - PDF 合并工具英文
- `/pdf-tools/zh/merge-pdf` - PDF 合并工具中文

---

## 四、目录结构

```
Merge-PDF/
├── frontend/pdf-tools/             # PDF 工具微前端
│   ├── src/
│   │   ├── app/[locale]/           # 国际化路由
│   │   │   └── merge-pdf/          # 合并 PDF 页面
│   │   │       └── page.tsx
│   │   ├── components/             # React 组件
│   │   │   ├── CoreToolArea.tsx    # 核心工具区域
│   │   │   ├── ResultPage.tsx      # 结果页面
│   │   │   ├── HowToSection.tsx    # 使用说明
│   │   │   ├── FAQSection.tsx      # 常见问题
│   │   │   ├── UseCaseCards.tsx    # 使用场景
│   │   │   ├── InlineFeedback.tsx  # 反馈组件
│   │   │   ├── Breadcrumb.tsx      # 面包屑导航
│   │   │   └── layout/             # 布局组件
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # 后端 API 调用
│   │   │   └── pdfMerger.ts        # 前端工具函数
│   │   ├── locales/                # 翻译文件
│   │   │   ├── en.json
│   │   │   └── zh.json
│   │   ├── i18n/
│   │   │   └── request.ts          # i18n 配置
│   │   ├── config.ts               # 配置文件
│   │   ├── middleware.ts           # 中间件
│   │   └── navigation.ts           # 导航配置
│   ├── next.config.js              # basePath: '/pdf-tools'
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                        # 后端 API
│   ├── src/
│   │   ├── app.ts                  # 入口文件
│   │   └── routes/
│   │       └── pdf.ts              # PDF API路由
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                           # 文档
│   ├── Merge-PDF_Technical_Documentation.md  # 本文档
│   └── Toolibox_3.0_VPS.md         # VPS部署文档
│
├── docker-compose.yml              # 容器编排
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
cd frontend/pdf-tools
npm install
npm run dev
```

**访问地址**:
- 前端: http://localhost:3001/pdf-tools/en/merge-pdf
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
docker logs toolibox-frontend-pdf-tools -f
```

### 5.3 VPS 部署流程

**1. 连接VPS并进入目录**:
```bash
ssh root@82.29.67.124
cd /var/www/toolibox
```

**2. 克隆或更新代码**:
```bash
# 首次部署
git clone https://github.com/sicks0214/Merge-PDF.git

# 更新代码
cd Merge-PDF
git pull origin master
```

**3. 停止旧容器（如果存在）**:
```bash
docker stop toolibox-backend-main toolibox-frontend-pdf-tools
docker rm toolibox-backend-main toolibox-frontend-pdf-tools
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
curl -I http://localhost:3001/pdf-tools/en/merge-pdf

# 测试通过Nginx访问
curl http://82.29.67.124/api/health
curl -I http://82.29.67.124/pdf-tools/en/merge-pdf
```

---

## 六、开发规范

### 6.1 架构原则

**前后端职责严格分离**：

| 层级 | 职责 | 禁止事项 |
|------|------|------------|
| **微前端** | 纯UI展示、文件上传、结果展示 | ❌ 禁止任何PDF处理逻辑 |
| **统一后端** | 所有PDF处理逻辑 | PDF分析、合并、页面提取 |

**为什么要后端处理？**
- ✅ 安全性：防止客户端代码被篡改
- ✅ 性能：大文件处理不经过浏览器
- ✅ 隐私：文件在服务器端处理后自动清理
- ✅ 一致性：所有用户获得相同的处理结果

**前端调用示例**：
```typescript
// ✅ 正确：前端只负责上传和展示
const mergePDFs = async () => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f.file));
  formData.append('pageRanges', JSON.stringify(pageRanges));
  formData.append('options', JSON.stringify(options));

  const response = await fetch('/api/pdf/merge', {
    method: 'POST',
    body: formData
  });

  const blob = await response.blob();
  downloadBlob(blob, 'merged.pdf');
};

// ❌ 错误：前端不应该处理PDF
import { PDFDocument } from 'pdf-lib';
const pdf = await PDFDocument.load(arrayBuffer); // 禁止
```

### 6.2 页面范围解析规则

**后端实现** (`backend/src/routes/pdf.ts:18-39`):

```typescript
function parsePageRange(range: string, totalPages: number): number[] {
  if (range === 'all' || range === '') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: number[] = [];
  const parts = range.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start - 1; i < Math.min(end, totalPages); i++) {
        if (i >= 0 && !pages.includes(i)) pages.push(i);
      }
    } else {
      const page = parseInt(part, 10) - 1;
      if (page >= 0 && page < totalPages && !pages.includes(page)) pages.push(page);
    }
  }

  return pages.sort((a, b) => a - b);
}
```

**支持的格式**:
- `all` 或空字符串：所有页面
- `1,3,5`：指定页面
- `1-5`：页面范围
- `1-3,5,7-9`：混合格式

### 6.3 API 接口规范

**PDF 分析接口**:
```typescript
POST /api/pdf/analyze
Content-Type: multipart/form-data

Body:
  file: <PDF文件>

Response:
{
  pageCount: number,
  hasBookmarks: boolean,
  isEncrypted: boolean
}
```

**PDF 合并接口**:
```typescript
POST /api/pdf/merge
Content-Type: multipart/form-data

Body:
  files: <PDF文件数组>
  pageRanges: <JSON字符串数组>
  options: <JSON字符串>

Response:
  <PDF二进制数据>
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="merged.pdf"
```

### 6.4 错误处理规范

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
  const response = await fetch('/api/pdf/merge', { ... });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Merge failed');
  }
  // 处理成功响应
} catch (error) {
  console.error('Merge error:', error);
  setError(error.message);
}
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
docker stop toolibox-backend-main toolibox-frontend-pdf-tools
docker rm toolibox-backend-main toolibox-frontend-pdf-tools

# 启动新容器
docker compose up -d
```

### 7.3 网络警告

**症状**:
```
WARN: a network with name toolibox-network exists but was not created for project "merge-pdf"
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
1. 检查 Multer 配置（`backend/src/routes/pdf.ts:6-9`）
2. 检查 Nginx 配置（`client_max_body_size 100M`）

---

## 八、更新日志

### 2025-12-23 (v1.0) ✨ 初始版本

**功能实现**:
- ✅ PDF 合并功能（支持页面范围选择）
- ✅ PDF 分析功能（页数、加密状态）
- ✅ 拖拽排序文件
- ✅ 中英文双语支持
- ✅ 后端API处理（pdf-lib）
- ✅ Docker 容器化部署

**技术架构**:
- 微前端 + 后端API架构
- Next.js 14 + Express.js
- TypeScript 全栈
- Docker + Nginx 部署

**VPS部署成功** (2025-12-23):
- ✅ 从GitHub克隆代码
- ✅ 修复Dockerfile配置问题
- ✅ 构建Docker镜像
- ✅ 启动容器服务
- ✅ 验证所有API端点
- ✅ 外部访问测试通过

**部署验证**:
```bash
# 后端健康检查
curl http://82.29.67.124/api/health
# ✅ {"success":true,"message":"Server is running","timestamp":"..."}

# 前端访问
curl -I http://82.29.67.124/pdf-tools/en/merge-pdf
# ✅ HTTP/1.1 200 OK

# 容器状态
docker ps
# ✅ 3个容器运行中
```

---

## 附录：验证清单

部署后验证：

- [x] `docker ps` 显示容器运行中 ✅
- [x] `curl http://localhost:8000/api/health` 返回 JSON ✅
- [x] `curl http://82.29.67.124/api/health` 返回 JSON ✅
- [x] `curl -I http://localhost:3001/pdf-tools/en/merge-pdf` 返回 200 ✅
- [x] `curl -I http://82.29.67.124/pdf-tools/en/merge-pdf` 返回 200 ✅
- [x] 浏览器访问前端页面正常 ✅
- [x] PDF合并功能实际测试可用 ✅

**最新验证时间**: 2025-12-23 07:10 UTC

---

## 附录：服务管理命令

### 查看服务状态
```bash
# 查看所有容器
docker ps

# 查看特定容器日志
docker logs toolibox-backend-main -f
docker logs toolibox-frontend-pdf-tools -f
```

### 重启服务
```bash
# 重启所有服务
cd /var/www/toolibox/Merge-PDF
docker compose restart

# 重启特定服务
docker compose restart backend-main
docker compose restart frontend-pdf-tools
```

### 更新部署
```bash
# 1. 拉取最新代码
cd /var/www/toolibox/Merge-PDF
git pull origin master

# 2. 停止旧容器
docker stop toolibox-backend-main toolibox-frontend-pdf-tools
docker rm toolibox-backend-main toolibox-frontend-pdf-tools

# 3. 重新构建并启动
docker compose up -d --build

# 4. 验证部署
docker ps
curl http://82.29.67.124/api/health
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

**文档版本**: 1.0
**最后更新**: 2025-12-23
**维护者**: sicks0214
