# Split PDF 工具技术文档

> 基于 Toolibox 工具开发指导文档 v1.0

---

## 目录

1. [项目概述](#一项目概述)
2. [系统架构](#二系统架构)
3. [关键参数配置](#三关键参数配置)
4. [目录结构](#四目录结构)
5. [快速部署](#五快速部署)
6. [开发规范](#六开发规范)
7. [API 文档](#七api-文档)
8. [常见问题](#八常见问题)
9. [开发检查清单](#九开发检查清单)

---

## 一、项目概述

### 1.1 项目信息

| 项目 | 值 |
|------|-----|
| 项目名称 | Split PDF Tool |
| 工具路径 | `/pdf-tools` |
| 前端端口 | 3001 |
| 后端端口 | 8000 |
| GitHub | `https://github.com/<username>/Split_PDF` |
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
| 核心处理库 | pdf-lib, jszip |
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |

### 1.3 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 按页码范围分割 | ✅ 已完成 | 支持 "1-3, 5, 8-10" 格式 |
| 按固定页数分割 | ✅ 已完成 | 每 N 页生成一个文件 |
| 提取指定页面 | ✅ 已完成 | 提取指定页面到单个文件 |
| 文件上传 | ✅ 已完成 | 支持拖拽上传，100MB 限制 |
| 结果导出 | ✅ 已完成 | 单文件 PDF 或 ZIP 包 |

### 1.4 后端 API 端点

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | ✅ 已实现 |
| `/api/pdf/split` | POST | PDF 分割处理 | ✅ 已实现 |

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

### 2.3 数据流程

```
用户上传 PDF
    ↓
前端 FileUploader 组件
    ↓
选择分割模式 (range/fixed/extract)
    ↓
配置参数 (页码范围/固定页数/指定页面)
    ↓
前端调用 API (lib/api.ts)
    ↓
后端接收文件 (Multer 内存存储)
    ↓
后端处理 PDF (pdf-lib)
    ↓
返回结果 (单个 PDF 或 ZIP)
    ↓
前端触发下载
```

---

## 三、关键参数配置

### 3.1 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3001 | PDF Tools 微前端 |
| 后端 | 8000 | 统一后端 API |

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
| 单文件大小 | 100MB | Multer 配置 |
| 存储方式 | 内存 | memoryStorage |
| 支持格式 | PDF | application/pdf |
| 临时文件 | 无 | 内存处理，自动释放 |

### 3.4 国际化配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 支持语言 | `en`, `zh` | 英文、中文 |
| 默认语言 | `en` | 英文 |
| localePrefix | `always` | 所有路径都包含语言前缀 |

**URL 格式**:
- `/pdf-tools/en/split-pdf` - 英文页面
- `/pdf-tools/zh/split-pdf` - 中文页面

---

## 四、目录结构

```
Split_PDF/
├── frontend/pdf-tools/          # 工具微前端
│   ├── src/
│   │   ├── app/[locale]/        # 国际化路由
│   │   │   ├── layout.tsx       # 根布局
│   │   │   ├── page.tsx         # 首页（重定向）
│   │   │   └── split-pdf/
│   │   │       └── page.tsx     # 工具主页面
│   │   ├── components/          # React 组件
│   │   │   ├── CoreToolArea.tsx # 核心工具区域
│   │   │   ├── FileUploader.tsx # 文件上传
│   │   │   ├── ModeSelector.tsx # 模式选择
│   │   │   ├── ParameterInput.tsx # 参数输入
│   │   │   ├── InlineFeedback.tsx # 反馈组件
│   │   │   ├── HowToSection.tsx # 使用说明
│   │   │   ├── FAQSection.tsx   # 常见问题
│   │   │   ├── UsageScenariosSection.tsx # 使用场景
│   │   │   ├── Breadcrumb.tsx   # 面包屑导航
│   │   │   └── layout/          # 布局组件
│   │   │       ├── Header.tsx
│   │   │       └── Footer.tsx
│   │   ├── lib/
│   │   │   └── api.ts           # 后端 API 调用
│   │   ├── locales/             # 翻译文件
│   │   │   ├── en.json
│   │   │   └── zh.json
│   │   ├── i18n/
│   │   │   └── request.ts       # i18n 配置
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── config.ts            # locales 配置
│   │   └── middleware.ts        # 路由中间件
│   ├── next.config.js           # basePath: '/pdf-tools'
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # 后端 API
│   ├── src/
│   │   ├── app.ts               # 入口文件
│   │   ├── controllers/
│   │   │   └── pdfController.ts # PDF 处理逻辑
│   │   ├── middleware/
│   │   │   └── upload.ts        # 文件上传中间件
│   │   └── routes/
│   │       └── pdf.ts           # PDF API 路由
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # 文档
│   ├── Split_PDF_Technical_Documentation.md
│   └── Toolibox_Tool_Development.md
│
├── docker-compose.yml           # 容器编排
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
npm run build  # 编译 TypeScript
npm run dev    # 启动开发服务器
```

**启动前端**（新终端）:
```bash
cd frontend/pdf-tools
npm install
npm run dev    # 启动开发服务器
```

**访问地址**:
- 前端中文版: http://localhost:3001/pdf-tools/zh/split-pdf
- 前端英文版: http://localhost:3001/pdf-tools/en/split-pdf
- 后端健康检查: http://localhost:8000/api/health

### 5.2 Docker 部署

**构建并启动**:
```bash
docker-compose up -d --build
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

**1. 连接 VPS 并进入目录**:
```bash
ssh root@<your-vps-ip>
cd /var/www/toolibox
```

**2. 克隆或更新代码**:
```bash
# 首次部署
git clone https://github.com/<username>/Split_PDF.git

# 更新代码
cd Split_PDF
git pull origin main
```

**3. 停止旧容器（如果存在）**:
```bash
docker stop toolibox-backend-main toolibox-frontend-pdf-tools
docker rm toolibox-backend-main toolibox-frontend-pdf-tools
```

**4. 构建并启动新容器**:
```bash
docker-compose up -d --build
```

**5. 验证部署**:
```bash
# 检查容器状态
docker ps

# 测试后端健康检查
curl http://localhost:8000/api/health

# 测试前端访问
curl -I http://localhost:3001/pdf-tools/en/split-pdf

# 测试通过 Nginx 访问
curl http://<your-vps-ip>/api/health
curl -I http://<your-vps-ip>/pdf-tools/en/split-pdf
```

---

## 六、开发规范

### 6.1 架构原则

**前后端职责严格分离**：

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| **微前端** | 纯 UI 展示、文件上传、结果展示 | ❌ 禁止任何 PDF 处理逻辑 |
| **统一后端** | 所有 PDF 处理逻辑 | 文件分析、分割、合并等 |

**为什么要后端处理？**
- ✅ 安全性：防止客户端代码被篡改
- ✅ 性能：大文件处理不经过浏览器
- ✅ 隐私：文件在服务器端处理后自动清理（内存存储）
- ✅ 一致性：所有用户获得相同的处理结果

### 6.2 组件开发规范

**核心组件**：
1. `CoreToolArea.tsx` - 核心工具区域（文件上传、模式选择、参数配置、处理按钮）
2. `InlineFeedback.tsx` - 用户反馈提示（成功/错误/信息）
3. `FileUploader.tsx` - 文件上传组件
4. `ModeSelector.tsx` - 分割模式选择
5. `ParameterInput.tsx` - 参数输入组件

**SEO 组件**：
1. `HowToSection.tsx` - 使用说明
2. `FAQSection.tsx` - 常见问题
3. `UsageScenariosSection.tsx` - 使用场景展示

### 6.3 TypeScript 类型定义

**前端类型** (`lib/api.ts`):
```typescript
export interface SplitConfig {
  mode: 'range' | 'fixed' | 'extract';
  range?: string;
  pagesPerFile?: number;
  pages?: string;
}
```

**后端类型** (`controllers/pdfController.ts`):
```typescript
interface SplitResult {
  fileName: string;
  buffer: Uint8Array;
  pageNumbers: number[];
}
```

### 6.4 错误处理规范

**后端错误响应**:
```typescript
{
  success: false,
  message: string
}
```

**前端错误处理**:
```typescript
try {
  const blob = await splitPDF(file, config);
  // 处理成功
} catch (error: any) {
  console.error('Split error:', error);
  setFeedback({
    type: 'error',
    message: error.message || t('feedback.error')
  });
}
```

---

## 七、API 文档

### 7.1 健康检查

**端点**: `GET /api/health`

**响应**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-23T14:27:44.139Z"
}
```

### 7.2 PDF 分割

**端点**: `POST /api/pdf/split`

**请求**:
```
Content-Type: multipart/form-data

Body:
  file: <PDF 文件>
  mode: "range" | "fixed" | "extract"

  # mode=range 时
  range: "1-3, 5, 8-10"

  # mode=fixed 时
  pagesPerFile: "3"

  # mode=extract 时
  pages: "1, 3, 7"
```

**响应**:
- 单个文件: `Content-Type: application/pdf`
- 多个文件: `Content-Type: application/zip`

**错误响应**:
```json
{
  "success": false,
  "message": "错误信息"
}
```

### 7.3 分割模式说明

#### Range 模式（按页码范围）
- **输入**: `"1-3, 5, 8-10"`
- **输出**: 多个 PDF 文件（连续页码分组）
- **示例**:
  - 输入: `"1-3, 5, 8-10"`
  - 输出: 3 个文件
    - `pages_1-3.pdf` (第 1-3 页)
    - `page_5.pdf` (第 5 页)
    - `pages_8-10.pdf` (第 8-10 页)

#### Fixed 模式（按固定页数）
- **输入**: `pagesPerFile=3`
- **输出**: 多个 PDF 文件（每个 N 页）
- **示例**:
  - 10 页 PDF，每 3 页一个文件
  - 输出: 4 个文件
    - `pages_1-3.pdf`
    - `pages_4-6.pdf`
    - `pages_7-9.pdf`
    - `page_10.pdf`

#### Extract 模式（提取指定页面）
- **输入**: `"1, 3, 7"`
- **输出**: 单个 PDF 文件（包含指定页面）
- **示例**:
  - 输入: `"1, 3, 7"`
  - 输出: 1 个文件 `pages_1-7.pdf`（包含第 1, 3, 7 页）

---

## 八、常见问题

### 8.1 TypeScript 编译错误

**症状**: `npm run build` 失败

**解决**:
```bash
# 检查 TypeScript 版本
npm list typescript

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 8.2 Multer 内存限制

**症状**: 上传大文件时返回 413 错误

**解决**:
1. 检查 Multer 配置 (`middleware/upload.ts`):
```typescript
limits: {
  fileSize: 100 * 1024 * 1024 // 100MB
}
```

2. 检查 Nginx 配置:
```nginx
client_max_body_size 100M;
```

### 8.3 CORS 错误

**症状**: 前端无法访问后端 API

**解决**:
确保后端启用了 CORS (`app.ts`):
```typescript
import cors from 'cors';
app.use(cors());
```

### 8.4 Docker 构建失败

**症状**: `docker-compose up` 失败

**解决**:
```bash
# 清理旧镜像
docker system prune -a

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 8.5 前端路由 404

**症状**: 访问 `/pdf-tools/en/split-pdf` 返回 404

**解决**:
1. 检查 `next.config.js` 的 `basePath`:
```javascript
basePath: '/pdf-tools'
```

2. 检查 `middleware.ts` 配置
3. 确保 URL 包含 locale 前缀

---

## 九、开发检查清单

### 9.1 开发前准备

- [x] 确定工具名称和路径（`Split_PDF`, `/pdf-tools`）
- [x] 分配前端端口（3001）
- [x] 创建 GitHub 仓库
- [x] 准备核心处理库（pdf-lib, jszip）
- [x] 设计 API 接口
- [x] 规划功能模块

### 9.2 前端开发

- [x] 创建 Next.js 项目（App Router）
- [x] 配置 `next.config.js` 的 `basePath`
- [x] 配置国际化（next-intl）
- [x] 实现核心组件
  - [x] CoreToolArea
  - [x] InlineFeedback
  - [x] FileUploader
  - [x] ModeSelector
  - [x] ParameterInput
  - [x] HowToSection
  - [x] FAQSection
  - [x] UsageScenariosSection
- [x] 添加翻译文件（en.json, zh.json）
- [x] 实现 API 调用层（lib/api.ts）
- [x] 编写 Dockerfile
- [x] 测试本地开发环境

### 9.3 后端开发

- [x] 创建 Express 项目（TypeScript）
- [x] 配置 CORS
- [x] 实现健康检查端点（`/api/health`）
- [x] 实现 PDF 分割端点（`/api/pdf/split`）
- [x] 配置 Multer 文件上传（内存存储）
- [x] 添加错误处理
- [x] 编写 Dockerfile（多阶段构建）
- [x] 测试本地开发环境

### 9.4 Docker 配置

- [x] 编写 docker-compose.yml
- [x] 配置容器名称
- [x] 配置端口映射
- [x] 配置网络（toolibox-network, external: true）
- [x] 配置 restart 策略（unless-stopped）
- [x] 本地测试 Docker 构建
- [x] 本地测试容器运行

### 9.5 部署前检查

- [ ] 更新 Nginx 配置（添加新工具路由）
- [ ] 测试 Nginx 配置语法（`nginx -t`）
- [ ] 重载 Nginx（`nginx -s reload`）
- [ ] 准备 VPS 部署目录
- [ ] 推送代码到 GitHub

### 9.6 VPS 部署

- [ ] SSH 连接到 VPS
- [ ] 克隆代码到 `/var/www/toolibox/Split_PDF`
- [ ] 停止旧容器（如果存在）
- [ ] 构建 Docker 镜像
- [ ] 启动容器
- [ ] 验证容器状态（`docker ps`）
- [ ] 测试后端健康检查
- [ ] 测试前端访问
- [ ] 测试核心功能

### 9.7 部署后验证

- [ ] `docker ps` 显示容器运行中
- [ ] `curl http://localhost:8000/api/health` 返回 JSON
- [ ] `curl http://<vps-ip>/api/health` 返回 JSON
- [ ] `curl -I http://localhost:3001/pdf-tools/en/split-pdf` 返回 200
- [ ] `curl -I http://<vps-ip>/pdf-tools/en/split-pdf` 返回 200
- [ ] 浏览器访问前端页面正常
- [ ] 核心功能实际测试可用
- [ ] 中英文切换正常
- [ ] 文件上传功能正常
- [ ] 结果下载功能正常

### 9.8 文档编写

- [x] 编写 README.md
- [x] 编写技术文档（本文档）
- [ ] 更新主站导航（添加新工具链接）
- [x] 编写使用说明（HowToSection）
- [x] 编写常见问题（FAQSection）

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
cd /var/www/toolibox/Split_PDF
docker-compose restart

# 重启特定服务
docker-compose restart backend-main
docker-compose restart frontend-pdf-tools
```

### 更新部署

```bash
# 1. 拉取最新代码
cd /var/www/toolibox/Split_PDF
git pull origin main

# 2. 停止旧容器
docker stop toolibox-backend-main toolibox-frontend-pdf-tools
docker rm toolibox-backend-main toolibox-frontend-pdf-tools

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 验证部署
docker ps
curl http://localhost:8000/api/health
```

### 清理资源

```bash
# 停止并删除容器
docker-compose down

# 删除未使用的镜像
docker image prune -a

# 删除未使用的卷
docker volume prune
```

---

## 附录：Nginx 配置示例

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

    # PDF Tools 微前端
    location /pdf-tools {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
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

## 附录：核心代码示例

### 前端 API 调用

```typescript
// lib/api.ts
export async function splitPDF(file: File, config: SplitConfig): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', config.mode);

  if (config.range) formData.append('range', config.range);
  if (config.pagesPerFile) formData.append('pagesPerFile', config.pagesPerFile.toString());
  if (config.pages) formData.append('pages', config.pages);

  const apiUrl = process.env.NODE_ENV === 'production'
    ? '/api/pdf/split'
    : 'http://localhost:8000/api/pdf/split';

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Split failed' }));
    throw new Error(error.message || 'Failed to split PDF');
  }

  return await response.blob();
}
```

### 后端 PDF 处理

```typescript
// controllers/pdfController.ts
export const split = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { mode, range, pagesPerFile, pages } = req.body;

    // 加载 PDF（从内存 buffer）
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const totalPages = pdfDoc.getPageCount();

    let results: SplitResult[];

    switch (mode) {
      case 'range':
        results = await splitByRange(pdfDoc, range, totalPages);
        break;
      case 'fixed':
        results = await splitByFixedPages(pdfDoc, parseInt(pagesPerFile), totalPages);
        break;
      case 'extract':
        results = await extractPages(pdfDoc, pages, totalPages);
        break;
      default:
        res.status(400).json({ success: false, message: `Unknown split mode: ${mode}` });
        return;
    }

    // 返回结果
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(Buffer.from(results[0].buffer));
    } else {
      const zip = new JSZip();
      results.forEach(result => zip.file(result.fileName, result.buffer));
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.send(zipBuffer);
    }
  } catch (error: any) {
    console.error('Split error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

**文档版本**: 1.0
**最后更新**: 2025-12-23
**适用范围**: Split PDF Tool
**基于**: Toolibox Tool Development Guide v1.0
