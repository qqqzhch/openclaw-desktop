# OpenClaw Desktop - API 使用说明

## 概述

本文档说明如何在 OpenClaw Desktop 的前端中使用 Tauri IPC 调用与后端通信。

## 基础使用

### 导入 Tauri API

```typescript
import { invoke } from '@tauri-apps/api/core';
```

### 类型定义

将这些类型定义保存到 `src/types/api.ts`：

```typescript
// 进程信息
export interface ProcessInfo {
  pid: number;
  running: boolean;
  start_time: string;
  memory_mb: number;
  cpu_usage: number;
}

// 消息
export interface Message {
  id: string;
  timestamp: string;
  content: string;
  message_type: 'user' | 'system';
}

// 配置
export interface Config {
  auto_start: boolean;
  log_level: string;
  max_log_lines: number;
  max_messages: number;
}

// 系统信息
export interface SystemInfo {
  cpu_usage: number;
  total_memory_mb: number;
  used_memory_mb: number;
  total_disk_gb: number;
  used_disk_gb: number;
  process_count: number;
}

// 应用信息
export interface AppInfo {
  name: string;
  version: string;
  description: string;
  authors: string;
  platform: string;
  arch: string;
}
```

## API 函数

### 1. 应用信息

#### 获取版本

```typescript
import { invoke } from '@tauri-apps/api/core';

export async function getVersion(): Promise<string> {
  return await invoke<string>('get_version');
}

// 使用
const version = await getVersion();
console.log('版本:', version); // "0.2.0"
```

#### 获取应用信息

```typescript
export async function getAppInfo(): Promise<AppInfo> {
  return await invoke<AppInfo>('get_app_info');
}

// 使用
const appInfo = await getAppInfo();
console.log('应用名称:', appInfo.name);
console.log('平台:', appInfo.platform);
console.log('架构:', appInfo.arch);
```

### 2. 进程管理

#### 启动 OpenClaw

```typescript
export async function startOpenClaw(): Promise<string> {
  return await invoke<string>('start_openclaw');
}

// 使用
try {
  const result = await startOpenClaw();
  console.log(result); // "OpenClaw 已启动 (PID: 12345)"
  toast.success('OpenClaw 启动成功');
} catch (error) {
  console.error('启动失败:', error);
  toast.error(`启动失败: ${error}`);
}
```

#### 停止 OpenClaw

```typescript
export async function stopOpenClaw(): Promise<string> {
  return await invoke<string>('stop_openclaw');
}

// 使用
try {
  const result = await stopOpenClaw();
  console.log(result); // "OpenClaw 已停止"
  toast.success('OpenClaw 已停止');
} catch (error) {
  toast.error(`停止失败: ${error}`);
}
```

#### 获取进程状态

```typescript
export async function getOpenClawStatus(): Promise<ProcessInfo> {
  return await invoke<ProcessInfo>('get_openclaw_status');
}

// 使用
const status = await getOpenClawStatus();
console.log('运行状态:', status.running);
console.log('PID:', status.pid);
console.log('内存占用:', status.memory_mb.toFixed(2), 'MB');
console.log('CPU 使用率:', status.cpu_usage.toFixed(1), '%');
```

**定期刷新状态：**

```typescript
import { useEffect, useState } from 'react';

function StatusMonitor() {
  const [status, setStatus] = useState<ProcessInfo | null>(null);

  useEffect(() => {
    // 立即获取一次
    refreshStatus();

    // 每 3 秒刷新
    const interval = setInterval(refreshStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  async function refreshStatus() {
    try {
      const s = await getOpenClawStatus();
      setStatus(s);
    } catch (error) {
      console.error('获取状态失败:', error);
    }
  }

  return (
    <div>
      {status ? (
        <p>
          状态: {status.running ? '运行中' : '已停止'}
          {status.running && ` (PID: ${status.pid})`}
        </p>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  );
}
```

### 3. 日志

#### 获取日志

```typescript
export async function getOpenClawLogs(lines: number = 100): Promise<string[]> {
  return await invoke<string[]>('get_openclaw_logs', { lines });
}

// 使用
const logs = await getOpenClawLogs(100);
logs.forEach(line => console.log(line));
```

**实时日志组件：**

```typescript
function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLogs = async () => {
    setLoading(true);
    try {
      const newLogs = await getOpenClawLogs(200);
      setLogs(newLogs);
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 3000); // 每 3 秒刷新
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {loading && <CircularProgress />}
      <List>
        {logs.map((log, index) => (
          <ListItem key={index}>
            <ListItemText primary={log} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

**日志过滤：**

```typescript
function filterLogsByLevel(logs: string[], level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG') {
  return logs.filter(log => log.includes(`[${level}]`));
}

