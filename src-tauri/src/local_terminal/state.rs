// src-tauri/src/state.rs

use std::path::PathBuf;
use std::sync::Mutex;
use lazy_static::lazy_static;

/// A global (static) variable that tracks the current working directory
/// for the local terminal session. We store it inside a Mutex so we can
/// safely mutate it from commands.
lazy_static! {
    pub static ref CURRENT_DIR: Mutex<PathBuf> = Mutex::new(
        std::env::current_dir().expect("Failed to get current directory")
    );
}
