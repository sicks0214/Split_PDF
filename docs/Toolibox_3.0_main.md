# Toolibox 3.0 技术文档

> 微前端 + 统一后端API架构

---

## 目录

1. [项目概述](#一项目概述)
2. [系统架构](#二系统架构)
3. [技术栈](#三技术栈)
4. [目录结构](#四目录结构)
5. [核心功能](#五核心功能)
6. [开发规范](#六开发规范)

---

## 一、项目概述

Toolibox 3.0 是一个免费在线工具聚合平台，采用微前端架构，提供PDF处理、文本处理、图片处理等多种工具。

### 1.1 架构特点

- **微前端架构**：每个工具类别独立部署为一个前端应用
- **统一后端API**：所有核心处理逻辑集中在后端
- **前后端分离**：前端负责UI展示，后端负责业务逻辑
- **国际化支持**：支持中英文双语

### 1.2 已实现功能

| 模块 | 功能 |
|------|------|
| Main 应用 | 导航入口、用户认证、反馈系统 |
| PDF Tools | PDF合并、PDF拆分、PDF压缩 |
| 用户系统 | 注册、登录、JWT认证 |
| AI功能 | 文本简化（DeepSeek API） |
| 数据备份 | PostgreSQL + Cloudflare R2自动备份 |

---

## 二、系统架构

### 2.1 架构图

```
                    用户浏览器
                       │
                       ▼
              ┌────────────────┐
              │     Nginx      │
              │   反向代理      │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │  Main   │  │PDF Tools │  │  Backend │
   │ :3000   │  │  :3001   │  │  :8000   │
   └─────────┘  └──────────┘  └──────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
        ┌──────────┐    ┌──────────┐
        │PostgreSQL│    │   R2     │
        │  数据库   │    │  存储    │
        └──────────┘    └──────────┘
```

### 2.2 服务端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| Main Frontend | 3000 | 主站前端（导航入口） |
| PDF Tools Frontend | 3001 | PDF工具微前端 |
| Backend API | 8000 | 统一后端服务 |

### 2.3 路由规则

| 路径 | 服务 | 说明 |
|------|------|------|
| `/` | Main Frontend | 主站首页 |
| `/en/*` | Main Frontend | 主站英文页面 |
| `/zh/*` | Main Frontend | 主站中文页面 |
| `/pdf-tools/*` | PDF Tools Frontend | PDF工具页面 |
| `/api/*` | Backend API | 后端API接口 |

---

## 三、技术栈

### 3.1 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14 | React框架（App Router） |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式框架 |
| next-intl | 3.x | 国际化 |
| Axios | 1.x | HTTP客户端 |
| Headless UI | 2.x | 无样式UI组件 |

### 3.2 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| Express | 4.x | Web框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | 数据库 |
| Multer | 1.x | 文件上传 |
| pdf-lib | 1.x | PDF处理 |
| jsonwebtoken | 9.x | JWT认证 |
| bcryptjs | 2.x | 密码加密 |
| node-cron | 3.x | 定时任务 |

### 3.3 基础设施

| 技术 | 用途 |
|------|------|
| Docker | 容器化 |
| Docker Compose | 容器编排 |
| Nginx | 反向代理 |
| Cloudflare R2 | 对象存储 |

### 3.4 环境变量配置

项目需要配置环境变量才能正常运行。详细配置请参考项目根目录的 `.env.example` 文件。

**主要配置项**：

| 配置项 | 说明 |
|--------|------|
| DATABASE_URL | PostgreSQL 数据库连接字符串 |
| JWT_SECRET | JWT 认证密钥 |
| JWT_EXPIRES_IN | JWT 过期时间（默认7天） |
| R2_ACCOUNT_ID | Cloudflare R2 账户ID |
| R2_ACCESS_KEY_ID | R2 访问密钥ID |
| R2_SECRET_ACCESS_KEY | R2 访问密钥 |
| R2_BUCKET_NAME | R2 存储桶名称 |
| DEEPSEEK_API_KEY | DeepSeek AI API密钥 |
| NODE_ENV | 运行环境（development/production） |
| BACKEND_URL | 后端API地址 |

**配置文件位置**：`.env.example`（项目根目录）

---

## 四、目录结构

```
toolibox-2.0/
├── frontend/
│   ├── main/                          # 主站应用
│   │   ├── src/
│   │   │   ├── app/[locale]/          # 页面路由
│   │   │   │   ├── page.tsx           # 首页
│   │   │   │   ├── [categoryId]/      # 分类页面
│   │   │   │   ├── about/             # 关于页面
│   │   │   │   ├── feedback/          # 反馈页面
│   │   │   │   ├── login/             # 登录页面
│   │   │   │   ├── register/          # 注册页面
│   │   │   │   ├── search/            # 搜索页面
│   │   │   │   ├── privacy/           # 隐私政策
│   │   │   │   └── terms/             # 服务条款
│   │   │   ├── components/            # React组件
│   │   │   │   ├── layout/            # 布局组件
│   │   │   │   ├── home/              # 首页组件
│   │   │   │   └── ui/                # UI组件
│   │   │   ├── config/                # 配置文件
│   │   │   │   └── toolRoutes.ts      # 微前端路由配置
│   │   │   ├── contexts/              # React Context
│   │   │   │   └── AuthContext.tsx    # 认证上下文
│   │   │   ├── data/                  # 静态数据
│   │   │   │   ├── categories.json    # 工具分类
│   │   │   │   ├── tools.json         # 工具列表
│   │   │   │   └── toolGroups.json    # 工具分组
│   │   │   ├── lib/                   # 工具函数
│   │   │   │   └── api.ts             # API客户端
│   │   │   ├── locales/               # 翻译文件
│   │   │   │   ├── en.json            # 英文
│   │   │   │   └── zh.json            # 中文
│   │   │   ├── i18n.ts                # 国际化配置
│   │   │   └── middleware.ts          # Next.js中间件
│   │   ├── public/                    # 静态资源
│   │   ├── next.config.js             # Next.js配置
│   │   ├── tailwind.config.js         # Tailwind配置
│   │   ├── Dockerfile                 # Docker配置
│   │   └── package.json               # 依赖管理
│   │
│   └── pdf-tools/                     # PDF工具微前端
│       ├── src/
│       │   ├── app/[locale]/          # 页面路由
│       │   │   ├── page.tsx           # PDF工具首页
│       │   │   ├── merge-pdf/         # 合并PDF
│       │   │   │   └── page.tsx
│       │   │   ├── split-pdf/         # 拆分PDF
│       │   │   │   └── page.tsx
│       │   │   └── compress-pdf/      # 压缩PDF
│       │   │       └── page.tsx
│       │   ├── components/            # React组件
│       │   │   ├── layout/            # 布局组件
│       │   │   └── ToolCard.tsx       # 工具卡片
│       │   ├── data/                  # 静态数据
│       │   │   └── pdfTools.json      # PDF工具列表
│       │   ├── locales/               # 翻译文件
│       │   │   ├── en.json
│       │   │   └── zh.json
│       │   ├── i18n.ts
│       │   └── middleware.ts
│       ├── next.config.js             # basePath: '/pdf-tools'
│       ├── Dockerfile
│       └── package.json
│
├── backend/                           # 后端API
│   ├── src/
│   │   ├── app.ts                     # 应用入口
│   │   ├── controllers/               # 控制器
│   │   │   ├── authController.ts      # 认证控制器
│   │   │   ├── feedbackController.ts  # 反馈控制器
│   │   │   └── pdfController.ts       # PDF控制器
│   │   ├── routes/                    # 路由
│   │   │   ├── auth.ts                # 认证路由
│   │   │   ├── feedback.ts            # 反馈路由
│   │   │   ├── health.ts              # 健康检查
│   │   │   ├── pdf.ts                 # PDF路由
│   │   │   └── simplify.ts            # 文本简化路由
│   │   ├── middleware/                # 中间件
│   │   │   ├── auth.ts                # 认证中间件
│   │   │   ├── cors.ts                # CORS中间件
│   │   │   ├── errorHandler.ts        # 错误处理
│   │   │   └── upload.ts              # 文件上传中间件
│   │   ├── services/                  # 服务
│   │   │   ├── backupCron.ts          # 定时备份
│   │   │   └── r2Service.ts           # R2存储服务
│   │   └── config/                    # 配置
│   ├── prisma/
│   │   └── schema.prisma              # 数据库模型
│   ├── tmp/                           # 临时文件目录
│   ├── Dockerfile                     # Docker配置
│   └── package.json                   # 依赖管理
│
├── nginx/
│   └── toolibox.conf                  # Nginx配置
│
├── docker-compose.yml                 # 容器编排
└── docs/
    └── Toolibox_3.0_Main.md           # 本文档
```

---

## 五、核心功能

### 5.1 后端API端点

#### 5.1.1 健康检查

```
GET /api/health
```

返回服务器状态信息。

#### 5.1.2 用户认证

```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
GET  /api/auth/profile     # 获取用户信息（需要JWT）
PUT  /api/auth/profile     # 更新用户信息（需要JWT）
```

#### 5.1.3 反馈系统

```
POST /api/feedback         # 提交反馈
```

#### 5.1.4 PDF处理

```
POST /api/pdf/merge        # 合并PDF（最多20个文件）
POST /api/pdf/split        # 拆分PDF
POST /api/pdf/compress     # 压缩PDF
```

#### 5.1.5 AI文本处理

```
POST /api/simplify         # 文本简化（DeepSeek API）
```

### 5.2 数据库模型

#### 5.2.1 User（用户）

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  username          String    @unique
  password          String
  firstName         String?
  lastName          String?
  isEmailVerified   Boolean   @default(false)
  lastLogin         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### 5.2.2 Feedback（反馈）

```prisma
model Feedback {
  id              Int       @id @default(autoincrement())
  name            String
  email           String
  subject         String
  message         String
  toolName        String?
  status          String    @default("pending")
  userAgent       String?
  ipAddress       String?
  isBackedUpToR2  Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 5.3 文件上传配置

- **最大文件大小**：100MB
- **支持格式**：PDF
- **临时存储**：`backend/tmp/`
- **自动清理**：处理完成后立即删除

### 5.4 定时任务

- **反馈数据备份**：每天凌晨2点自动备份到Cloudflare R2
- **实现方式**：node-cron

---

## 六、开发规范

### 6.1 架构原则

#### 6.1.1 前后端职责分离

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| **前端** | UI展示、文件上传、结果下载 | ❌ 禁止任何PDF/图片/文本处理逻辑 |
| **后端** | 所有核心处理逻辑 | PDF处理、图片处理、文本处理 |

**为什么要后端处理？**
- ✅ 安全性：防止客户端代码被篡改
- ✅ 性能：大文件处理不经过浏览器
- ✅ 一致性：所有用户获得相同的处理结果
- ✅ 可扩展：便于添加存储、队列等功能

#### 6.1.2 前端调用示例

```typescript
// ✅ 正确：前端只负责上传和展示
const mergePDFs = async () => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f.file));

  const response = await fetch('/api/pdf/merge', {
    method: 'POST',
    body: formData
  });

  const blob = await response.blob();
  saveAs(blob, 'merged.pdf');
};

// ❌ 错误：前端不应该处理PDF
import { PDFDocument } from 'pdf-lib';
const pdf = await PDFDocument.load(arrayBuffer); // 禁止
```

### 6.2 微前端配置

#### 6.2.1 basePath 配置

每个微前端应用需要在 `next.config.js` 中配置 `basePath`：

```javascript
// frontend/pdf-tools/next.config.js
const nextConfig = {
  basePath: '/pdf-tools',
  output: 'standalone',
};
```

#### 6.2.2 路由规则

**重要**：在微前端应用中使用 `basePath` 和 `localePrefix: 'always'` 时：

| 规则 | 说明 |
|------|------|
| Next.js 自动添加 basePath | 代码中不要手动写 `/pdf-tools` |
| 所有语言都需要前缀 | 包括默认语言 `en` |
| 使用 `/${locale}/${slug}` | Next.js 会生成 `/pdf-tools/${locale}/${slug}` |

**正确示例**：

```typescript
// ✅ 正确
const path = `/${locale}/${tool.slug}`;
// 生成: /pdf-tools/en/merge-pdf

// ❌ 错误
const path = `/pdf-tools/${locale}/${tool.slug}`;
// 生成: /pdf-tools/pdf-tools/en/merge-pdf (重复)
```

### 6.3 微前端链接规则

在 Main 应用中引用微前端时：

```tsx
// 判断是否是已部署的微前端
const isExternal = isMicroserviceDeployed(categoryId);

if (isExternal) {
  // 微前端：使用 <a> 标签（完整页面跳转）
  return <a href={getToolUrl(categoryId, slug, locale)}>...</a>;
} else {
  // 内部路由：使用 <Link>（客户端导航）
  return <Link href={path}>...</Link>;
}
```

### 6.4 国际化配置

#### 6.4.1 支持语言

- `en`：英文（默认）
- `zh`：中文

#### 6.4.2 URL 格式

```
/en                          # 主站英文首页
/zh                          # 主站中文首页
/en/pdf-tools                # PDF工具分类页（英文）
/zh/pdf-tools                # PDF工具分类页（中文）
/pdf-tools/en/merge-pdf      # PDF合并工具（英文）
/pdf-tools/zh/merge-pdf      # PDF合并工具（中文）
```

#### 6.4.3 翻译文件位置

```
frontend/main/src/locales/en.json
frontend/main/src/locales/zh.json
frontend/pdf-tools/src/locales/en.json
frontend/pdf-tools/src/locales/zh.json
```

### 6.5 添加新微前端

#### 步骤1：创建微前端目录

```bash
mkdir -p frontend/new-tools
```

#### 步骤2：配置 next.config.js

```javascript
const nextConfig = {
  basePath: '/new-tools',
  output: 'standalone',
};
```

#### 步骤3：更新 toolRoutes.ts

```typescript
// frontend/main/src/config/toolRoutes.ts
export const DEPLOYED_MICROSERVICES: string[] = [
  'pdf-tools',
  'new-tools',  // 新增
];

export const CATEGORY_ROUTES: Record<string, string> = {
  'pdf-tools': '/pdf-tools',
  'new-tools': '/new-tools',  // 新增
};
```

#### 步骤4：更新 docker-compose.yml

```yaml
frontend-new-tools:
  build:
    context: ./frontend/new-tools
    dockerfile: Dockerfile
  image: toolibox/frontend-new-tools
  ports:
    - "3002:3002"
```

#### 步骤5：更新 Nginx 配置

```nginx
location /new-tools {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 6.6 代码规范

#### 6.6.1 TypeScript

- 使用严格模式
- 避免使用 `any` 类型
- 为函数参数和返回值添加类型注解

#### 6.6.2 React

- 使用函数组件和 Hooks
- 避免在组件中直接调用API，使用自定义 Hooks
- 组件文件使用 PascalCase 命名

#### 6.6.3 样式

- 优先使用 Tailwind CSS 工具类
- 避免内联样式
- 复杂样式使用 CSS Modules

---

**文档版本**: 3.0
**最后更新**: 2025-12-23
