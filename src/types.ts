// 类型定义

export interface Log {
  timestamp: string;
  level: string;
  message: string;
}

export interface Message {
  id: string;
  timestamp: string;
  content: string;
  message_type: string;
}

export type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface OpenClawStatus {
  pid: number;
  running: boolean;
  start_time: string;
  memory_mb: number;
  cpu_usage: number;
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
  process_count: number;
}

export interface OpenClawState {
  logs: Log[];
  messages: Message[];
  config: Config;
  status: OpenClawStatus;
  systemInfo: SystemInfo;
}

export type OpenClawStateKey = keyof OpenClawState;

interface SetState {
  (partial: Partial<OpenClawState>): void;
}

interface GetState {
  <T extends OpenClawStateKey>(key: T): OpenClawState[T];
}

interface Store {
  setState: SetState;
  getState: GetState;
  subscribe: (listener: (state: OpenClawState) => void) => () => void;
}
