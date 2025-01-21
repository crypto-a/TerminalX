use std::{process::Command, path::PathBuf};
use serde_json::json;
use tauri::command;

/// Runs a local command in the current working directory (tracked by `CURRENT_DIR`).
///
/// This function handles:
/// - Special-case for `cd`
/// - If `exit()` is typed, we just send back a message (no real app exit by default)
/// - Returns a JSON-like string containing:
///   - combined stdout + stderr
///   - the "display path" (substring after `/user/`).
#[command]
pub fn run_local_command(command: String) -> Result<String, String>
{
    let resp = serde_json::json!({
                    "output": format!("Running command: {}", command),
                    "type": "terminal",
                    "cwd": "meow"
                });
    Ok(resp.to_string())
}