# Split PDF Plugin

PDF 分割插件，支持三种分割模式：按页码范围、固定页数、提取指定页面。

## 插件结构

```
backend/plugins/split-pdf/
├── plugin.json          # 插件元数据
├── ui.json              # UI 配置（页面布局、使用场景、FAQ等）
├── schema.json          # 表单 schema（输入参数定义）
└── handler/
    └── index.ts         # 处理逻辑
```

## 功能特性

- **三种分割模式**
  - 按页码范围（1-3, 5, 8-10）
  - 固定页数（每 N 页一个文件）
  - 提取指定页面（1, 3, 7）

- **输出格式**
  - 单个文件：PDF
  - 多个文件：ZIP 压缩包

## 接入主站

根据《插件接入主站的唯一正确流程规范》，将插件目录复制到主站：

```bash
cp -r backend/plugins/split-pdf /path/to/toolibox/backend/plugins/
```

重启主站后端服务，插件会自动：
1. 注册 API 路由：`POST /api/pdf/split-pdf`
2. 在 `/api/plugins` 返回插件元数据
3. 前端自动生成工具页面和 UI

## 依赖

插件需要以下 npm 包（主站后端应已安装）：
- `pdf-lib` - PDF 处理
- `jszip` - ZIP 压缩

## API 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | PDF 文件 |
| mode | string | 是 | 分割模式：range/fixed/extract |
| range | string | mode=range 时必填 | 页码范围，如 "1-3, 5, 8-10" |
| pagesPerFile | number | mode=fixed 时必填 | 每文件页数 |
| pages | string | mode=extract 时必填 | 要提取的页码，如 "1, 3, 7" |

## 本地开发（可选）

`frontend/` 目录包含独立前端，仅用于本地开发调试，不用于生产部署。

```bash
cd frontend/pdf-tools
npm install
npm run dev
```

访问 http://localhost:3001/pdf-tools/zh/split-pdf

## 许可证

MIT License
