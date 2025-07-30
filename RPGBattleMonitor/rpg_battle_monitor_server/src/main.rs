#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::DEBUG)
        .with_writer(std::io::stderr)
        .init();

    let state: AppState<Local> = AppState::new(AppStateConfig::get_default_config().await).await;

    BattleMonitorWebServer::new(state).serve(None).await;
}
