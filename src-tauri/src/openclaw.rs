# openclaw.rs - OpenClaw 核心引擎集成（简化版）

use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Local};

// OpenClaw 进程状态
#[derive(Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub running: bool,
    pub start_time: String,
    pub memory_mb: f64,
    pub cpu_usage: f64,
}

// 消息记录
#[derive(Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub timestamp: String,
    pub content: String,
    pub message_type: String, // "user" or "system"
}

// 配置
#[derive(Clone, Serialize, Deserialize)]
pub struct Config {
    pub auto_start: bool,
    pub log_level: String,
    pub max_log_lines: usize,
    pub max_messages: usize,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            auto_start: false,
            log_level: "INFO".to_string(),
            max_log_lines: 1000,
            max_messages: 500,
        }
    }
}

// OpenClaw 状态管理
pub struct OpenClawManager {
    process: Arc<Mutex<Option<std::process::Child>>>,
    process_info: Arc<Mutex<ProcessInfo>>,
    log_path: PathBuf,
    messages: Arc<Mutex<Vec<Message>>>,
    config: Arc<Mutex<Config>>,
}

// 系统信息
#[derive(Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub cpu_usage: f32,
    pub total_memory_mb: f64,
    pub used_memory_mb: f64,
    pub process_count: usize,
}

impl OpenClawManager {
    pub fn new() -> Self {
        // 获取应用数据目录
        let home_dir = std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".to_string());
        
        let data_dir = PathBuf::from(home_dir).join(".openclaw");
        let log_path = data_dir.join("openclaw-desktop.log");
        
        // 确保目录存在
        std::fs::create_dir_all(&data_dir).ok();

        Self {
            process: Arc::new(Mutex::new(None)),
            process_info: Arc::new(Mutex::new(ProcessInfo {
                pid: 0,
                running: false,
                start_time: "1970-01-01 00:00".to_string(),
                memory_mb: 0.0,
                cpu_usage: 0.0,
            })),
            log_path,
            messages: Arc::new(Mutex::new(Vec::new())),
            config: Arc::new(Mutex::new(Config::default())),
        }
    }

    // 启动 OpenClaw 进程（简化版）
    pub async fn start(&self) -> Result<String, String> {
        // 检查是否已运行
        {
            let info = self.process_info.lock().unwrap();
            if info.running {
                return Err("OpenClaw 已经在运行".to_string());
            }
        }

        // 模拟启动
        self.log("[INFO] 模拟启动 OpenClaw 进程");
        
        // 更新进程信息
        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        {
            let mut info = self.process_info.lock().unwrap();
            info.pid = 12345u32;
            info.running = true;
            info.start_time = now.clone();
        }

        self.log("[INFO] OpenClaw 已启动（模拟模式）");

        Ok("OpenClaw 已启动（模拟模式）".to_string())
    }

    // 停止 OpenClaw 进程（简化版）
    pub async fn stop(&self) -> Result<String, String> {
        {
            let mut info = self.process_info.lock().unwrap();
            if !info.running {
                return Err("OpenClaw 未运行".to_string());
            }
        }

        // 模拟停止
        info.running = false;
        info.cpu_usage = 0.0;

        self.log("[INFO] OpenClaw 已停止（模拟模式）");

        Ok("OpenClaw 已停止（模拟模式）".to_string())
    }

    // 获取进程状态
    pub async fn get_status(&self) -> ProcessInfo {
        self.process_info.lock().unwrap().clone()
    }

    // 获取日志
    pub fn get_logs(&self, lines: Option<usize>) -> Vec<String> {
        if let Ok(content) = std::fs::read_to_string(&self.log_path) {
            let all_lines: Vec<&str> = content.lines().collect();
            let limit = lines.unwrap_or(1000);
            
            if all_lines.len() > limit {
                all_lines[all_lines.len() - limit..].iter().map(|s| s.to_string()).collect()
            } else {
                all_lines.iter().map(|s| s.to_string()).collect()
            }
        } else {
            vec![]
        }
    }

    // 发送消息
    pub async fn send_message(&self, message: &str) {
        self.add_message(message, "user");
        self.log(&format!("[MSG] {}", message));
    }

    // 获取消息历史
    pub fn get_messages(&self, limit: Option<usize>) -> Vec<Message> {
        let msgs = self.messages.lock().unwrap();
        let limit = limit.unwrap_or(100);
        
        if msgs.len() > limit {
            msgs[msgs.len() - limit..].clone()
        } else {
            msgs.clone()
        }
    }

    // 更新配置
    pub fn update_config(&self, new_config: Config) -> Result<(), String> {
        *self.config.lock().unwrap() = new_config.clone();
        self.save_config()?;
        self.log("[CONFIG] 配置已更新");
        Ok(())
    }

    // 获取配置
    pub fn get_config(&self) -> Config {
        self.config.lock().unwrap().clone()
    }

    // 获取系统信息（简化版）
    pub fn get_system_info(&self) -> SystemInfo {
        SystemInfo {
            cpu_usage: 0.0,
            total_memory_mb: 0.0,
            used_memory_mb: 0.0,
            process_count: 0,
        }
    }

    // 内部方法：记录日志
    fn log(&self, message: &str) {
        use std::fs::OpenOptions;
        use std::io::Write;

        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
        let log_line = format!("[{}] {}", timestamp, message);

        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_path)
        {
            let _ = writeln!(file, "{}", log_line);
        }
    }

    // 内部方法：添加消息
    fn add_message(&self, content: &str, message_type: &str) {
        let mut msgs = self.messages.lock().unwrap();
        let config = self.config.lock().unwrap();

        let msg = Message {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
            content: content.to_string(),
            message_type: message_type.to_string(),
        };

        msgs.push(msg);

        // 限制消息数量
        if msgs.len() > config.max_messages {
            msgs.remove(0);
        }
    }

    // 保存配置到文件
    fn save_config(&self) -> Result<(), String> {
        let config = self.config.lock().unwrap();
        let config_path = self.log_path.parent()
            .unwrap()
            .join("config.json");

        let json = serde_json::to_string_pretty(&config)
            .map_err(|e| e.to_string())?;

        std::fs::write(&config_path, json)
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    // 加载配置
    fn load_config(&self) {
        let config_path = self.log_path.parent()
            .unwrap()
            .join("config.json");

        if let Ok(content) = std::fs::read_to_string(&config_path) {
            if let Ok(config) = serde_json::from_str::<Config>(&content) {
                *self.config.lock().unwrap() = config;
            }
        }
    }
    }
}
