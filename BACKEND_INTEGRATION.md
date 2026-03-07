# OpenClaw Desktop - 后端集成文档

## 概述

本文档描述 OpenClaw Desktop 的 Rust 后端实现，包括进程管理、日志系统、消息传递和系统监控功能。

## 技术栈

- **Rust**: 后端编程语言
- **Tauri**: 桌面应用框架
- **Tokio**: 异步运行时
- **Serde**: JSON 序列化/反序列化
- **Sysinfo**: 系统信息获取
- **Notify**: 文件系统监控
- **Chrono**: 日期时间处理
- **UUID**: 唯一标识符生成

## 核心模块

### 1. `openclaw.rs` - OpenClaw 核心管理

#### `OpenClawManager`

主管理器，负责：
- 进程生命周期管理（启动/停止）
- 日志记录和监控
- 消息历史管理
- 配置持久化
- 系统信息获取

**主要方法：**

```rust
pub async fn start(&self) -> Result<String, String>
```
启动 OpenClaw 进程。尝试调用 `openclaw daemon` 命令，如果命令不存在则进入模拟模式。

**返回值：**
- 成功：`Ok("OpenClaw 已启动 (PID: {pid})")`
- 失败：`Err("OpenClaw 已经在运行")`

```rust
pub async fn stop(&self) -> Result<String, String>
```
停止 OpenClaw 进程。发送 SIGTERM 信号并等待进程退出。

```rust
pub async fn get_status(&self) -> ProcessInfo
```
`ProcessInfo` 结构：
```rust
pub struct ProcessInfo {
    pub pid: u32,
    pub running: bool,
    pub start_time: String,
    pub memory_mb: f64,
    pub cpu_usage: f64,
}
```

#### 日志系统

```rust
pub fn get_logs(&self, lines: Option<usize>) -> Vec<String>
```
读取日志文件的最后 N 行。

**日志格式：**
```
[2026-03-08 13:07:45.123] [LEVEL] Message
```

**日志位置：**
- Linux/macOS: `~/.openclaw/openclaw-desktop.log`
- Windows: `%USERPROFILE%\.openclaw\openclaw-desktop.log`

**日志轮转：**
当日志文件超过 10MB 时自动轮转，旧文件重命名为 `.log.old`。

#### 消息系统

```rust
pub async fn send_message(&self, message: &str) -> Result<(), String>
```
发送消息到 OpenClaw。目前记录到日志，未来将通过 IPC 或 socket 发送。

```rust
pub fn get_messages(&self, limit: Option<usize>) -> Vec<Message>
```

`Message` 结构：
```rust
pub struct Message {
    pub id: String,           // UUID v4
    pub timestamp: String,    // ISO 8601 格式
    pub content: String,
    pub message_type: String, // "user" 或 "system"
}
```

消息默认最多保留 500 条（可配置）。

#### 配置系统

```rust
pub fn get_config(&self) -> Config
pub fn update_config(&self, new_config: Config) -> Result<(), String>
```

`Config` 结构：
```rust
pub struct Config {
    pub auto_start: bool,
    pub log_level: String,
    pub max_log_lines: usize,
    pub max_messages: usize,
}
```

配置保存位置：`~/.openclaw/config.json`

#### 系统信息

```rust
pub fn get_system_info(&self) -> SystemInfo
```

`SystemInfo` 结构：
```rust
pub struct SystemInfo {
    pub cpu_usage: f32,
    pub total_memory_mb: f64,
    pub used_memory_mb: f64,
    pub total_disk_gb: f64,
    pub used_disk_gb: f64,
    pub process_count: usize,
}
```

### 2. `commands.rs` - Tauri IPC 命令

定义所有前端可调用的后端命令。

#### 进程管理命令

```rust
#[tauri::command]
pub async fn start_openclaw(state: State<Arc<OpenClawManager>>) -> Result<String, String>

#[tauri::command]
pub async fn stop_openclaw(state: State<Arc<OpenClawManager>>) -> Result<String, String>

#[tauri::command]
pub async fn get_openclaw_status(state: State<Arc<OpenClawManager>>) -> ProcessInfo
```

#### 日志命令

```rust
#[tauri::command]
pub fn get_openclaw_logs(
    state: State<Arc<OpenClawManager>>,
    lines: Option<usize>
) -> Vec<String>
```

#### 消息命令

```rust
#[tauri::command]
pub async fn send_openclaw_message(
    state: State<Arc<OpenClawManager>>,
    message: String
) -> Result<(), String>

#[tauri::command]
pub fn get_message_history(
    state: State<Arc<OpenClawManager>>,
    limit: Option<usize>
) -> Vec<Message>
```

#### 配置命令

```rust
#[tauri::command]
pub fn get_config(state: State<Arc<OpenClawManager>>) -> Config

#[tauri::command]
pub fn update_config(
    state: State<Arc<OpenClawManager>>,
    config: Config
) -> Result<(), String>
```

#### 系统信息命令

