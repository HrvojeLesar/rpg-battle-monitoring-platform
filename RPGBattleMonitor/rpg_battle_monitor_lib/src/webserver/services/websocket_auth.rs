use axum::{extract::Request, http::Method, response::Response};
use futures_util::{FutureExt, future::BoxFuture};
use serde::Deserialize;
use thiserror::Error;
use tower::{Layer, Service};

use crate::webserver::router::app_state::AppStateTrait;

#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    AxumError(#[from] axum::Error),

    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),

    #[error("AuthenticationFailed")]
    AuthenticationFailed,
}

impl Error {
    fn into_response<B>(self, body: B) -> axum::response::Response<B> {
        use axum::http::StatusCode;

        tracing::error!(error = %self);

        let status_code = match self {
            Error::AxumError(_) | Error::SerdeJsonError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::AuthenticationFailed => StatusCode::UNAUTHORIZED,
        };

        axum::response::Response::builder()
            .status(status_code)
            .body(body)
            .unwrap()
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebsocketAuthMessage {
    pub user_token: String,
    pub game: i32,
}

impl WebsocketAuthMessage {
    pub fn authenticate(&self, state: &impl AppStateTrait) -> Result<(), Error> {
        // TODO: implement
        tracing::error!("IMPLEMENT ME | Authenticating user: {}", self.user_token);
        // Err(Error::AuthenticationFailed)
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct WebsocketAuthLayer<T> {
    state: T,
}

impl<T> WebsocketAuthLayer<T> {
    pub fn new(state: T) -> Self
    where
        T: AppStateTrait,
    {
        Self { state }
    }
}

impl<S, T> Layer<S> for WebsocketAuthLayer<T>
where
    T: Clone,
{
    type Service = WebsocketAuthService<S, T>;

    fn layer(&self, inner: S) -> Self::Service {
        WebsocketAuthService {
            inner,
            layer: self.clone(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct WebsocketAuthService<S, T> {
    inner: S,
    layer: WebsocketAuthLayer<T>,
}

impl<S, T, B> Service<Request> for WebsocketAuthService<S, T>
where
    S: Service<Request, Response = Response<B>> + Clone + Send + 'static,
    S::Future: Send + 'static,
    B: Default,
    T: AppStateTrait,
{
    type Response = S::Response;

    type Error = S::Error;

    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request) -> Self::Future {
        // TODO: Idenfity when the request is actual websocket upgrade
        if req.method() != Method::POST {
            return self.inner.call(req).boxed();
        }

        let mut inner = self.inner.clone();
        let state = self.layer.state.clone();
        let future = async move {
            let (parts, body) = req.into_parts();

            let bytes = match axum::body::to_bytes(body, usize::MAX)
                .await
                .map_err(Error::AxumError)
            {
                Ok(b) => b,
                Err(e) => {
                    return Ok(e.into_response(B::default()));
                }
            };

            if bytes.len() < 2 {
                return Ok(Error::AuthenticationFailed.into_response(B::default()));
            }

            // TODO: This still can fail sometimes
            let slice = bytes.slice(2..);
            let message = match serde_json::from_slice::<WebsocketAuthMessage>(&slice)
                .map_err(Error::SerdeJsonError)
            {
                Ok(m) => m,
                Err(e) => {
                    return Ok(e.into_response(B::default()));
                }
            };

            match message.authenticate(&state) {
                Ok(_) => (),
                Err(e) => {
                    return Ok(e.into_response(B::default()));
                }
            }

            let mut req = Request::from_parts(parts, bytes.into());
            req.extensions_mut().insert(message);

            inner.call(req).await
        };

        Box::pin(future)
    }
}
