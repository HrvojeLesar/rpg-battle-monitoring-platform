use rpg_battle_monitor_lib::webserver::router::{
    battle_monitor_server::BattleMonitorWebServer, global_router_state::GlobalRouterState,
};
use tracing_subscriber::filter::LevelFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::DEBUG)
        .with_writer(std::io::stderr)
        .init();

    let state = GlobalRouterState::new().await;
    BattleMonitorWebServer::new(state).serve(None).await;

    println!("Hello, world!");
}
