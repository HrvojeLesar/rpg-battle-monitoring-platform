use rpg_battle_monitor_lib::{
    cdn::filesystem::local_adapter::Local,
    webserver::router::{
        app_state::{AppState, AppStateConfig},
        battle_monitor_server::BattleMonitorWebServer,
    },
};
use tauri::Manager;
use tracing_subscriber::filter::LevelFilter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db_file_path = app
                .path()
                .resolve("rpg_battle_monitor.db", tauri::path::BaseDirectory::AppData)
                .expect("rpg_battle_monitor.db file path")
                .to_str()
                .expect("rpg_battle_monitor.db file path")
                .to_string();
            tauri::async_runtime::spawn(async move {
                std::env::set_var("DATABASE_URL", format!("sqlite://{db_file_path}"));
                start_server().await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn start_server() {
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::DEBUG)
        .with_writer(std::io::stderr)
        .init();

    let state: AppState<Local> = AppState::new(AppStateConfig::get_default_config().await).await;

    BattleMonitorWebServer::new(state).serve(None).await;
}
