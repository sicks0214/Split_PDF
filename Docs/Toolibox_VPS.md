
# Toolibox VPS 系统说明文档

> 服务器信息：
> - IP地址：82.29.67.124
> - 操作系统：Ubuntu 22.04 LTS
> - 时区：America/New_York (美东时间)
> - 架构：工具站 / SaaS / 微前端
> - 路由方式：单域名 + 子路径（/pdf-tools /image-tools）
> - 技术栈：前后端分离 + Docker + Nginx

---

## 一、系统架构（核心设计）

```
Internet
   │
   ▼
Nginx (Host) - 82.29.67.124
   │
   ├── /                          → 主站（导航 / 首页）- 端口3000
   ├── /pdf-tools/*               → PDF 工具前端 - 端口3001
   ├── /image-tools/*             → Image 工具前端 - 端口3002（待部署）
   │
   ├── /api/pdf/*                 → PDF 后端服务 - 端口4001（待部署）
   ├── /api/image/*               → Image 后端服务 - 端口4002（待部署）
   │
Docker Containers (已部署)
   ├── toolibox-frontend-main-1   (运行中)
   ├── toolibox-frontend-pdf-1    (运行中)
   └── [其他容器待添加]
```

架构特点：
- 单域名，子路径反向代理
- 每个工具独立Docker容器
- 可随时新增/删除工具，互不影响
- 宿主机Nginx统一管理流量

---

## 二、系统配置状态

### 用户与权限
- **Root用户**：已配置
- **普通用户**：toolibox（具有sudo权限）
- **登录方式**：`ssh toolibox@82.29.67.124`

### 系统设置
- **时区**：America/New_York (美东时间)
- **系统更新**：已完成 apt update && upgrade

### 安全配置
- **防火墙（UFW）**：已启用
  - 开放端口：SSH (22), HTTP (80), HTTPS (443)
  - 状态：active
- **SSH安全**：建议后续配置
  - PermitRootLogin no
  - PasswordAuthentication no

---

## 三、已安装软件与服务

### Docker 环境
- **Docker**：已安装（通过 get.docker.com）
- **Docker Compose**：已安装（docker-compose-plugin）
- **用户权限**：toolibox 已加入 docker 组
- **验证命令**：`docker compose version`

### Nginx 反向代理
- **版本**：nginx/1.18.0 (Ubuntu)
- **状态**：运行中，已设置开机自启
- **配置文件**：`/etc/nginx/sites-available/toolibox.conf`
- **访问测试**：http://82.29.67.124

---

## 四、目录结构

```bash
/var/www/toolibox/
├── docker-compose.yml          # Docker编排配置
├── frontend/
│   ├── main/                   # 主站前端（已部署）
│   │   ├── Dockerfile
│   │   ├── default.conf
│   │   └── index.html
│   ├── pdf/                    # PDF工具前端（已部署）
│   │   ├── Dockerfile
│   │   ├── default.conf
│   │   └── index.html
│   └── image/                  # Image工具前端（待部署）
└── backend/
    ├── pdf/                    # PDF后端服务（待部署）
    └── image/                  # Image后端服务（待部署）
```

**所有者**：toolibox:toolibox

---

## 五、Docker Compose 配置

📄 `/var/www/toolibox/docker-compose.yml`

```yaml
services:
  frontend-main:
    image: toolibox/frontend-main
    restart: always
    ports:
      - "3000:3000"

  frontend-pdf:
    image: toolibox/frontend-pdf
    restart: always
    ports:
      - "3001:3001"

  backend-pdf:
    image: toolibox/backend-pdf
    restart: always
    ports:
      - "4001:4001"

networks:
  default:
    name: toolibox-network
```

**当前运行容器**：
- toolibox-frontend-main-1 (端口3000)
- toolibox-frontend-pdf-1 (端口3001)

---

## 六、Nginx 反向代理配置

📄 `/etc/nginx/sites-available/toolibox.conf`

```nginx
server {
    listen 80;
    server_name 82.29.67.124;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /pdf-tools/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/pdf/ {
        proxy_pass http://127.0.0.1:4001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**配置状态**：
- 已启用：`/etc/nginx/sites-enabled/toolibox.conf`
- 默认配置已删除：`/etc/nginx/sites-enabled/default`
- 测试通过：`nginx -t`

**访问地址**：
- 主站：http://82.29.67.124
- PDF工具：http://82.29.67.124/pdf-tools/

---

## 七、HTTPS 配置（待部署）

### 使用 Certbot（需要域名）

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com -d www.your-domain.com
```

**注意**：当前使用IP访问，配置HTTPS需要先绑定域名。

---

## 八、Docker镜像构建示例

### 前端容器 Dockerfile 模板

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

### Nginx 配置文件 (default.conf)

```nginx
server {
    listen 3000;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

### 构建与部署流程

```bash
# 1. 进入项目目录
cd /var/www/toolibox/frontend/main

# 2. 构建镜像
docker build -t toolibox/frontend-main .

# 3. 启动容器
cd /var/www/toolibox
docker compose up -d frontend-main

# 4. 查看运行状态
docker ps
```

---

## 九、新增工具的标准流程

1. **准备项目文件**：上传到对应目录（frontend/xxx 或 backend/xxx）
2. **创建Dockerfile**：参考上面的模板
3. **构建Docker镜像**：`docker build -t toolibox/xxx .`
4. **更新docker-compose.yml**：添加新服务配置
5. **配置Nginx路由**：在 `/etc/nginx/sites-available/toolibox.conf` 添加 location
6. **重载Nginx**：`sudo nginx -t && sudo systemctl reload nginx`
7. **启动容器**：`docker compose up -d xxx`

**优势**：每个工具独立，互不影响

---

## 十、常用运维命令

### Docker 操作
```bash
# 查看运行容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器日志
docker logs toolibox-frontend-main-1

# 重启容器
docker compose restart frontend-main

# 停止所有容器
docker compose down

# 启动指定容器
docker compose up -d frontend-main frontend-pdf
```

### Nginx 操作
```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

---

## 十一、故障排查

| 问题 | 可能原因 | 解决方法 |
|------|---------|---------|
| 502 Bad Gateway | Docker容器未运行 | `docker ps` 检查，`docker compose up -d` 启动 |
| 404 Not Found | Nginx location配置错误 | 检查 `/etc/nginx/sites-available/toolibox.conf` |
| 连接超时 | 防火墙未开放端口 | `sudo ufw status` 检查，`sudo ufw allow 80` |
| 容器启动失败 | 端口被占用 | `sudo netstat -tlnp \| grep 3000` 检查端口 |

---

## 十二、系统维护建议

### 日志管理
- Nginx日志：`/var/log/nginx/`
- Docker日志：`docker logs <container_name>`

### 备份策略
- 定期备份 `/var/www/toolibox/` 目录
- 使用 rsync 或 VPS 快照功能
- 备份 Nginx 配置文件

### 安全加固（建议）
- 配置SSH密钥登录，禁用密码登录
- 禁止root远程登录
- 定期更新系统：`sudo apt update && sudo apt upgrade`
- 配置域名后启用HTTPS

---

## 十三、架构优势

✅ **模块化**：每个工具独立容器，互不干扰
✅ **可扩展**：随时添加新工具，只需5步
✅ **易维护**：单一入口（Nginx），统一管理
✅ **灵活部署**：支持前后端分离，支持多种技术栈
✅ **开发友好**：本地npm开发，服务器Docker部署

---

