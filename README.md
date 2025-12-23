# Split PDF Tool

完整的 PDF 分割工具，支持三种分割模式：按页码范围、固定页数、提取指定页面。

## 功能特性

- ✅ **三种分割模式**
  - 📄 按页码范围（1-3, 5, 8-10）
  - 📊 固定页数（每 N 页一个文件）
  - 🎯 提取指定页面（1, 3, 7）

- ✅ **技术栈**
  - 前端：Next.js 14 + TypeScript + Tailwind CSS
  - 后端处理：通过 Toolibox 统一后端 API
  - 国际化：next-intl（中英双语）
  - 部署：Docker

- ✅ **隐私安全**
  - 文件通过后端 API 处理
  - 处理完成后自动删除临时文件
  - 符合 Toolibox 安全规范

- ✅ **SEO 优化**
  - 完整的 How-to 教程
  - FAQ 常见问题
  - 使用场景说明

## 项目结构

```
Split_PDF/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/       # 国际化路由
│   │   │   │   ├── layout.tsx  # 根布局
│   │   │   │   ├── page.tsx    # 首页（重定向）
│   │   │   │   └── split-pdf/
│   │   │   │       └── page.tsx # 工具主页面
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx   # 页头（Logo + 语言切换）
│   │   │   │   └── Footer.tsx   # 页脚
│   │   │   ├── Breadcrumb.tsx   # 面包屑导航
│   │   │   ├── FileUploader.tsx # 文件上传
│   │   │   ├── ModeSelector.tsx # 模式选择
│   │   │   ├── ParameterInput.tsx # 参数输入
│   │   │   ├── HowToSection.tsx # 使用说明
│   │   │   ├── FAQSection.tsx   # FAQ
│   │   │   └── UsageScenariosSection.tsx # 使用场景
│   │   ├── lib/
│   │   │   └── pdfSplitter.ts   # PDF 处理逻辑
│   │   ├── locales/
│   │   │   ├── en.json          # 英文翻译
│   │   │   └── zh.json          # 中文翻译
│   │   ├── i18n/
│   │   │   └── request.ts       # i18n 配置
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── config.ts            # locales 配置
│   │   └── middleware.ts        # 路由中间件
│   ├── public/
│   │   └── .gitkeep
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
├── docs/                        # 文档
│   └── REFACTOR_REPORT.md       # 重构报告
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 本地开发

### 前提条件

- Node.js 18+
- npm 或 yarn

### 启动开发服务器

```bash
cd frontend
npm install
npm run dev
```

访问：
- 中文版：http://localhost:3001/pdf-tools/zh/split-pdf
- 英文版：http://localhost:3001/pdf-tools/en/split-pdf

## Docker 部署

### 构建并启动

```bash
docker-compose up -d
```

### 查看日志

```bash
docker-compose logs -f
```

### 停止服务

```bash
docker-compose down
```

访问 `http://localhost:3001/pdf-tools/en/split-pdf`

## 部署到 VPS

### 1. 准备 VPS 环境

确保 VPS 已安装：
- Docker
- Docker Compose
- Nginx

### 2. 上传代码

```bash
# 打包项目
tar -czf split-pdf-tool.tar.gz Split_PDF/

# 上传到 VPS
scp split-pdf-tool.tar.gz toolibox@82.29.67.124:/var/www/

# 在 VPS 上解压
ssh toolibox@82.29.67.124
cd /var/www
tar -xzf split-pdf-tool.tar.gz
```

### 3. 构建 Docker 镜像

```bash
cd /var/www/Split_PDF

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
location /pdf-tools/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 验证部署

```bash
# 检查前端
curl http://localhost:3001

# 通过浏览器访问
# http://82.29.67.124/pdf-tools/en/split-pdf
```

## 技术细节

### 架构特点

- **前后端分离**：前端负责 UI，后端负责 PDF 处理
- **统一后端 API**：调用 Toolibox 后端 `/api/pdf/split`
- **国际化**：next-intl 支持中英双语
- **微前端**：basePath 设置为 `/pdf-tools`
- **多阶段构建**：Docker standalone 模式优化镜像大小

### 核心依赖

```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "next-intl": "^3.0.0"
}
```

### PDF 处理流程

1. 用户在浏览器中选择 PDF 文件
2. 选择分割模式和参数
3. 前端将文件和配置发送到后端 API `/api/pdf/split`
4. 后端使用 pdf-lib 处理 PDF
5. 返回处理后的文件（单个 PDF 或 ZIP 包）
6. 前端触发下载

## 故障排查

### 前端容器无法启动

```bash
# 查看日志
docker logs split-pdf-frontend

# 常见问题：
# 1. 端口被占用 - 修改 docker-compose.yml 中的端口
# 2. 构建失败 - 检查 public 目录是否存在
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

### 语言切换不工作

检查：
1. middleware.ts 配置是否正确
2. locales 文件是否存在
3. URL 是否包含 locale 前缀（/en/ 或 /zh/）

## 符合规范

本项目完全符合 Toolibox Tool Template v3.0 技术规范：

- ✅ 国际化支持（next-intl）
- ✅ 目录结构（app/[locale]/split-pdf/）
- ✅ 配置文件（config.ts, middleware.ts, i18n/request.ts）
- ✅ 翻译文件（locales/en.json, locales/zh.json）
- ✅ 布局组件（Header, Footer, Breadcrumb）
- ✅ basePath 设置为 /pdf-tools
- ✅ 端口号为 3001
- ✅ 后端 API 处理（调用 /api/pdf/split）
- ✅ Docker 配置符合 Toolibox 规范

详细重构报告请查看：[docs/REFACTOR_REPORT.md](docs/REFACTOR_REPORT.md)

## 许可证

MIT License

## 联系方式

- 项目仓库：GitHub
- 问题反馈：Issues
