# OpenClaw Desktop

OpenClaw Desktop 是 OpenClaw 的桌面管理界面，提供了一个直观的方式来管理您的 OpenClaw 实例。

## 版本

当前版本：**0.2.0 MVP**

**状态**: 后端集成完成 ✅ | 前端完成 ✅

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面应用**: Tauri 2
- **UI 库**: Material-UI (MUI)
- **状态管理**: Zustand
- **构建工具**: Vite
- **后端**: Rust (完整实现)

## 功能

### 已实现的功能

#### 1. ✅ 进程管理
- 启动/停止 OpenClaw 进程（真实实现）
- 实时进程状态监控
- PID、运行时间、内存占用、CPU 使用率
- 自动处理进程崩溃检测

#### 2. ✅ 日志系统
- 实时日志查看（
- 按日志级别过滤（INFO/WARN/ERROR/DEBUG）
- 关键词搜索
- 日志轮转（自动清理旧日志）
- 日志持久化

#### 3. ✅ 消息系统
- 消息发送到 OpenClaw（日志记录）
- 消息历史记录
- 消息分类（用户/系统）
- 消息搜索功能
- 消息数量限制（防止内存溢出）

#### 4. ✅ 配置管理
- JSON 格式配置编辑器
- 配置格式验证
- 配置持久化（保存到文件）
- 配置缓存机制
- 可配置项：
  - 自动启动
  - 日志级别
  - 最大日志行数
  - 最大消息数

#### 5. ✅ 系统监控
- CPU 使用率实时显示
- 内存使用情况（已用/总计）
- 磁盘使用情况（已用/总计）
- 进程数量统计

#### 6. ✅ 系统托盘
- 托盘图标显示
- 右键菜单操作：
  - 显示/隐藏窗口
  - 启动/停止 OpenClaw
  - 退出应用
- 左键点击显示/隐藏窗口

#### 7. ✅ 配置面板
- 可视化配置编辑
- JSON 格式化和验证
- 配置保存和重置

#### 8. ✅ 帮助页面
- 功能说明
- 快捷键列表
- 版本信息
- 系统信息

### UI/UX 特性

- ✅ 深色主题
- ✅ 响应式布局
- ✅ 页面切换动画
- ✅ 错误处理（ErrorBoundary）
- ✅ 加载状态（骨架屏）
- ✅ 底部状态栏
- ✅ 错误提示（Toast）

## 安装和运行

### 前置要求

- Node.js 18+
- npm 9+
- Rust 1.70+ 和 Cargo
  - **重要**: Rust 工具链必须安装才能构建后端

### 安装 Rust

```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 添加到 PATH
source $HOME/.cargo/env
```

### 开发模式

```bash
# 克隆仓库
git clone https://github.com/qqqzhch/openclaw-desktop.git
cd openclaw-desktop

# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev
```

### 构建

```bash
# 构建前端
npm run build

# 构建 Rust 后端
cd src-tauri
cargo build --release

# 或者使用 Tauri CLI 打包完整应用
npm run tauri build
```

### 构建产物

构建完成后，可执行文件位于：

- **Linux**: `src-tauri/target/release/openclaw-desktop`
- **macOS**: `src-tauri/target/release/bundle/macos/OpenClaw Desktop.app`
- **Windows**: `src-tauri/target/release/bundle/msi/OpenClaw Desktop_0.2.0_x64_en-US.msi`

## 项目结构

```
openclaw-desktop/
├── src/                    # 前端源码
│   ├── api/               # API 层（Tauri IPC 调用）
│   │   └── index.ts       # API 函数定义
│   ├── components/            # React 组件
│   │   ├── StatusMonitor.tsx  # 状态监控
│   │   ├── ConfigPanel.tsx    # 配置面板
│   │   ├── LogViewer.tsx      # 日志查看器
│   │   ├── MessageList.tsx    # 消息列表
│   │   └── Help.tsx           # 帮助页面
│   ├── store/             # Zustand 状态管理
│   │   └── useStore.ts    # 全局状态
│   ├── types/             # TypeScript 类型定义
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs         # Rust 入口
│   │   ├── lib.rs          # Tauri 应用设置
│   │   ├── commands.rs     # IPC 命令定义
│   │   ├── openclaw.rs     # OpenClaw 核心管理
│   │   └── tray.rs         # 系统托盘
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── public/                 # 静态资源
├── package.json
├── README.md
├── BACKEND_INTEGRATION.md  # 后端集成文档
└── API_GUIDE.md            # API 使用指南
```

## API 参考

### 进程管理

```typescript
// 启动 OpenClaw
await invoke('start_openclaw');

// 停止 OpenClaw
await invoke('stop_openclaw');

// 获取状态
const status = await invoke<ProcessInfo>('get_openclaw_status');
```

