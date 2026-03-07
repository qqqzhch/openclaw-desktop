// lib.rs - OpenClaw Desktop 主入口

use std::sync::Arc;

mod openclaw;
mod commands;
mod tray;

use openclaw::OpenClawManager;
use crate::commands::*;

// 基础命令

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn get_app_info() -> serde_json::Value {
    serde_json::json!({
        "name": env!("CARGO_PKG_NAME"),
        "version": env!("CARGO_PKG_VERSION"),
        "description": env!("CARGO_PKG_DESCRIPTION"),
        "authors": env!("CARGO_PKG_AUTHORS"),
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化 OpenClaw 管理器
    let openclaw_manager = Arc::new(OpenClawManager::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(openclaw_manager)
        .invoke_handler(tauri::generate_handler![
            // 基础命令
            greet,
            get_version,
            get_app_info,
        ])
        .setup(|_app| {
            // 系统托盘暂时禁用（需要桌面环境测试）
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
