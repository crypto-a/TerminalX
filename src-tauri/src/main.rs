#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::Command;
use tauri::Manager;

/// A Tauri command that runs a local shell command and returns the combined stdout+stderr.
#[tauri::command]
fn run_local_command(command: String) -> Result<String, String> {
    // Example cross-platform approach:
    // Windows: use `cmd /C <command>`
    // Unix: use `sh -c <command>`
    #[cfg(target_os = "windows")]
    let output = Command::new("cmd")
        .args(["/C", &command])
        .output()
        .map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("sh")
        .arg("-c")
        .arg(&command)
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let combined_output = format!("{}{}", stdout, stderr);

    Ok(combined_output)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            run_local_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
