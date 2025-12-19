# Toolibox · Split PDF 工具技术规范

## 概述

本文档定义了 **Split PDF（PDF 拆分工具）**
的完整技术实现规范，包括页面结构、交互行为、SEO 优化以及后端接口设计。

### 设计原则

-   **单页面架构**
-   **固定核心操作区**
-   **SEO 友好**
-   **微前端兼容**
-   **统一交互标准**

## 1. 工具基本信息

  属性         值
  ------------ ------------------------
  Tool Name    Split PDF
  Category     PDF Tools
  URL          `/pdf-tools/split-pdf`
  Tool Level   一级主工具

## 2. 页面唯一性规则

Split PDF 只能有一个页面： `/pdf-tools/split-pdf`

## 3. 页面整体布局

    Breadcrumb
    H1: Split PDF
    Core Tool Area
    Inline Feedback
    Usage Scenarios
    How-to Section
    FAQ
    Footer

## 4. Core Tool Area

-   文件上传（单 PDF）
-   文件信息（名称、页数）
-   主按钮：Split PDF
-   位置固定

## 5. 使用场景规范

### 5.1 Split PDF by Page Range

H2 标题：

    Split PDF by Page Range

描述：

    Split PDF by Page Range allows you to enter custom page ranges such as
    1-3, 5, 8-10. The tool extracts and generates new PDF files from the
    selected ranges.

### 5.2 Split PDF Every X Pages

H2 标题：

    Split PDF Every X Pages

描述：

    Split PDF Every X Pages divides a PDF into equal parts. Entering “5”
    will generate a new PDF every five pages.

### 5.3 Extract Pages from PDF

H2 标题：

    Extract Pages from PDF

描述：

    Extract Pages allows selecting specific pages, generating a new PDF
    containing only those pages.

## 6. Inline Feedback

示例：

    ✓ Page range mode enabled
    ✓ Extract pages mode enabled

## 7. How-to 区块

包含 4 步骤： - 上传 PDF - 选择模式 - 配置拆分参数 - 下载生成文件

## 8. FAQ（6 条）

示例问题： 1. Is Split PDF free? 2. Are my files secure? 3. Can I split
large PDF files? 4. Can I extract multiple page ranges? 5. Will my
original file be preserved? 6. Can I split encrypted PDFs?

## 9. 后端接口规范

### Endpoint

    POST /api/pdf/split

### 请求字段

  字段       类型     说明
  ---------- -------- ------------
  file       File     PDF 文件
  commands   String   命令字符串

### Commands 格式

    --mode range
    --range 1-3,5

    --mode fixed
    --pages-per-file 5

    --mode extract
    --pages 1,3,7

## 10. 部署要求

-   前端容器：`toolibox/frontend-split`
-   路由：`/pdf-tools/split-pdf`
-   后端路由：`/api/pdf/split`

## 11. Checklist

-   [ ] 前端可访问\
-   [ ] 拆分功能完整\
-   [ ] ZIP 下载正常\
-   [ ] SEO 结构完整\
-   [ ] 加入 sitemap
