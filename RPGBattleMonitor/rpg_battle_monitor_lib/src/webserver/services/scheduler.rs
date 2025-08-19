use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

use futures_util::StreamExt;
use tokio::{task::JoinHandle, time};
use tokio_stream::wrappers::IntervalStream;

#[derive(Clone, Debug)]
pub struct Scheduler {
    inner: Arc<Mutex<InnerScheduler>>,
}

#[derive(Debug)]
struct InnerScheduler {
    handles: Vec<JoinHandle<()>>,
}

impl Scheduler {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(InnerScheduler {
                handles: Vec::new(),
            })),
        }
    }

    pub fn run<F, R>(&self, interval: Duration, mut task: F)
    where
        F: FnMut() -> R + Send + 'static,
        R: std::future::Future<Output = ()> + Send + 'static,
    {
        let future =
            IntervalStream::new(time::interval(interval)).for_each_concurrent(2, move |_| task());

        self.inner
            .lock()
            .expect("Mutex is poisoned")
            .handles
            .push(tokio::spawn(future));
    }

    pub fn stop(&self) {
        self.inner
            .lock()
            .expect("Mutex is poisoned")
            .handles
            .iter()
            .for_each(|handle| handle.abort());
    }
}
