use tauri::command;

#[command]
pub fn ask_direct_question(prompt: String) -> Result<String, String>
{
    let resp = serde_json::json!({
                    "output": format!("AI response: {}", prompt),
                    "type": "terminal",
                    "cwd": "meow"
                });

    Ok(resp.to_string())
}