### 日志

```typescript
// 获取日志
const logs = await invoke<string[]>('get_openclaw_logs', { lines: 100 });
```

### 消息

```typescript
// 发送消息
await invoke('send_openclaw_message', { message: 'Hello' });

// 获取消息历史
const messages = await invoke<Message[]>('get_message_history', { limit: 50 });
```

### 配置

```typescript
// 获取配置
const config = await invoke<Config>('get_config');

// 更新配置
await invoke('update_config', { config: newConfig });
```

### 系统信息

```typescript
// 获取系统信息
const sysInfo = await invoke<SystemInfo>('get_system_info');
```

更多 API 详情请参阅 [API_GUIDE.md](API_GUIDE.md)。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + R | 刷新当前页面 |
| Ctrl/Cmd + 1-4 | 切换到标签页 1-4 |

## 系统托盘

### 托盘菜单

- **显示**: 显示主窗口
- **隐藏**: 隐藏主窗口
- **启动 OpenClaw**: 启动 OpenClaw 后台服务
- **停止 OpenClaw**: 停止 OpenClaw 后台服务
- **退出**: 退出应用

### 托盘图标

- 左键点击：显示/隐藏窗口
- 右键点击：显示菜单

## 配置文件

配置文件位置：

- **Linux/macOS**: `~/.openclaw/config.json`
- **Windows**: `%USERPROFILE%\.openclaw\config.json`

日志文件位置：

- **Linux/macOS**: `~/.openclaw/openclaw-desktop.log`
- **Windows**: `%USERPROFILE%\.openclaw\openclaw-desktop.log`

### 配置示例

```json
{
  "auto_start": false,
  "log_level": "INFO",
  "max_log_lines": 1000,
  "max_messages": 500
}
```

## 后端集成状态

### ✅ 已完成

1. **进程管理**: 真实的进程启动/停止，状态监控
2. **日志系统**: 日志记录、读取、轮转、过滤
3. **消息系统**: 消息发送、历史记录、搜索
4. **配置持久化**: 配置保存、加载、验证
5. **系统监控**: CPU、内存、磁盘使用率
6. **系统托盘**: 托盘图标、菜单操作
7. **错误处理**: 完整的错误捕获和用户提示

### 🚧 待完善

1. **OpenClaw IPC 通信**: 当前使用模拟模式，未来可通过 Unix Socket/HTTP 实现
2. **WebSocket 日志流**: 当前使用轮询，未来可实现实时推送
3. **插件系统**: 为未来扩展预留接口
4. **远程管理**: 支持远程 OpenClaw 实例管理

更多后端集成详情请参阅 [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)。

## 开发

### 启动开发服务器

```bash
npm run tauri dev
```

这将启动：
- Vite 开发服务器（前端热重载）
- Tauri 开发模式（窗口管理）

### 调试后端

```bash
# 查看日志
tail -f ~/.openclaw/openclaw-desktop.log

# 使用 GDB 调试
gdb src-tauri/target/release/openclaw-desktop
```

### 运行测试

```bash
# 前端测试
npm test

# 后端测试
cd src-tauri
cargo test
```

## 后续开发计划

### 短期（下一个版本）

- [ ] 实现 OpenClaw IPC 通信（Unix Socket）
- [ ] 实现 WebSocket 日志实时流
- [ ] 添加进程崩溃自动重启
- [ ] 完善错误日志和堆栈跟踪

### 中期

- [ ] 添加主题切换功能
- [ ] 添加通知系统
- [ ] 添加性能监控面板
- [ ] 实现插件系统基础

### 长期

- [ ] 跨平台完全支持（Windows、macOS、Linux）
- [ ] 云同步配置
- [ ] 多语言支持
- [ ] 插件市场和分发
- [ ] 远程 OpenClaw 集群管理

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码风格

- **前端**: 遵循 ESLint 和 Prettier 配置
- **后端**: 使用 `cargo fmt` 格式化，`cargo clippy` 检查

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- **Issues**: [GitHub Issues](https://github.com/qqqzhch/openclaw-desktop/issues)
- **Discussions**: [GitHub Discussions](https://github.com/qqqzhch/openclaw-desktop/discussions)
- **Email**: qqqzhch@gmail.com

## 致谢

- [Tauri](https://tauri.app/) - 桌面应用框架
- [React](https://react.dev/) - 前端框架
- [Material-UI](https://mui.com/) - UI 组件库
- [Rust](https://www.rust-lang.org/) - 后端语言

---

**构建时间**: 2026-03-08  
**状态**: 后端集成完成 ✅ | 准备构建测试 🚀
