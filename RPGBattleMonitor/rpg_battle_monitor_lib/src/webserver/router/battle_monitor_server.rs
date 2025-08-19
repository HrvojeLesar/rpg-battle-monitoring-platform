use std::{pin::Pin, time::Duration};

use axum::http::{StatusCode, Uri};

use crate::{api::get_router, webserver::router::app_state::AppStateTrait};

#[derive(Debug)]
pub struct BattleMonitorWebServer<T> {
    router: axum::Router<()>,
    state: T,
}

impl<T: AppStateTrait + std::fmt::Debug> BattleMonitorWebServer<T> {
    async fn fallback(uri: Uri) -> (StatusCode, &'static str) {
        tracing::info!("Requested unknown route: {uri}");

        (StatusCode::NOT_FOUND, "Not found")
    }

    pub fn new(state: T) -> Self {
        let axum_router = axum::Router::new().fallback(Self::fallback);

        let axum_router = axum_router.merge(get_router(state.clone()));

        BattleMonitorWebServer {
            router: axum_router,
            state,
        }
    }

    /// Function blocks and can panic if it fails to create TcpListener
    #[tracing::instrument]
    pub async fn serve(self, listener: Option<tokio::net::TcpListener>) {
        self.schedule_tasks();

        let listener = match listener {
            Some(l) => l,
            None => tokio::net::TcpListener::bind(
                std::env::var("RBM_SERVER_ADDR")
                    .map_err(|error| {
                        tracing::warn!(error = %error, "RBM_SERVER_ADDR not set using default");
                        error
                    })
                    .unwrap_or("0.0.0.0:3000".into()),
            )
            .await
            .expect("Failed to create TcpListener"),
        };

        if let Ok(addr) = listener.local_addr() {
            tracing::info!(
                "Started BattleMonitorWebServer on address: {}",
                addr.to_string()
            );
        }

        axum::serve(listener, self.router).await.unwrap();
    }

    fn schedule_tasks(&self) {
        self.schedule_entity_queue_flush_task();
    }

    fn schedule_entity_queue_flush_task(&self) {
        let entity_queue = self.state.get_entity_queue();
        self.state
            .get_scheduler()
            .run(Duration::from_secs(5), move || {
                let entity_queue = entity_queue.clone();
                async move {
                    let mut lock = entity_queue.lock().await;
                    lock.flush().await;
                }
            });
    }
}
