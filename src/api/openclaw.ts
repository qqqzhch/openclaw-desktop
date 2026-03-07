import { invoke } from '@tauri-apps/api/core';

// 类型定义
export interface OpenClawStatus {
  running: boolean;
  pid?: number;
  port?: number;
  uptime?: number;
  message_count?: number;
  memory_usage?: number;
  last_error?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
}

export interface AppConfig {
  // 示例配置结构，根据实际 OpenClaw 配置调整
  [key: string]: any;
}

export interface Message {
  id: string;
  timestamp: string;
  channel: string;
  content: string;
  author?: string;
}

export interface VersionInfo {
  version: string;
  build_date?: string;
  git_commit?: string;
}

export interface SystemInfo {
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  uptime?: number;
}

// API 错误
export class OpenClawError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'OpenClawError';
  }
}

/**
 * OpenClaw API 封装
 * 所有与 Rust 后端的交互都通过这个模块
 */
export const openclawApi = {
  /**
   * 获取 OpenClaw 当前状态
   */
  async getStatus(): Promise<OpenClawStatus> {
    try {
      const status = await invoke<OpenClawStatus>('get_status');
      return status;
    } catch (error) {
      console.error('Failed to get status:', error);
      throw new OpenClawError('Failed to get OpenClaw status', 'GET_STATUS_ERROR');
    }
  },

  /**
   * 启动 OpenClaw
   */
  async start(): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await invoke<{ success: boolean; message?: string }>('start_openclaw');
      return result;
    } catch (error) {
      console.error('Failed to start OpenClaw:', error);
      throw new OpenClawError('Failed to start OpenClaw', 'START_ERROR');
    }
  },

  /**
   * 停止 OpenClaw
   */
  async stop(): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await invoke<{ success: boolean; message?: string }>('stop_openclaw');
      return result;
    } catch (error) {
      console.error('Failed to stop OpenClaw:', error);
      throw new OpenClawError('Failed to stop OpenClaw', 'STOP_ERROR');
    }
  },

  /**
   * 获取日志
   * @param limit 日志条数限制
   * @param level 日志级别过滤（可选）
   */
  async getLogs(limit?: number, level?: string): Promise<LogEntry[]> {
    try {
      const logs = await invoke<LogEntry[]>('get_logs', { limit, level });
      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      throw new OpenClawError('Failed to get logs', 'GET_LOGS_ERROR');
    }
  },

  /**
   * 发送消息
   * @param channel 频道
   * @param message 消息内容
   */
  async sendMessage(channel: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const result = await invoke<{ success: boolean; messageId?: string }>('send_message', { channel, message });
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new OpenClawError('Failed to send message', 'SEND_MESSAGE_ERROR');
    }
  },

  /**
   * 获取消息列表
   * @param channel 频道（可选）
   * @param limit 消息条数限制
   */
  async getMessages(channel?: string, limit?: number): Promise<Message[]> {
    try {
      const messages = await invoke<Message[]>('get_messages', { channel, limit });
      return messages;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new OpenClawError('Failed to get messages', 'GET_MESSAGES_ERROR');
    }
  },

  /**
   * 获取配置
   */
  async getConfig(): Promise<AppConfig> {
    try {
      const config = await invoke<AppConfig>('get_config');
      return config;
    } catch (error) {
      console.error('Failed to get config:', error);
      throw new OpenClawError('Failed to get config', 'GET_CONFIG_ERROR');
    }
  },

  /**
   * 保存配置
   * @param config 配置对象
   */
  async saveConfig(config: AppConfig): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await invoke<{ success: boolean; message?: string }>('save_config', { config });
      return result;
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new OpenClawError('Failed to save config', 'SAVE_CONFIG_ERROR');
    }
  },

  /**
   * 获取版本信息
   */
  async getVersion(): Promise<VersionInfo> {
    try {
      const version = await invoke<VersionInfo>('get_version');
      return version;
    } catch (error) {
      console.error('Failed to get version:', error);
      throw new OpenClawError('Failed to get version info', 'GET_VERSION_ERROR');
    }
  },

  /**
   * 获取系统信息
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const info = await invoke<SystemInfo>('get_system_info');
      return info;
    } catch (error) {
      console.error('Failed to get system info:', error);
      throw new OpenClawError('Failed to get system info', 'GET_SYSTEM_INFO_ERROR');
    }
  }
};

// 导出默认实例
export default openclawApi;
