import { create } from 'zustand';
import type { StateCreator } from 'zustand';

import { 
  OpenClawState,
  OpenClawStateKey,
  SetState,
  GetState
} from '../types';

const initialState: OpenClawState = {
  logs: [],
  messages: [],
  config: {
    auto_start: false,
    log_level: 'INFO',
    max_log_lines: 1000,
    max_messages: 500,
  },
  status: {
    pid: 0,
    running: false,
    start_time: '1970-01-01 00:00',
    memory_mb: 0.0,
    cpu_usage: 0.0,
  },
  systemInfo: {
    cpu_usage: 0.0,
    total_memory_mb: 0.0,
    used_memory_mb: 0.0,
    process_count: 0,
  },
};

const useOpenClawStore = create<OpenClawState>((set: SetState, get: GetState) => ({
  logs: get().logs,
  messages: get().messages,
  config: get().config,
  status: get().status,
  systemInfo: get().systemInfo,

  // Logs actions
  addLog: (log: any) => set((state: OpenClawState) => ({ 
    logs: [...state.logs, log].slice(-state.config.max_log_lines) 
  })),
  clearLogs: () => set({ logs: [] }),

  // Messages actions
  addMessage: (message: any) => set((state: OpenClawState) => ({ 
    messages: [...state.messages, message].slice(-state.config.max_messages) 
  })),
  clearMessages: () => set({ messages: [] }),

  // Config actions
  updateConfig: (config: any) => set({ config }),

  // Status actions
  updateStatus: (status: any) => set({ status: { ...get().status, ...status }}),

  // System info actions
  updateSystemInfo: (info: any) => set({ systemInfo: { ...get().systemInfo, ...info } }),

  // Filter logs
  filterLogs: (keyword?: string, level?: string) => {
    const state = get();
    return state.logs.filter((log: any) => {
      const matchesLevel = !level || level === 'ALL' || log.level === level;
      const matchesKeyword = !keyword || log.message.toLowerCase().includes(keyword.toLowerCase());
      return matchesLevel && matchesKeyword;
    });
  },

  // Filter messages
  filterMessages: (keyword?: string) => {
    const state = get();
    return state.messages.filter((msg: any) => {
      return !keyword || msg.content.toLowerCase().includes(keyword.toLowerCase());
    });
  },
}));

export type OpenClawStore = ReturnType<typeof useOpenClawStore>;
export const { useOpenClawStore: useOpenClawStoreType } = useOpenClawStore;
