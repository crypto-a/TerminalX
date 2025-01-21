// src-tauri/src/main.rs
mod local_terminal; // Import the local_terminal module
mod ai;

use tauri::Manager;

fn main()
{
    // Build the Tauri app, registering our commands
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            local_terminal::local_terminal_facade::run_local_command, // Reference the command from the local_terminal module
            // ... add more if needed
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
