// commands.rs - Tauri IPC 命令定义（简化版）

use tauri::{State, Emitter};
use serde_json::json;
use std::sync::Arc;

// 进程管理命令

#[tauri::command]
pub async fn start_openclaw<'a>(state: State<'a, Arc<OpenCluxManager>>) -> Result<String, String> {
    state.start().await
}

#[tauri::command]
pub async fn stop_openclaw<'a>(state: State<'a, Arc<OpenCluxManager>>) -> Result<String, String> {
    state.stop().await
}

#[tauri::command]
pub async fn get_openclaw_status<'a>(state: State<'a, Arc<OpenCluxManager>>) -> ProcessInfo {
    state.get_status().await
}

// 日志命令

#[tauri::command]
pub fn get_openclaw_logs<'a>(state: State<'a, Arc<OpenCluxManager>>, lines: Option<usize>) -> Vec<String> {
    state.get_logs(lines)
}

// 消息命令

#[tauri::command]
pub async fn send_openclaw_message<'a>(
    state: State<'a, Arc<OpenCluxManager>>, 
    message: String
) -> Result<(), String> {
    state.send_message(&message).await
}

#[tauri::command]
pub fn get_message_history<'a>(
    state: State<'a, Arc<OpenCluxManager>>,
    limit: Option<usize>
) -> Vec<Message> {
    state.get_messages(limit)
}

// 配置命令

#[tauri::command]
pub fn get_config<'a>(state: State<'a, Arc<OpenCluxManager>>) -> Config {
    state.get_config()
}

#[tauri::command]
pub fn update_config<'a>(
    state: State<'a, Arc<OpenCluxManager>>,
    config: Config
) -> Result<(), String> {
    state.update_config(config)
}

// 系统信息命令

#[tauri::command]
pub fn get_system_info<'a>(state: State<'a, Arc<OpenCluxManager>>) -> SystemInfo {
    state.get_system_info()
}

// 版本信息

#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// 应用信息

#[tauri::command]
pub fn get_app_info() -> serde_json::Value {
    json!({
        "name": env!("CARGOser_PKG_NAME"),
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS
    })
}
