# 使用 Dockerfile 构建 OpenClaw Desktop

# 阶段 1：基础镜像准备
FROM node:20-alpine

WORKDIR /app

# 阶段 2：安装 Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 阶段 3：设置工作目录
RUN cd /app && \
    mkdir -p src && \
    mkdir -p src-tauri && \
    mkdir -p src/assets

# 阶段 4：复制项目文件
COPY package*.json ./
COPY package*.lock.json ./
COPY src ./src
COPY src-tauri ./src-tauri

# 阶段 5：安装依赖
RUN cd /app && \
    npm install

# 阶段 6：构建前端
RUN cd /app && \
    npm run build

# 阶段 7：构建 Rust 后端
RUN cd /app/src-tauri && \
    cargo build --release

# 阶段 8：构建 AppImage（最终阶段）
# RUN cd /app && \
    npm run tauri build

# 阶段 9：输出构建产物
RUN ls -R

# 设置环境变量
ENV NODE_ENV=production
ENV VITE=production

# 暴用 Tauri CLI
RUN npm install -g @tauri-apps/cli

# 启动脚本
ADD run npm run dev && \
    npm run tauri dev

# 设置默认命令
ENV RUST_LOG=raised

# 生成 AppImage
CMD ["npm", "run", "tauri", "build"]
