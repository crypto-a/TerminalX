use tauri::command;
use serde_json::json;
use std::process::Command;
use std::path::PathBuf;
use crate::local_terminal::state::CURRENT_DIR;
// use crate::state::CURRENT_DIR;


/// A helper function to extract anything after "/user/" in a given path.
/// If "/user/" is not found, the entire path is returned.
///
/// # Arguments
///
/// * `full_path` - The full path string, e.g., "/home/user/projects/myapp"
///
/// # Returns
///
/// A substring of `full_path` that starts immediately after "/user/".
/// If "/user/" is not found, returns the full path unmodified.
fn extract_after_user(full_path: &str) -> String {
    if let Some(idx) = full_path.find("/user/") {
        // Return everything starting at "/user/..." or possibly skipping the "/user/" if desired.
        // E.g., if full_path = "/home/user/projects/myapp", this returns "/user/projects/myapp"
        // or "projects/myapp" depending on your preference.
        full_path[idx..].to_string()
    } else {
        // If no "/user/" substring, just return the whole path
        full_path.to_string()
    }
}

/// Runs a local command in the current working directory (tracked by `CURRENT_DIR`).
///
/// This function handles:
/// - Special-case for `cd`
/// - If `exit()` is typed, we just send back a message (no real app exit by default)
/// - Returns a JSON-like string containing:
///   - combined stdout + stderr
///   - the "display path" (substring after `/user/`).
#[tauri::command]
pub fn run_local_command(command: String) -> Result<String, String> {
    // Trim the command input
    let command_line = command.trim();

    // Lock the global current_dir
    let mut current_dir = CURRENT_DIR.lock().unwrap();

    // If user typed `exit()`, we won't actually close Tauri but can respond:
    if command_line == "exit()" {
        let current_path = extract_after_user(&current_dir.display().to_string());
        // Return a JSON-like string with "output" + "cwd"
        let resp = serde_json::json!({
            "output": "Exiting? (Not actually closing the Tauri app)",
            "cwd": current_path
        });
        return Ok(resp.to_string());
    }

    // Split command into the first token + the rest as args
    let mut parts = command_line.split_whitespace();
    if let Some(cmd) = parts.next() {
        let args: Vec<&str> = parts.collect();

        // Handle `cd` as a special case
        if cmd == "cd" {
            if let Some(new_dir) = args.get(0) {
                let new_path = current_dir.join(new_dir);
                if new_path.is_dir() {
                    match new_path.canonicalize() {
                        Ok(resolved) => {
                            *current_dir = resolved;
                            // Return an empty output but updated path
                            let current_path = extract_after_user(&current_dir.display().to_string());
                            let resp = serde_json::json!({
                                "output": "",
                                "cwd": current_path
                            });
                            return Ok(resp.to_string());
                        }
                        Err(e) => {
                            let current_path = extract_after_user(&current_dir.display().to_string());
                            let resp = serde_json::json!({
                                "output": format!("cd error: {e}"),
                                "cwd": current_path
                            });
                            return Ok(resp.to_string());
                        }
                    }
                } else {
                    let current_path = extract_after_user(&current_dir.display().to_string());
                    let resp = serde_json::json!({
                        "output": format!("cd: no such directory: {}", new_dir),
                        "cwd": current_path
                    });
                    return Ok(resp.to_string());
                }
            } else {
                // cd with no argument
                let current_path = extract_after_user(&current_dir.display().to_string());
                let resp = serde_json::json!({
                    "output": "cd: missing argument",
                    "cwd": current_path
                });
                return Ok(resp.to_string());
            }
        }

        // Otherwise, run the command in the current directory
        let output = Command::new(cmd)
            .args(&args)
            .current_dir(&*current_dir)
            .output();

        let current_path = extract_after_user(&current_dir.display().to_string());
        match output {
            Ok(out) => {
                // Combine stdout + stderr into a single string
                let stdout = String::from_utf8_lossy(&out.stdout).to_string();
                let stderr = String::from_utf8_lossy(&out.stderr).to_string();
                let combined = format!("{}{}", stdout, stderr);

                // Return JSON
                let resp = serde_json::json!({
                    "output": combined,
                    "cwd": current_path
                });
                Ok(resp.to_string())
            }
            Err(e) => {
                let resp = serde_json::json!({
                    "output": format!("Failed to execute command: {}", e),
                    "cwd": current_path
                });
                Ok(resp.to_string())
            }
        }
    } else {
        // No command was parsed
        let current_path = extract_after_user(&current_dir.display().to_string());
        let resp = serde_json::json!({
            "output": "",
            "cwd": current_path
        });
        Ok(resp.to_string())
    }
}