function filterLogsByKeyword(logs: string[], keyword: string) {
  return logs.filter(log => log.toLowerCase().includes(keyword.toLowerCase()));
}

// 使用
const errorLogs = filterLogsByLevel(allLogs, 'ERROR');
const searchLogs = filterLogsByKeyword(allLogs, 'startup');
```

### 4. 消息

#### 发送消息

```typescript
export async function sendOpenClawMessage(message: string): Promise<void> {
  return await invoke<void>('send_openclaw_message', { message });
}

// 使用
try {
  await sendOpenClawMessage('Hello from Desktop!');
  toast.success('消息发送成功');
} catch (error) {
  toast.error(`发送失败: ${error}`);
}
```

#### 获取消息历史

```typescript
export async function getMessageHistory(limit: number = 100): Promise<Message[]> {
  return await invoke<Message[]>('get_message_history', { limit });
}

// 使用
const messages = await getMessageHistory(50);
messages.forEach(msg => {
  console.log(`[${msg.timestamp}] ${msg.message_type}: ${msg.content}`);
});
```

**消息列表组件：**

```typescript
function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessageHistory(50);
      setMessages(msgs);
    };
    
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // 每 5 秒刷新
    return () => clearInterval(interval);
  }, []);

  return (
    <List>
      {messages.map(msg => (
        <ListItem key={msg.id}>
          <ListItemText
            primary={msg.content}
            secondary={`${msg.timestamp} · ${msg.message_type}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
```

### 5. 配置

#### 获取配置

```typescript
export async function getConfig(): Promise<Config> {
  return await invoke<Config>('get_config');
}

// 使用
const config = await getConfig();
console.log('自动启动:', config.auto_start);
console.log('日志级别:', config.log_level);
```

#### 更新配置

```typescript
export async function updateConfig(config: Config): Promise<void> {
  return await invoke<void>('update_config', { config });
}

// 使用
try {
  await updateConfig({
    auto_start: true,
    log_level: 'DEBUG',
    max_log_lines: 2000,
    max_messages: 1000,
  });
  toast.success('配置已保存');
} catch (error) {
  toast.error(`保存失败: ${error}`);
}
```

**配置编辑器组件：**

```typescript
function ConfigEditor() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await getConfig();
      setConfig(cfg);
      setError(null);
    } catch (e) {
      setError(`加载配置失败: ${e}`);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      await updateConfig(config);
      toast.success('配置已保存');
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    }
  };

  if (!config) {
    return <p>加载中...</p>;
  }

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={config.auto_start}
            onChange={(e) => setConfig({ ...config, auto_start: e.target.checked })}
          />
        }
        label="自动启动"
      />
      
      <TextField
        label="日志级别"
        value={config.log_level}
        onChange={(e) => setConfig({ ...config, log_level: e.target.value })}
        select
      >
        <MenuItem value="INFO">INFO</MenuItem>
        <MenuItem value="DEBUG">DEBUG</MenuItem>
        <MenuItem value="WARN">WARN</MenuItem>
        <MenuItem value="ERROR">ERROR</MenuItem>
      </TextField>
      
      <Button onClick={saveConfig}>保存</Button>
    </Box>
  );
}
```

### 6. 系统信息

#### 获取系统信息

```typescript
export async function getSystemInfo(): Promise<SystemInfo> {
  return await invoke<SystemInfo>('get_system_info');
}

// 使用
const sysInfo = await getSystemInfo();
console.log('CPU 使用率:', sysInfo.cpu_usage.toFixed(1), '%');
console.log('内存使用:', `${sysInfo.used_memory_mb.toFixed(0)} / ${sysInfo.total_memory_mb.toFixed(0)} MB`);
console.log('磁盘使用:', `${sysInfo.used_disk_gb.toFixed(1)} / ${sysInfo.total_disk_gb.toFixed(1)} GB`);
```

**系统监控组件：**

```typescript
function SystemMonitor() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    const refresh = async () => {
      const info = await getSystemInfo();
      setSysInfo(info);
    };
    
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!sysInfo) return <p>加载中...</p>;

  const memoryUsage = (sysInfo.used_memory_mb / sysInfo.total_memory_mb) * 100;
  const diskUsage = (sysInfo.used_disk_gb / sysInfo.total_disk_gb) * 100;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography>CPU 使用率</Typography>
        <LinearProgress variant="determinate" value={sysInfo.cpu_usage} />
        <Typography variant="caption">{sysInfo.cpu_usage.toFixed(1)}%</Typography>
      </Box>
      
      <Box>
        <Typography>内存使用</Typography>
        <LinearProgress variant="determinate" value={memoryUsage} />
        <Typography variant="caption">
          {sysInfo.used_memory_mb.toFixed(0)} / {sysInfo.total_memory_mb.toFixed(0)} MB
        </Typography>
      </Box>
      
      <Box>
        <Typography>磁盘使用</Typography>
        <LinearProgress variant="determinate" value={diskUsage} />
        <Typography variant="caption">
          {sysInfo.used_disk_gb.toFixed(1)} / {sysInfo.total_disk_gb.toFixed(1)} GB
        </Typography>
      </Box>
    </Stack>
  );
}
```

## 错误处理

### 错误类型

所有 API 调用可能抛出错误，建议总是使用 try-catch：

```typescript
async function safeApiCall() {
  try {
    const result = await someApiFunction();
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: typeof error === 'string' ? error : String(error) 
    };
  }
}
```

### 错误提示组件

```typescript
import { Alert, Snackbar } from '@mui/material';

function ErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  return (
    <Snackbar
      open={error !== null}
      autoHideDuration={6000}
      onClose={() => setError(null)}
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Snackbar>
  );
}
```

## 性能优化

### 防抖

避免频繁调用 API：

```typescript
import { useEffect, useState, useCallback } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery) {
      searchLogs(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <TextField
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="搜索日志..."
    />
  );
}
```

### 取消请求

使用 AbortController 取消长时间运行的请求：

```typescript
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number = 5000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fn();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## 完整示例

### 完整的 OpenClaw 管理组件

```typescript
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';

interface ProcessInfo {
  pid: number;
  running: boolean;
  start_time: string;
  memory_mb: number;
  cpu_usage: number;
}

export function OpenClawManager() {
  const [status, setStatus] = useState<ProcessInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    try {
      const s = await invoke<ProcessInfo>('get_openclaw_status');
      setStatus(s);
      setError(null);
    } catch (e) {
      setError(`获取状态失败: ${e}`);
    }
  };

  const startOpenClaw = async () => {
    setLoading(true);
    try {
      await invoke<string>('start_openclaw');
     ');
      await refreshStatus();
    } catch (e) {
      setError(`启动失败: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const stopOpenClaw = async () => {
    setLoading(true);
    try {
      await invoke<string>('stop_openclaw');
      await refreshStatus();
    } catch (e) {
      setError(`停止失败: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        OpenClaw 管理器
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading && <CircularProgress />}
          
          {status && (
            <Box>
              <Typography variant="h6" gutterBottom>
                状态: {status.running ? '运行中' : '已停止'}
              </Typography>
              
              <Typography variant="body1">
                PID: {status.pid || 'N/A'}
              </Typography>
              
              <Typography variant="body1">
                启动时间: {status.start_time}
              </Typography>
              
              <Typography variant="body1">
                内存占用: {status.memory_mb.toFixed(2)} MB
              </Typography>
              
              <Typography variant="body1">
                CPU 使用率: {status.cpu_usage.toFixed(1)}%
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={startOpenClaw}
              disabled={loading || status?.running}
              fullWidth
            >
              启动
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={stopOpenClaw}
              disabled={loading || !status?.running}
              fullWidth
            >
              停止
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
```

## 调试

### 启用详细日志

```typescript
// 开发模式下添加调试日志
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[API Debug]', ...args);
  }
}
```

### 性能监控

```typescript
async function measureApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[API] ${name} took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[API] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

// 使用
const status = await measureApiCall('get_status', () => getOpenClawStatus());
```

## 最佳实践

1. **总是处理错误**: 使用 try-catch 包裹所有 API 调用
2. **避免频繁调用**: 使用防抖或节流控制调用频率
3. **显示加载状态**: 在 API 调用期间显示加载指示器
4. **提供用户反馈**: 成功或失败时显示提示
5. **使用类型定义**: 为所有 API 响应定义 TypeScript 类型
6. **缓存结果**: 对不常变化的数据进行缓存
7. **取消未完成的请求**: 组件卸载时取消未完成的请求

## 常见问题

### Q: API 调用报错 "command not found"

**A:** 确保命令已在 `lib.rs` 中正确注册：

```rust
.invoke_handler(tauri::generate_handler![
    your_command_name,
    // ...
])
```

### Q: 类型不匹配

**A:** 确保前端类型定义与后端 Rust 结构体一致：

```rust
// Rust
pub struct ProcessInfo {
    pub pid: u32,          // 注意：u32 对应 number
    pub running: bool,
    // ...
}
```

```typescript
// TypeScript
export interface ProcessInfo {
  pid: number;           // 对应 Rust u32
  running: boolean;
  // ...
}
```

### Q: 性能问题

**A:** 
1. 减少 API 调用频率
2. 使用分页加载
3. 缓存数据
4. 使用虚拟列表渲染大量数据

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-08
