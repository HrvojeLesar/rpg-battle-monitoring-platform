use rpg_battle_monitor_lib::{
    cdn::filesystem::local_adapter::Local,
    webserver::router::{
        app_state::{AppState, AppStateConfig},
        battle_monitor_server::BattleMonitorWebServer,
    },
};
use tracing_subscriber::filter::LevelFilter;

#[tokio::main]
async fn main() {
    tokio::spawn(async {
        start_server().await;
    })
    .await
    .unwrap();
}

async fn start_server() {
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::DEBUG)
        .with_writer(std::io::stderr)
        .init();

    let state: AppState<Local> = AppState::new(AppStateConfig::get_default_config().await).await;

    BattleMonitorWebServer::new(state).serve(None).await;
}
