import { create } from 'zustand';
import { openclawApi, OpenClawStatus, LogEntry, AppConfig, Message, VersionInfo, SystemInfo } from '../api/openclaw';

// 状态接口
interface AppState {
  // OpenClaw 状态
  status: OpenClawStatus | null;
  statusLoading: boolean;
  statusError: string | null;

  // 日志
  logs: LogEntry[];
  logsLoading: boolean;
  logsError: string | null;

  // 配置
  config: AppConfig | null;
  configLoading: boolean;
  configError: string | null;
  configDirty: boolean; // 配置是否已修改但未保存

  // 消息
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;

  // 版本信息
  version: VersionInfo | null;
  versionLoading: boolean;

  // 系统信息
  systemInfo: SystemInfo | null;
  systemInfoLoading: boolean;

  // 当前选中的标签页
  currentTab: number;

  // 日志过滤器
  logFilter: {
    level: string | null;
    keyword: string;
  };
}

// Action 接函数
interface AppActions {
  // 状态相关
  fetchStatus: () => Promise<void>;
  startOpenClaw: () => Promise<{ success: boolean; message?: string }>;
  stopOpenClaw: () => Promise<{ success: boolean; message?: string }>;

  // // 日志相关
  fetchLogs: (limit?: number) => Promise<void>;
  setLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;
  setLogFilter: (filter: { level: string | null; keyword: string }) => void;

  // 配置相关
  fetchConfig: () => Promise<void>;
  saveConfig: () => Promise<{ success: boolean; message?: string }>;
  updateConfig: (config: AppConfig) => void;

  // 消息相关
  fetchMessages: (channel?: string, limit?: number) => Promise<void>;
  addMessage: (message: Message) => void;

  // 版本信息
  fetchVersion: () => Promise<void>;

  // 系统信息
  fetchSystemInfo: () => Promise<void>;

  // 标签页
  setCurrentTab: (tab: number) => void;
}

// 创建 store
export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // 初始状态
  status: null,
  statusLoading: false,
  statusError: null,

  logs: [],
  logsLoading: false,
  logsError: null,

  config: null,
  configLoading: false,
  configError: null,
  configDirty: false,

  messages: [],
  messagesLoading: false,
  messagesError: null,

  version: null,
  versionLoading: false,

  systemInfo: null,
  systemInfoLoading: false,

  currentTab: 0,

  logFilter: {
    level: null,
    keyword: ''
  },

  // 状态相关
  fetchStatus: async () => {
    set({ statusLoading: true, statusError: null });
    try {
      const status = await openclawApi.getStatus();
      set({ status, statusLoading: false });
    } catch (error) {
      set({
        statusError: error instanceof Error ? error.message : 'Failed to fetch status',
        statusLoading: false
      });
    }
  },

  startOpenClaw: async () => {
    try {
      const result = await openclawApi.start();
      if (result.success) {
        // 启动成功后，延迟获取状态
        setTimeout(() => get().fetchStatus(), 1000);
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  stopOpenClaw: async () => {
    try {
      const result = await openclawApi.stop();
      if (result.success) {
        // 停止成功后，延迟获取状态
        setTimeout(() => get().fetchStatus(), 1000);
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 日志相关
  fetchLogs: async (limit?: number) => {
    set({ logsLoading: true, logsError: null });
    try {
      const { logFilter } = get();
      const logs = await openclawApi.getLogs(limit, logFilter.level || undefined);

      // 如果有关键词过滤，在客户端过滤
      let filteredLogs = logs;
      if (logFilter.keyword) {
        const keyword = logFilter.keyword.toLowerCase();
        filteredLogs = logs.filter(log =>
          log.message.toLowerCase().includes(keyword)
        );
      }

      set({ logs: filteredLogs, logsLoading: false });
    } catch (error) {
      set({
        logsError: error instanceof Error ? error.message : 'Failed to fetch logs',
        logsLoading: false
      });
    }
  },

  setLogs: (logs: LogEntry[]) => {
    set({ logs });
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setLogFilter: (filter) => {
    set({ logFilter: filter });
    // 重新获取日志
    get().fetchLogs();
  },

  // 配置相关
  fetchConfig: async () => {
    set({ configLoading: true, configError: null });
    try {
      const config = await openclawApi.getConfig();
      set({ config, configLoading: false, configDirty: false });
    } catch (error) {
      set({
        configError: error instanceof Error ? error.message : 'Failed to fetch config',
        configLoading: false
      });
    }
  },

  saveConfig: async () => {
    const { config } = get();
    if (!config) {
      return { success: false, message: 'No config to save' };
    }

    try {
      const result = await openclawApi.saveConfig(config);
      if (result.success) {
        set({ configDirty: false });
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  updateConfig: (config: AppConfig) => {
    set({ config, configDirty: true });
  },

  // 消息相关
  fetchMessages: async (channel?: string, limit?: number) => {
    set({ messagesLoading: true, messagesError: null });
    try {
      const messages = await openclawApi.getMessages(channel, limit);
      set({ messages, messagesLoading: false });
    } catch (error) {
      set({
        messagesError: error instanceof Error ? error.message : 'Failed to fetch messages',
        messagesLoading: false
      });
    }
  },

  addMessage: (message: Message) => {
    set(state => ({
      messages: [message, ...state.messages]
    }));
  },

  // 版本信息
  fetchVersion: async () => {
    set({ versionLoading: true });
    try {
      const version = await openclawApi.getVersion();
      set({ version, versionLoading: false });
    } catch (error) {
      console.error('Failed to fetch version:', error);
      set({ versionLoading: false });
    }
  },

  // 系统信息
  fetchSystemInfo: async () => {
    set({ systemInfoLoading: true });
    try {
      const info = await openclawApi.getSystemInfo();
      set({ systemInfo: info, systemInfoLoading: false });
    } catch (error) {
      console.error('Failed to fetch system info:', error);
      set({ systemInfoLoading: false });
    }
  },

  // 标签页
  setCurrentTab: (tab: number) => {
    set({ currentTab: tab });
  }
}));

export default useAppStore;
