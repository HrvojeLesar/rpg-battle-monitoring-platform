use axum::http::StatusCode;

use super::routes::get_v1_api_router;

#[derive(Debug)]
pub struct BattleMonitorWebServer {
    router: axum::Router<()>,
}

impl BattleMonitorWebServer {
    fn fallback() -> (StatusCode, &'static str) {
        (StatusCode::NOT_FOUND, "Not found")
    }

    pub fn new() -> Self {
        let axum_router = axum::Router::new().fallback(Self::fallback());

        #[cfg(feature = "api_v1_doc")]
        let axum_router = axum_router.merge(get_v1_api_router());

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
                std::env::var("RBM_SERVER_ADDR").unwrap_or("0.0.0.0:3000".into()),
            )
            .await
            .unwrap(),
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

impl Default for BattleMonitorWebServer {
    fn default() -> Self {
        Self::new()
    }
}
