use rpg_battle_monitor_lib::webserver::battle_monitor_server::BattleMonitorWebServer;
use tracing_subscriber::filter::LevelFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::DEBUG)
        .with_writer(std::io::stderr)
        .init();

    BattleMonitorWebServer::new().serve(None).await;

    println!("Hello, world!");
}
