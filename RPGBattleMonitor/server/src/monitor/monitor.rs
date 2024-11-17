use crate::socket::message;
use tokio::{sync::mpsc, task::JoinHandle};

#[derive(Default)]
enum Running {
    Running,
    #[default]
    Stopped,
}

pub struct MonitorServer {
    state: Running,
    monitor_sender: Option<mpsc::Sender<message::Message>>,
    monitor_join_handle: Option<JoinHandle<()>>,
}

impl MonitorServer {
    pub fn new() -> Self {
        Self {
            state: Running::default(),
            monitor_sender: None,
            monitor_join_handle: None,
        }
    }

    pub fn run(&mut self) {
        match self.state {
            Running::Running => {}
            Running::Stopped => {
                let mut monitor = Monitor::new();
                self.monitor_sender = Some(monitor.tx.clone());

                self.monitor_join_handle = Some(tokio::spawn(async move { monitor.run().await }));
                self.state = Running::Running;
            }
        }
    }

    pub async fn stop(&mut self) {
        match self.state {
            Running::Running => {
                let _dont_care = self
                    .monitor_sender
                    .take()
                    .expect("Monitor sender must be present")
                    .send(todo!("Stop message"))
                    .await;

                self.monitor_join_handle
                    .take()
                    .expect("Monitor join handle must be present")
                    .abort();
                self.state = Running::Stopped;
            }
            Running::Stopped => {}
        }
    }
}

struct Monitor {
    pub tx: mpsc::Sender<message::Message>,
    rx: mpsc::Receiver<message::Message>,
}

impl Monitor {
    pub fn new() -> Self {
        let (tx, mut rx) = mpsc::channel(10);

        Self { tx, rx }
    }

    pub async fn run(&mut self) {
        while let Some(msg) = self.rx.recv().await {
            // TODO: Handle messages
        }
    }
}
