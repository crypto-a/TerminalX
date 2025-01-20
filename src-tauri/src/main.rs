use std::{sync::Mutex, path::PathBuf};
use lazy_static::lazy_static;
use tauri::Manager;
use std::process::Command;

// Keep a single global working directory for the "local terminal":
lazy_static! {
    static ref CURRENT_DIR: Mutex<PathBuf> = Mutex::new(
        std::env::current_dir().expect("Failed to get current directory")
    );
}

#[tauri::command]
fn run_local_command(command: String) -> Result<String, String> {
    // Trim the command input
    let command_line = command.trim();

    // Lock the global current_dir
    let mut current_dir = CURRENT_DIR.lock().unwrap();

    // If user typed `exit()`, we won't actually close the Tauri app but we can respond if desired
    if command_line == "exit()" {
        // For example, just return a message
        return Ok("Exiting? Not in a browser-based terminal...".to_string());
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
                            return Ok("".into());
                        }
                        Err(e) => return Ok(format!("cd error: {e}")),
                    }
                } else {
                    return Ok(format!("cd: no such directory: {}", new_dir));
                }
            } else {
                return Ok("cd: missing argument".into());
            }
        }

        // Otherwise, run the command in the current directory
        let output = Command::new(cmd)
            .args(&args)
            .current_dir(&*current_dir)
            .output();

        match output {
            Ok(out) => {
                // Combine stdout + stderr into a single string
                let stdout = String::from_utf8_lossy(&out.stdout).to_string();
                let stderr = String::from_utf8_lossy(&out.stderr).to_string();
                Ok(format!("{}{}", stdout, stderr))
            }
            Err(e) => Ok(format!("Failed to execute command: {}", e)),
        }
    } else {
        // No command was parsed
        Ok("".into())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            run_local_command,
            // ... any other commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
