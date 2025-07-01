use infer::Type;

#[cfg(test)]
pub mod test_utils;

pub async fn run_blocking<F, R>(job: F) -> R
where
    F: FnOnce() -> R + Send + 'static,
    R: Send + 'static,
{
    match tokio::task::spawn_blocking(job).await {
        Ok(ret) => ret,
        Err(e) => match e.try_into_panic() {
            Ok(panic) => std::panic::resume_unwind(panic),
            Err(_) => unreachable!("spawn_blocking tasks are never cancelled"),
        },
    }
}

pub fn gen_uuid() -> String {
    uuid::Uuid::new_v4().simple().to_string()
}

fn unknonw_mime_matcher(_buf: &[u8]) -> bool {
    true
}

pub fn unknown_mime_type() -> Type {
    infer::Type::new(
        infer::MatcherType::Custom,
        "unknown",
        "",
        unknonw_mime_matcher,
    )
}
