# Toolibox · 工具开发技术规范

> **技术架构**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
> **参考实现**: Merge PDF (`frontend/pdf-tools`)

---

## 1. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | React 框架（App Router） |
| React | 18.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式框架 |
| next-intl | 3.x | 国际化（i18n） |
| Docker | - | 容器化部署 |

---

## 2. 设计原则

- **单页面架构**: 所有使用场景在同一页面通过状态切换呈现
- **固定操作区**: 核心工具区域位置固定，不受其他交互影响
- **SEO 友好**: 所有内容在 HTML 中存在，默认可见
- **客户端优先**: 优先使用客户端处理（隐私安全）
- **微前端架构**: 作为独立微前端部署
- **导航一致性**: 通过 Breadcrumb 提供返回 Main 应用的入口

---

## 3. 工具基本信息

| 属性 | 值 | 示例 |
|------|-----|------|
| Tool Name | [工具英文名] | Merge PDF |
| Tool ID | `[tool-id]` | `merge-pdf` (小写+连字符) |
| Category ID | `[category-id]` | `pdf-tools`, `image-tools` |
| 所属微前端 | `frontend/[category-id]` | `frontend/pdf-tools` |
| 端口 | [端口号] | 3001 (PDF Tools) |
| Main 应用地址 | `http://82.29.67.124` | 固定值 |

### URL 路由

| 语言 | URL |
|------|-----|
| 英文 | `/[category-id]/en/[tool-id]` |
| 中文 | `/[category-id]/zh/[tool-id]` |

---

## 4. 目录结构

```
frontend/[category-id]/
├── src/
│   ├── app/[locale]/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 分类首页
│   │   └── [tool-id]/page.tsx      # ★ 工具页面
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 页头（Logo + 语言切换）
│   │   │   └── Footer.tsx          # 页脚
│   │   ├── Breadcrumb.tsx          # ★ 面包屑（支持外部链接）
│   │   ├── CoreToolArea.tsx        # 核心操作区
│   │   ├── UseCaseCards.tsx        # 使用场景卡片
│   │   ├── HowToSection.tsx        # 使用说明
│   │   ├── FAQSection.tsx          # FAQ
│   │   └── ResultPage.tsx          # 结果页面（可选）
│   ├── lib/
│   │   └── [toolLogic].ts          # 工具处理逻辑
│   ├── locales/
│   │   ├── en.json                 # 英文翻译
│   │   └── zh.json                 # 中文翻译
│   ├── i18n/request.ts             # i18n 配置
│   ├── middleware.ts               # 路由中间件
│   └── config.ts                   # 配置文件
├── public/                         # ★ 静态资源（必须存在）
├── next.config.js                  # Next.js 配置
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── Dockerfile
```

---

## 5. 关键配置文件

### 5.1 next.config.js

```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  basePath: '/[category-id]',      // ★ 微前端基础路径
  output: 'standalone',             // ★ Docker 部署必需
};

module.exports = withNextIntl(nextConfig);
```

### 5.2 middleware.ts

```typescript
import createMiddleware from 'next-intl/middleware';
import {locales} from './config';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'            // ★ URL 必须包含语言前缀
});

export const config = {
  matcher: ['/', '/(en|zh)/:path*']
};
```

### 5.3 i18n/request.ts

```typescript
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales, type Locale} from '../config';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
```

### 5.4 config.ts

```typescript
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
```

### 5.5 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=[port]

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE [port]
CMD ["node", "server.js"]
```

---

## 6. 页面结构规范

### 6.1 页面布局顺序（固定）

```
┌─────────────────────────────────┐
│ Header (Logo + 语言切换)         │
├─────────────────────────────────┤
│ Breadcrumb (Home → Category → Tool) │
│   ↑ Home 链接跳转到 Main 应用    │
├─────────────────────────────────┤
│ H1: 工具标题                     │
│ 介绍文本                         │
├─────────────────────────────────┤
│ Core Tool Area ← 固定位置        │
│  - 文件上传/输入                 │
│  - 内容展示                      │
│  - 主操作按钮                    │
├─────────────────────────────────┤
│ Inline Feedback (可选)           │
├─────────────────────────────────┤
│ Use Case Cards (3列网格)         │
├─────────────────────────────────┤
│ How to Section (使用说明)        │
├─────────────────────────────────┤
│ FAQ Section                      │
├─────────────────────────────────┤
│ Footer                           │
└─────────────────────────────────┘
```

### 6.2 工具页面模板

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CoreToolArea } from '@/components/CoreToolArea';
import { UseCaseCards } from '@/components/UseCaseCards';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';

export default function ToolPage() {
  const t = useTranslations('[tool-id]');
  const [useCaseOptions, setUseCaseOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/', external: true },  // ★ 跳转到 Main
    { label: t('breadcrumb.category'), href: '/' },
    { label: t('breadcrumb.tool') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <header className="text-center mb-12">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </header>

        <CoreToolArea options={useCaseOptions} />
        <UseCaseCards options={useCaseOptions} onOptionsChange={setUseCaseOptions} />
        <HowToSection />
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}
```

