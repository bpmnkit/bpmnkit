//! Time from "the engine has a job" to "the handler starts": a stream push against polling.
//! Both run the real worker loop in-process (no network), so the row tracks the loop's own
//! cost and stays stable; the real-gRPC figure is printed by the reebe e2e stream test.
//! The poll line is context, not a gated row (it is dominated by the poll interval).

use std::collections::VecDeque;
use std::sync::atomic::{AtomicI64, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use bpmnkit_worker::*;
use tokio::sync::{mpsc, Notify};

const JOBS: u32 = 300;

fn job(sent_ns: i64) -> ActivatedJob {
    ActivatedJob {
        job_key: "1".into(),
        job_type: "bench".into(),
        // Carries the send time to the handler.
        deadline: sent_ns,
        ..ActivatedJob::default()
    }
}

struct Pushed(Mutex<Option<mpsc::UnboundedReceiver<ActivatedJob>>>);
struct PushedStream(mpsc::UnboundedReceiver<ActivatedJob>);

impl JobStream for PushedStream {
    fn next(&mut self) -> BoxFuture<'_, Result<Option<ActivatedJob>, Error>> {
        Box::pin(async move { Ok(self.0.recv().await) })
    }
}

impl JobStreamSource for Pushed {
    fn open(&self, _: StreamRequest) -> BoxFuture<'_, Result<Box<dyn JobStream>, Error>> {
        let rx = self.0.lock().unwrap().take();
        Box::pin(async move {
            rx.map(|r| Box::new(PushedStream(r)) as Box<dyn JobStream>)
                .ok_or_else(|| Error::Stream("one stream per run".into()))
        })
    }
}

/// A client whose activation returns whatever the bench queued.
struct Queue(Mutex<VecDeque<ActivatedJob>>);

impl JobClient for Queue {
    async fn activate(&self, _: &ActivateJobsRequest) -> Result<Vec<ActivatedJob>, Error> {
        Ok(self.0.lock().unwrap().drain(..).collect())
    }
    async fn complete(&self, _: &str, _: &CompleteJobRequest) -> Result<(), Error> {
        Ok(())
    }
    async fn fail(&self, _: &str, _: &FailJobRequest) -> Result<(), Error> {
        Ok(())
    }
    async fn throw_error(&self, _: &str, _: &ThrowErrorRequest) -> Result<(), Error> {
        Ok(())
    }
    async fn update(&self, _: &str, _: &UpdateJobRequest) -> Result<(), Error> {
        Ok(())
    }
}

/// Average µs between sending a job and its handler starting, one job in flight at a time.
async fn measure(stream: bool) -> f64 {
    let origin = Instant::now();
    let total = Arc::new(AtomicU64::new(0));
    let handled = Arc::new(Notify::new());
    let seen = Arc::new(AtomicI64::new(0));
    let (t, h, s) = (total.clone(), handled.clone(), seen.clone());
    let handler = move |j: ActivatedJob| {
        let (t, h, s) = (t.clone(), h.clone(), s.clone());
        async move {
            let now = origin.elapsed().as_nanos() as i64;
            t.fetch_add((now - j.deadline).max(0) as u64, Ordering::SeqCst);
            s.fetch_add(1, Ordering::SeqCst);
            h.notify_one();
            Ok(Complete::new())
        }
    };
    let queue = Arc::new(Queue(Mutex::new(VecDeque::new())));
    let (tx, rx) = mpsc::unbounded_channel();
    let cfg = WorkerConfig::new("bench")
        .stream_enabled(stream)
        .poll_interval(if stream {
            Duration::from_secs(1)
        } else {
            Duration::from_millis(2)
        });
    let mut worker = Worker::new(queue.clone(), cfg, handler);
    if stream {
        worker = worker.stream(Arc::new(Pushed(Mutex::new(Some(rx)))));
    }
    let stop = Arc::new(Notify::new());
    let stopped = stop.clone();
    let run = tokio::spawn(worker.run(async move { stopped.notified().await }));
    // Let the stream open before the first send.
    tokio::time::sleep(Duration::from_millis(50)).await;
    for _ in 0..JOBS {
        let sent = origin.elapsed().as_nanos() as i64;
        if stream {
            tx.send(job(sent)).unwrap();
        } else {
            queue.0.lock().unwrap().push_back(job(sent));
        }
        handled.notified().await;
    }
    stop.notify_one();
    run.await.unwrap();
    total.load(Ordering::SeqCst) as f64 / 1e3 / f64::from(JOBS)
}

#[tokio::main(flavor = "multi_thread", worker_threads = 2)]
async fn main() {
    println!(
        "poll (2 ms interval)  {:>9.1} µs mean, not gated",
        measure(false).await
    );
    println!(
        "{:<18} {:>9.1} µs per call",
        "stream push",
        measure(true).await
    );
}
