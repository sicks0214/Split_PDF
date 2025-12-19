# ============================================
# Builder Stage - 编译 TypeScript
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm install

# 复制源代码
COPY src ./src

# 编译 TypeScript -> JavaScript
RUN npm run build

# ============================================
# Runner Stage - 生产环境
# ============================================
FROM node:18-alpine AS runner

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 仅安装生产依赖
RUN npm install --omit=dev

# 从 builder 复制编译后的代码
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 4001

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "dist/app.js"]
