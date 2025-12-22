# Toolibox 2.0 技术文档

> 免费在线工具聚合平台 - 微前端架构

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
| 项目名称 | Toolibox 2.0 |
| VPS IP | 82.29.67.124 |
| SSH 用户 | toolibox |
| 项目目录 | /var/www/toolibox |
| GitHub | https://github.com/sicks0214/toolibox-2.0 |

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| 前端语言 | TypeScript |
| 样式 | Tailwind CSS |
| 国际化 | next-intl |
| 后端框架 | Express.js |
| 数据库 ORM | Prisma |
| 数据库 | PostgreSQL (生产) / SQLite (开发) |
| 容器化 | Docker + Docker Compose |
| 反向代理 | Nginx |

### 1.3 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| Main 应用 | ✅ 已完成 | 导航入口、用户认证、反馈系统 |
| PDF Tools | ✅ 已完成 | 合并/拆分 PDF |
| Image Tools | ⏳ 待开发 | 图片压缩/调整/转换 |
| Text Tools | ⏳ 待开发 | 大小写转换/字数统计 |

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
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐
   │  Main   │  │PDF Tools │  │  Backend │  │ (预留)  │
   │ :3000   │  │  :3001   │  │  :8000   │  │ :3002+  │
   └─────────┘  └──────────┘  └──────────┘  └─────────┘
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
    }

    # PDF Tools 微前端
    location /pdf-tools {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 三、关键参数配置

### 3.1 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| Main Frontend | 3000 | 主站前端 |
| PDF Tools | 3001 | PDF 工具微前端 |
| Image Tools | 3002 | 预留 |
| Text Tools | 3003 | 预留 |
| Backend API | 8000 | 统一后端服务 |

### 3.2 环境变量 (.env)

```bash
# 数据库
DATABASE_URL="postgresql://toolibox_user:password@localhost:5432/toolibox"

# JWT 认证
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Cloudflare R2 存储
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="toolibox-backups"

# DeepSeek AI API（可选）
DEEPSEEK_API_KEY="your-api-key"

# 环境标识
NODE_ENV="production"
```

### 3.3 微前端路由配置

**配置文件**: `frontend/main/src/config/toolRoutes.ts`

```typescript
// 已部署的微前端列表
export const DEPLOYED_MICROSERVICES: string[] = [
  'pdf-tools',    // ✅ 已部署
  // 'image-tools', // 待部署时取消注释
  // 'text-tools',  // 待部署时取消注释
];

// 分类到子路径的映射
export const CATEGORY_ROUTES: Record<string, string> = {
  'pdf-tools': '/pdf-tools',
  'image-tools': '/image-tools',
  'text-tools': '/text-tools',
};
```

### 3.4 国际化配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 支持语言 | `en`, `zh` | 英文、中文 |
| 默认语言 | `en` | 英文 |
| localePrefix | `always` | 所有路径都包含语言前缀 |

**URL 示例**:
- `/en` - 主站英文
- `/zh` - 主站中文
- `/pdf-tools/en/merge-pdf` - PDF 合并工具英文
- `/pdf-tools/zh/merge-pdf` - PDF 合并工具中文

---

## 四、目录结构

```
toolibox-2.0/
├── frontend/
│   ├── main/                      # 主站应用
│   │   ├── src/
│   │   │   ├── app/[locale]/      # 页面路由
│   │   │   ├── components/        # 组件
│   │   │   ├── config/            # 配置（toolRoutes.ts）
│   │   │   ├── contexts/          # React Context
│   │   │   ├── data/              # JSON 数据
│   │   │   ├── lib/               # 工具函数
│   │   │   └── locales/           # 翻译文件
│   │   ├── next.config.js
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── pdf-tools/                 # PDF 工具微前端
│       ├── src/
│       │   ├── app/[locale]/      # 页面路由
│       │   │   ├── merge-pdf/     # 合并 PDF
│       │   │   ├── split-pdf/     # 拆分 PDF
│       │   │   └── compress-pdf/  # 压缩 PDF (待实现)
│       │   ├── components/
│       │   └── locales/
│       ├── next.config.js         # basePath: '/pdf-tools'
│       ├── Dockerfile
│       └── package.json
│
├── backend/                       # 后端 API
│   ├── src/
│   │   ├── app.ts                 # 入口文件
│   │   ├── controllers/           # 控制器
│   │   ├── routes/                # 路由
│   │   ├── middleware/            # 中间件
│   │   └── services/              # 服务
│   ├── prisma/
│   │   └── schema.prisma          # 数据库模型
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── toolibox.conf              # Nginx 配置
│
├── docker-compose.yml             # 容器编排
├── .env.example                   # 环境变量模板
└── docs/
    └── Toolibox Main.md           # 本文档
```

---

## 五、快速部署

### 5.1 首次部署

```bash
# 1. SSH 登录
ssh toolibox@82.29.67.124

# 2. 克隆代码
cd /var/www
git clone https://github.com/sicks0214/toolibox-2.0.git toolibox
cd toolibox

# 3. 配置环境变量
cp .env.example .env
nano .env  # 填写真实值

# 4. 构建镜像
docker compose build

# 5. 启动服务
docker compose up -d

# 6. 验证部署
docker ps
curl http://localhost:3000
curl http://localhost:8000/api/health
```

### 5.2 更新部署

```bash
# 1. SSH 登录并进入目录
ssh toolibox@82.29.67.124
cd /var/www/toolibox

# 2. 拉取最新代码
git pull origin main

# 3. 停止旧容器
docker compose down

# 4. 重新构建
docker compose build

# 5. 启动新容器
docker compose up -d

# 6. 验证
docker ps
curl http://82.29.67.124/api/health
```

### 5.3 常用命令

```bash
# 查看容器状态
docker ps

# 查看日志
docker compose logs -f
docker compose logs -f backend-main

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 进入容器
docker exec -it toolibox-backend-main sh
```

---

## 六、开发规范

### 6.1 basePath 与 localePrefix 规则

**重要**: 在微前端应用中使用 `basePath` 和 `localePrefix: 'always'` 时：

| 规则 | 说明 |
|------|------|
| Next.js 自动添加 basePath | 代码中不要手动写 `/pdf-tools` |
| 所有语言都需要前缀 | 包括默认语言 `en` |
| 使用 `/${locale}/${slug}` | Next.js 会生成 `/pdf-tools/${locale}/${slug}` |

**正确示例**:
```typescript
// ✅ 正确
const path = `/${locale}/${tool.slug}`;
// 生成: /pdf-tools/en/merge-pdf

// ❌ 错误
const path = `/pdf-tools/${locale}/${tool.slug}`;
// 生成: /pdf-tools/pdf-tools/en/merge-pdf (重复)
```

### 6.2 微前端链接规则

在 Main 应用中引用微前端时：

```tsx
// 判断是否是已部署的微前端
const isExternal = isMicroserviceDeployed(categoryId) && !tool.comingSoon;

if (isExternal) {
  // 微前端：使用 <a> 标签（完整页面跳转）
  return <a href={getToolUrl(categoryId, slug, locale)}>...</a>;
} else {
  // 内部路由：使用 <Link>（客户端导航）
  return <Link href={path}>...</Link>;
}
```

### 6.3 添加新微前端

1. **创建微前端目录**: `frontend/new-tools/`

2. **配置 next.config.js**:
```javascript
const nextConfig = {
  basePath: '/new-tools',
  output: 'standalone',
};
```

3. **更新 toolRoutes.ts**:
```typescript
export const DEPLOYED_MICROSERVICES: string[] = [
  'pdf-tools',
  'new-tools',  // 新增
];

export const CATEGORY_ROUTES: Record<string, string> = {
  'pdf-tools': '/pdf-tools',
  'new-tools': '/new-tools',  // 新增
};
```

4. **更新 docker-compose.yml**:
```yaml
frontend-new-tools:
  build:
    context: ./frontend/new-tools
    dockerfile: Dockerfile
  image: toolibox/frontend-new-tools
  ports:
    - "3002:3002"
```

5. **更新 Nginx 配置**:
```nginx
location /new-tools {
    proxy_pass http://127.0.0.1:3002;
}
```

---

## 七、常见问题

### 7.1 502 Bad Gateway

**原因**: 容器未运行

**解决**:
```bash
docker ps
docker compose up -d
docker compose logs -f
```

### 7.2 语言切换路径重复

**症状**: URL 变成 `/pdf-tools/zh/pdf-tools/merge-pdf`

**原因**: 代码中手动添加了 basePath

**解决**: 参考 [6.1 basePath 规则](#61-basepath-与-localeprefix-规则)

### 7.3 微前端链接不刷新页面

**原因**: 使用了 `<Link>` 而非 `<a>`

**解决**: 微前端链接使用 `<a>` 标签

### 7.4 CORS 错误

**解决**: 在 `backend/src/middleware/cors.ts` 添加允许的域名：
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://82.29.67.124',
  'https://toolibox.com',
];
```

### 7.5 后端容器启动失败

**检查**:
```bash
# 确认 Dockerfile 使用多阶段构建
cat backend/Dockerfile | grep "AS builder"

# 确认入口点正确
cat backend/Dockerfile | grep "dist/app.js"
```

---

## 八、更新日志

### 2025-12-20 (v2.1)

**路由修复**:
- 修复 PDF Tools 语言切换路径重复问题
- 修复 Main 应用工具链接 locale 重复问题
- 微前端链接改用 `<a>` 标签
- 添加 VPS IP 到 CORS 白名单
- compress-pdf 页面添加国际化

**修复文件**:
- `frontend/pdf-tools/src/components/layout/Header.tsx`
- `frontend/pdf-tools/src/components/ToolCard.tsx`
- `frontend/main/src/components/layout/Header.tsx`
- `frontend/main/src/components/home/PopularTools.tsx`
- `frontend/main/src/app/[locale]/[categoryId]/page.tsx`
- `backend/src/middleware/cors.ts`

### 2025-12-20 (v2.0)

**微前端架构升级**:
- 新增 PDF Tools 微前端 (`frontend/pdf-tools/`)
- 实现合并 PDF 和拆分 PDF 功能
- 配置 basePath 和 localePrefix
- 更新 Main 应用路由逻辑

### 2025-12-18 (v1.1)

**后端 Dockerfile 修复**:
- 改用多阶段构建
- 正确编译 TypeScript
- 修复入口点为 `dist/app.js`

---

## 附录：验证清单

部署后验证：

- [ ] `docker ps` 显示 3 个容器运行中
- [ ] `curl http://82.29.67.124/` 返回 200
- [ ] `curl http://82.29.67.124/api/health` 返回 JSON
- [ ] `curl http://82.29.67.124/pdf-tools/en` 返回 200
- [ ] `curl http://82.29.67.124/pdf-tools/zh/merge-pdf` 返回 200
- [ ] 浏览器中语言切换正常工作
- [ ] 从主站点击 PDF 工具可正常跳转

---

**文档版本**: 2.1
**最后更新**: 2025-12-20