---

## 7. 核心组件规范

### 7.1 Breadcrumb 组件（必需）

**关键点**:
- 支持 `external` 属性标记外部链接
- 外部链接使用 `<a>` 标签跳转到 Main 应用
- 内部链接使用 `<Link>` 组件
- 使用 `useParams()` 获取当前语言

```typescript
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  external?: boolean;  // ★ 标记是否跳转到 Main 应用
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const MAIN_APP_URL = 'http://82.29.67.124';

export function Breadcrumb({ items }: BreadcrumbProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              item.external ? (
                <a
                  href={`${MAIN_APP_URL}/${locale}${item.href === '/' ? '' : item.href}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={`/${locale}${item.href}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### 7.2 Header 组件（必需）

**关键点**:
- Logo 链接到分类首页
- 语言切换使用 `<Link>` 组件
- 使用 `useParams()` 和 `usePathname()` 处理语言切换

```typescript
'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export function Header() {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${currentLocale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            [Category Name]
          </span>
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Link
            href={switchLocale('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === 'en'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EN
          </Link>
          <Link
            href={switchLocale('zh')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === 'zh'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            中文
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### 7.3 CoreToolArea 组件（必需）

**必须包含**:
1. 文件上传/输入区域
2. 内容展示区域（文件列表、预览等）
3. 主操作按钮

**行为规则**:
- 位置固定，不受其他交互影响
- 支持拖拽上传（使用 react-dropzone）
- 显示处理状态（loading）

### 7.4 UseCaseCards 组件（必需）

**设计要求**:
- 3列网格布局（桌面端）
- 1列布局（移动端）
- 点击卡片切换状态，不跳转页面
- 所有内容默认可见（SEO）

### 7.5 HowToSection 组件（必需）

**SEO 要求**:
- 3-5个步骤说明
- 使用 `<h3>` 标签
- 网格卡片布局

### 7.6 FAQSection 组件（必需）

**SEO 要求**:
- 至少6个常见问题
- 使用 `<details>` 和 `<summary>` 或自定义折叠组件
- 所有内容在 HTML 中完整存在

---

## 8. 客户端处理规范

### 8.1 技术选型

| 工具类型 | 推荐库 |
|---------|--------|
| PDF 工具 | pdf-lib |
| 图片工具 | browser-image-compression |
| 文本工具 | 原生 JS |

### 8.2 实现模板

```typescript
// lib/[toolLogic].ts

export async function processFile(file: File, options: Options): Promise<Result> {
  const arrayBuffer = await file.arrayBuffer();
  const processed = await [processingFunction](arrayBuffer, options);
  return processed;
}

// Blob 创建（TypeScript 5.x 兼容）
const blob = new Blob([new Uint8Array(result)], { type: 'application/[type]' });
```

---

## 9. 国际化（i18n）

### 9.1 翻译文件结构

```json
{
  "[tool-id]": {
    "title": "Tool Name",
    "subtitle": "Description",
    "breadcrumb": {
      "home": "Home",
      "category": "Category Name",
      "tool": "Tool Name"
    },
    "upload": {
      "title": "Upload Files",
      "dragDrop": "Drag and drop or click to upload"
    },
    "actions": {
      "merge": "Merge",
      "merging": "Merging..."
    },
    "howTo": {
      "title": "How to use",
      "step1": { "title": "Step 1", "description": "..." }
    },
    "faq": {
      "title": "FAQ",
      "q1": { "question": "...", "answer": "..." }
    }
  }
}
```

### 9.2 使用方式

```typescript
// 客户端组件
'use client';
import { useTranslations } from 'next-intl';

const t = useTranslations('[tool-id]');
return <h1>{t('title')}</h1>;

// 服务端组件
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('[tool-id]');
return <h1>{t('title')}</h1>;
```

---

## 10. Main 应用集成说明

工具开发完成后，需要在 Main 应用中进行以下配置（由 Main 应用维护者完成）：

1. 在 `toolRoutes.ts` 中添加 `[category-id]` 到 `DEPLOYED_MICROSERVICES`
2. 在 `tools.json` 中添加工具信息，设置 `comingSoon: false`

---

## 11. 开发验证清单

### 11.1 配置文件检查
- [ ] `public/` 目录存在（即使为空）
- [ ] `next.config.js` 配置正确（basePath, output）
- [ ] `middleware.ts` 配置正确（localePrefix: 'always'）
- [ ] `config.ts` 定义了 locales
- [ ] `i18n/request.ts` 配置正确

### 11.2 组件检查
- [ ] Breadcrumb 组件支持 `external` 属性
- [ ] CoreToolArea 组件实现完整
- [ ] UseCaseCards 组件实现完整
- [ ] HowToSection 组件实现完整
- [ ] FAQSection 组件实现完整

### 11.3 国际化检查
- [ ] `locales/en.json` 翻译完整
- [ ] `locales/zh.json` 翻译完整
- [ ] 所有文本使用 `useTranslations` 或 `getTranslations`

### 11.4 功能验证
- [ ] 本地开发环境运行正常（`npm run dev`）
- [ ] 构建成功（`npm run build`）
- [ ] Docker 镜像构建成功
- [ ] 语言切换功能正常
- [ ] 主要功能正常工作
- [ ] 移动端适配正常
- [ ] Breadcrumb Home 链接配置为 `external: true`

---

## 12. 常见开发问题

### Q: Docker 构建失败，提示 `/app/public` not found

**原因**: Next.js standalone 模式需要 `public/` 目录存在

**解决**:
```bash
mkdir -p frontend/[category-id]/public
touch frontend/[category-id]/public/.gitkeep
```

### Q: Home 链接不跳转到 Main 应用

**原因**: Breadcrumb 组件未正确配置 `external` 属性

**解决**: 确保 breadcrumbItems 中 Home 项有 `external: true`
```typescript
{ label: 'Home', href: '/', external: true }  // ★ 必须有 external: true
```

### Q: TypeScript 类型不兼容（Blob）

**原因**: TypeScript 5.x 对类型检查更严格

**解决**: 使用 Uint8Array 包装
```typescript
const blob = new Blob([new Uint8Array(result)], { type: 'application/pdf' });
```

### Q: 语言切换后页面 404

**原因**: middleware matcher 配置不正确

**解决**: 确保 middleware.ts 中的 matcher 包含正确的路径
```typescript
export const config = {
  matcher: ['/', '/(en|zh)/:path*']
};
```

---

## 13. 参考实现

完整参考实现请查看: `frontend/pdf-tools` (Merge PDF)

**关键文件**:
- `src/app/[locale]/merge-pdf/page.tsx` - 工具页面
- `src/components/Breadcrumb.tsx` - 面包屑导航
- `src/components/CoreToolArea.tsx` - 核心操作区
- `src/lib/pdfMerger.ts` - 客户端处理逻辑
- `next.config.js` - Next.js 配置
- `Dockerfile` - Docker 配置

---

## 版本信息

- **版本**: 3.1 (开发指南版)
- **更新日期**: 2025-12-21
- **基于**: Merge PDF 实际实现
- **用途**: 独立工具开发指南（可直接复制到子工具项目）

### 更新日志

#### v3.1 (2025-12-21)
- 移除 VPS 部署相关内容（由独立部署文档管理）
- 聚焦工具开发流程和规范
- 优化验证清单，更适合开发阶段使用
- 增加常见开发问题解答

#### v3.0 (2025-12-21)
- 精简文档，从 1438 行减少到约 500 行
- 删除冗余代码示例，保留核心配置
- 增加参考实现指引

---

## 使用说明

### 开发新工具时

1. **复制此文档**到新工具项目的 `docs/` 目录
2. **全局替换**以下占位符:
   - `[category-id]` → 实际分类 ID（如 `pdf-tools`）
   - `[tool-id]` → 实际工具 ID（如 `merge-pdf`）
   - `[port]` → 实际端口号（如 `3001`）
3. **参考实现**: 查看 `frontend/pdf-tools` 了解完整实现
4. **按照验证清单**逐项检查开发进度
5. **开发完成后**通知 Main 应用维护者进行集成配置
