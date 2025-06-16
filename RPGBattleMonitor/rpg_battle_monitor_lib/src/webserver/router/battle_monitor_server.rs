use axum::http::StatusCode;

use crate::{
    cdn::filesystem::{FileSystem, WritableFilesystem, Writeable},
    webserver::{router::app_state::AppState, routes::v1::get_v1_api_router},
};

#[derive(Debug)]
pub struct BattleMonitorWebServer {
    router: axum::Router<()>,
}

impl BattleMonitorWebServer {
    fn fallback() -> (StatusCode, &'static str) {
        (StatusCode::NOT_FOUND, "Not found")
    }

    pub fn new<DB, F>(state: AppState<DB, F>) -> Self
    where
        DB: sqlx::Database,
        <DB as sqlx::Database>::Connection: sqlx::migrate::Migrate,
        F: WritableFilesystem,
    {
        let axum_router = axum::Router::new().fallback(Self::fallback());

        let axum_router = axum_router.merge(get_v1_api_router(state));

        BattleMonitorWebServer {
            router: axum_router,
        }
    }

    /// Function blocks and can panic if it fails to create TcpListener
    #[tracing::instrument]
    pub async fn serve(self, listener: Option<tokio::net::TcpListener>) {
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
}