```rust
#[tauri::command]
pub fn get_system_info(state: State<Arc<OpenClawManager>>) -> SystemInfo
```

#### 应用信息命令

```rust
#[tauri::command]
pub fn get_version() -> String

#[tauri::command]
pub fn get_app_info() -> serde_json::Value
```

**`get_app_info()` 返回：**
```json
{
  "name": "openclaw-desktop",
  "version": "0.2.0",
  "description": "...",
  "authors": "...",
  "platform": "linux",
  "arch": "x86_64"
}
```

### 3. `tray.rs` - 系统托盘

实现系统托盘图标和右键菜单。

**菜单项：**
- 显示
- 隐藏
- 启动 OpenClaw
- 停止 OpenClaw
- 退出

**交互：**
- 左键点击：显示/隐藏主窗口
- 右键点击：显示菜单

### 4. `lib.rs` - 应用入口

初始化并运行 Tauri 应用。

**注册的命令：**
- greet
- get_version
- get_app_info
- start_openclaw
- stop_openclaw
- get_openclaw_status
- get_openclaw_logs
- send_openclaw_message
- get_message_history
- get_config
- update_config
- get_system_info

## 前端集成

### API 层

前端通过 `invoke()` 函数调用后端命令：

```typescript
import { invoke } from '@tauri-apps/api/core';

// 启动 OpenClaw
await invoke('start_openclaw');

// 获取状态
const status = await invoke<ProcessInfo>('get_openclaw_status');

// 发送消息
await invoke('send_openclaw_message', { message: 'Hello' });

// 获取系统信息
const sysInfo = await invoke<SystemInfo>('get_system_info');
```

### 类型定义

前端应定义对应的 TypeScript 类型：

```typescript
export interface ProcessInfo {
  pid: number;
  running: boolean;
  start_time: string;
  memory_mb: number;
  cpu_usage: number;
}

export interface Message {
  id: string;
  timestamp: string;
  content: string;
  message_type: string;
}

export interface Config {
  auto_start: boolean;
  log_level: string;
  max_log_lines: number;
  max_messages: number;
}

export interface SystemInfo {
  cpu_usage: number;
  total_memory_mb: number;
  used_memory_mb: number;
  total_disk_gb: number;
  used_disk_gb: number;
  process_count: number;
}
```

## 错误处理

所有可能失败的命令返回 `Result<T, String>`。

**前端错误处理：**

```typescript
try {
  await invoke('start_openclaw');
} catch (error) {
  console.error('启动失败:', error);
  // 显示错误提示
}
```

## 日志级别

支持的日志级别：
- **INFO**: 一般信息
- **WARN**: 警告
- **ERROR**: 错误
- **DEBUG**: 调试信息

## 模拟模式

当 `openclaw` 命令不存在时，应用进入模拟模式：
- 进程 ID：12345
- 进程状态：正常运行
- 所有操作记录到日志
- 消息发送记录到日志

## 部署要求

### 编译时依赖

- Rust 1.70+
- Cargo

### 运行时依赖

- 无（静态链接）
- OpenClaw（可选，用于真实进程管理）

### 编译命令

```bash
# 开发模式
cd src-tauri
cargo build

# 发布模式
cargo build --release

# 使用 Tauri CLI
npm run tauri build
```

## 性能考虑

1. **系统信息刷新**: 避免高频调用，建议 3-5 秒一次
2. **日志读取**: 使用 tail 机制，避免读取大文件
3. **消息历史**: 限制数量（默认 500），防止内存增长
4. **异步操作**: 所有耗时操作使用 async/await

## 安全考虑

1. **命令注入**: 所有命令参数经过验证
2. **文件权限**: 配置和日志文件保存在用户目录
3. **进程隔离**: OpenClaw 进程独立运行，不影响应用稳定性

## 未来改进

### 短期

1. 实现 OpenClaw IPC 通信（Unix Socket/HTTP）
2. 实现 WebSocket 日志流
3. 添加进程崩溃自动重启
4. 完善错误日志和堆栈跟踪

### 中期

1. 实现插件系统
2. 添加性能监控
3. 实现远程日志查看
4. 添加性能分析工具

### 长期

1. 实现分布式管理
2. 添加集群支持
3. 实现配置同步
4. 添加监控告警

## 调试

### 启用调试日志

在 `Cargo.toml` 中添加：

```toml
[profile.dev]
debug = true
```

### 查看日志

```bash
# Linux/macOS
tail -f ~/.openclaw/openclaw-desktop.log

# Windows
type %USERPROFILE%\.openclaw\openclaw-desktop.log
```

### GDB 调试

```bash
gdb target/release/openclaw-desktop
```

## 测试

### 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_start_stop() {
        let manager = OpenClawManager::new();
        assert!(manager.start().await.is_ok());
        assert!(manager.stop().await.is_ok());
    }
}
```

### 集成测试

```bash
cargo test
```

## 贡献指南

1. 遵循 Rust 代码风格
2. 添加文档注释
3. 编写单元测试
4. 更新本文档

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-08  
**维护者**: OpenClaw Team
