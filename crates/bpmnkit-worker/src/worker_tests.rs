use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use serde_json::json;
use tokio::time::{sleep, Instant};

use super::*;
use crate::backoff::Rng;
use crate::client::JobClient;
use crate::error::Error;
use crate::metrics::CounterMetrics;
use crate::testing::{map, Call, FakeClient, MockJob};
use crate::types::{ThrowErrorRequest, UpdateJobRequest};

struct Half;
impl Rng for Half {
    fn next_f64(&mut self) -> f64 {
        0.5 // no jitter
    }
}

fn cfg(max: usize) -> WorkerConfig {
    WorkerConfig::new("t")
        .max_jobs_active(max)
        .drain_timeout(Duration::from_secs(5))
}

async fn run_for<H: Handler>(
    client: &Arc<FakeClient>,
    config: WorkerConfig,
    h: H,
    d: Duration,
) -> ShutdownReport {
    Worker::new(Arc::clone(client), config, h)
        .rng(Box::new(Half))
        .run(sleep(d))
        .await
}

async fn ok(_: ActivatedJob) -> Result<Complete, JobError> {
    Ok(Complete::new().var("done", true))
}

#[tokio::test(start_paused = true)]
async fn completes_with_variables_and_default_request() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![MockJob::new("t").key("7").build()]);
    let report = run_for(&client, cfg(32), ok, Duration::from_millis(50)).await;
    assert!(report.abandoned.is_empty());
    assert_eq!(
        client.commands(),
        vec![Call::Complete(
            "7".into(),
            CompleteJobRequest {
                variables: Some(map(json!({ "done": true }))),
                result: None
            }
        )]
    );
    let first = &client.activations()[0];
    assert_eq!(first.max_jobs_to_activate, 32);
    assert_eq!(first.timeout, 300_000);
    assert_eq!(first.request_timeout, 10_000);
    assert_eq!(first.worker, "default");
}

#[tokio::test(start_paused = true)]
async fn errors_fail_and_panics_map_to_commands() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![
        MockJob::new("t").key("1").var("mode", "bpmn").build(),
        MockJob::new("t")
            .key("2")
            .var("mode", "fail")
            .retries(3)
            .header("retryBackoff", "PT5S")
            .build(),
        MockJob::new("t")
            .key("3")
            .var("mode", "panic")
            .retries(1)
            .build(),
    ]);
    let handler = |job: ActivatedJob| async move {
        match job.variables["mode"].as_str() {
            Some("bpmn") => Err(JobError::bpmn("E1", "nope")),
            Some("fail") => Err(JobError::fail("down")),
            _ => panic!("boom"),
        }
    };
    let metrics = Arc::new(CounterMetrics::new());
    Worker::new(Arc::clone(&client), cfg(32), handler)
        .metrics(metrics.clone())
        .run(sleep(Duration::from_millis(50)))
        .await;
    let mut cmds = client.commands();
    cmds.sort_by_key(|c| format!("{c:?}"));
    assert!(cmds.contains(&Call::ThrowError(
        "1".into(),
        ThrowErrorRequest {
            error_code: "E1".into(),
            error_message: Some("nope".into()),
            variables: None
        }
    )));
    assert!(cmds.contains(&Call::Fail(
        "2".into(),
        FailJobRequest {
            retries: 2,
            error_message: Some("down".into()),
            retry_back_off: 5000,
            variables: None
        }
    )));
    assert!(cmds.contains(&Call::Fail(
        "3".into(),
        FailJobRequest {
            retries: 0,
            error_message: Some("handler panicked: boom".into()),
            retry_back_off: 0,
            variables: None
        }
    )));
    let c = metrics.get("t");
    assert_eq!(
        (c.activated, c.errored, c.failed, c.in_flight),
        (3, 1, 2, 0)
    );
}

#[tokio::test(start_paused = true)]
async fn concurrency_stays_within_max_jobs_active_and_refetches_at_threshold() {
    let client = Arc::new(FakeClient::new());
    // The fake hands out what is queued regardless of maxJobsToActivate, so queue batches the
    // size the worker asks for: 10, then (once ≤ 3 run) 7.
    client.push_jobs(
        (0..10)
            .map(|i| MockJob::new("t").key(i.to_string()).build())
            .collect(),
    );
    client.push_jobs(
        (10..17)
            .map(|i| MockJob::new("t").key(i.to_string()).build())
            .collect(),
    );
    let running = Arc::new(AtomicUsize::new(0));
    let peak = Arc::new(AtomicUsize::new(0));
    let (r, p) = (running.clone(), peak.clone());
    let handler = move |job: ActivatedJob| {
        let (r, p) = (r.clone(), p.clone());
        async move {
            let now = r.fetch_add(1, Ordering::SeqCst) + 1;
            p.fetch_max(now, Ordering::SeqCst);
            // Staggered so the running count falls through the threshold one job at a time.
            let i: u64 = job.job_key.parse().unwrap();
            sleep(Duration::from_millis(100 * (i + 1))).await;
            r.fetch_sub(1, Ordering::SeqCst);
            Ok(Complete::new())
        }
    };
    run_for(&client, cfg(10), handler, Duration::from_secs(5)).await;
    assert_eq!(peak.load(Ordering::SeqCst), 10);
    let asks: Vec<i32> = client
        .activations()
        .iter()
        .map(|a| a.max_jobs_to_activate)
        .collect();
    assert_eq!(asks[0], 10);
    // threshold = round(10 × 0.3) = 3: the second poll waits until 7 of the first 10 are done.
    assert_eq!(asks[1], 7);
    assert!(asks.iter().all(|&n| n <= 10));
    assert_eq!(client.commands().len(), 17);
}

/// Records when each activation arrived.
struct Timed {
    inner: FakeClient,
    at: std::sync::Mutex<Vec<Instant>>,
}

impl JobClient for Timed {
    async fn activate(&self, r: &ActivateJobsRequest) -> Result<Vec<ActivatedJob>, Error> {
        self.at.lock().unwrap().push(Instant::now());
        self.inner.activate(r).await
    }
    async fn complete(&self, k: &str, r: &CompleteJobRequest) -> Result<(), Error> {
        self.inner.complete(k, r).await
    }
    async fn fail(&self, k: &str, r: &FailJobRequest) -> Result<(), Error> {
        self.inner.fail(k, r).await
    }
    async fn throw_error(&self, k: &str, r: &ThrowErrorRequest) -> Result<(), Error> {
        self.inner.throw_error(k, r).await
    }
    async fn update(&self, k: &str, r: &UpdateJobRequest) -> Result<(), Error> {
        self.inner.update(k, r).await
    }
}

#[tokio::test(start_paused = true)]
async fn backs_off_exponentially_then_resets_to_poll_interval() {
    let inner = FakeClient::new();
    for status in [503, 429, 500] {
        inner.push_error(Error::Http {
            status,
            body: String::new(),
        });
    }
    inner.push_jobs(vec![]);
    inner.push_error(Error::Http {
        status: 503,
        body: String::new(),
    });
    let client = Arc::new(Timed {
        inner,
        at: Default::default(),
    });
    let start = Instant::now();
    Worker::new(
        Arc::clone(&client),
        cfg(4).request_timeout(Duration::from_secs(1)),
        ok,
    )
    .rng(Box::new(Half))
    .run(sleep(Duration::from_millis(1500)))
    .await;
    let at: Vec<u128> = client
        .at
        .lock()
        .unwrap()
        .iter()
        .map(|t| (*t - start).as_millis())
        .collect();
    // 100 ms × 1.6 = 160, × 1.6 = 256, × 1.6 = 409.6 → 410; then the empty answer waits the
    // poll interval (100); the next error restarts from the poll interval (160).
    assert_eq!(at[..6], [0, 160, 416, 826, 926, 1086]);
}

#[tokio::test(start_paused = true)]
async fn backoff_is_capped() {
    let inner = FakeClient::new();
    for _ in 0..20 {
        inner.push_error(Error::Http {
            status: 503,
            body: String::new(),
        });
    }
    let client = Arc::new(Timed {
        inner,
        at: Default::default(),
    });
    Worker::new(Arc::clone(&client), cfg(4), ok)
        .rng(Box::new(Half))
        .run(sleep(Duration::from_secs(60)))
        .await;
    let at = client.at.lock().unwrap().clone();
    let gaps: Vec<u128> = at.windows(2).map(|w| (w[1] - w[0]).as_millis()).collect();
    assert_eq!(*gaps.iter().max().unwrap(), 5000);
}

#[tokio::test(start_paused = true)]
async fn shutdown_interrupts_a_long_poll() {
    let client = Arc::new(FakeClient::new());
    let start = Instant::now();
    run_for(
        &client,
        cfg(4).request_timeout(Duration::from_secs(60)),
        ok,
        Duration::from_millis(10),
    )
    .await;
    assert!(start.elapsed() < Duration::from_secs(1));
}

#[tokio::test(start_paused = true)]
async fn drain_waits_for_running_handlers() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![MockJob::new("t").key("9").build()]);
    let slow = |_: ActivatedJob| async {
        sleep(Duration::from_millis(500)).await;
        Ok(Complete::new())
    };
    let report = run_for(&client, cfg(4), slow, Duration::from_millis(10)).await;
    assert!(report.abandoned.is_empty());
    assert_eq!(client.commands().len(), 1);
}

#[tokio::test(start_paused = true)]
async fn drain_deadline_reports_abandoned_jobs() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![MockJob::new("t").key("9").build()]);
    let stuck = |_: ActivatedJob| async {
        sleep(Duration::from_secs(3600)).await;
        Ok(Complete::new())
    };
    let report = run_for(
        &client,
        cfg(4).drain_timeout(Duration::from_secs(1)),
        stuck,
        Duration::from_millis(10),
    )
    .await;
    assert_eq!(report.abandoned, vec!["9".to_string()]);
    assert!(client.commands().is_empty());
}

#[test]
fn to_command_rules() {
    let job = MockJob::new("t").retries(0).build();
    assert_eq!(
        to_command(&job, Err(JobError::fail("x"))),
        Command::Fail(FailJobRequest {
            retries: 0,
            error_message: Some("x".into()),
            retry_back_off: 0,
            variables: None
        })
    );
    let explicit = JobError::fail("x")
        .retries(5)
        .retry_backoff(Duration::from_secs(2));
    let job = MockJob::new("t").header("retryBackoff", "PT1M").build();
    assert_eq!(
        to_command(&job, Err(explicit)),
        Command::Fail(FailJobRequest {
            retries: 5,
            error_message: Some("x".into()),
            retry_back_off: 2000,
            variables: None
        })
    );
    #[derive(serde::Serialize)]
    struct Out {
        id: u32,
    }
    assert_eq!(
        Complete::output(&Out { id: 1 }).unwrap().variables,
        Some(map(json!({ "id": 1 })))
    );
    assert!(Complete::output(&3).is_err());
    let parse = || -> Result<Complete, JobError> {
        let n: i32 = "x".parse()?;
        Ok(Complete::new().var("n", n))
    };
    assert_eq!(
        parse().unwrap_err(),
        JobError::fail("invalid digit found in string")
    );
}

// ── streaming ───────────────────────────────────────────────────────────────────────────────

use crate::stream::{BoxFuture, JobStream, JobStreamSource, StreamRequest};

/// Each `open` pops the next script: jobs to push, then either close or break.
struct Script {
    jobs: Vec<ActivatedJob>,
    end: Result<(), Error>,
}

struct MockSource {
    scripts: Mutex<std::collections::VecDeque<Result<Script, Error>>>,
    opens: AtomicUsize,
    requests: Mutex<Vec<StreamRequest>>,
}

impl MockSource {
    fn new(scripts: Vec<Result<Script, Error>>) -> Arc<Self> {
        Arc::new(Self {
            scripts: Mutex::new(scripts.into()),
            opens: AtomicUsize::new(0),
            requests: Mutex::new(Vec::new()),
        })
    }
}

struct MockStream(Script);

impl JobStream for MockStream {
    fn next(&mut self) -> BoxFuture<'_, Result<Option<ActivatedJob>, Error>> {
        Box::pin(async move {
            if !self.0.jobs.is_empty() {
                return Ok(Some(self.0.jobs.remove(0)));
            }
            match std::mem::replace(&mut self.0.end, Ok(())) {
                Ok(()) => Ok(None),
                Err(e) => Err(e),
            }
        })
    }
}

impl JobStreamSource for MockSource {
    fn open(&self, req: StreamRequest) -> BoxFuture<'_, Result<Box<dyn JobStream>, Error>> {
        self.opens.fetch_add(1, Ordering::SeqCst);
        self.requests.lock().unwrap().push(req);
        let next = self.scripts.lock().unwrap().pop_front();
        Box::pin(async move {
            match next {
                Some(Ok(s)) => Ok(Box::new(MockStream(s)) as Box<dyn JobStream>),
                Some(Err(e)) => Err(e),
                // Out of scripts: an open stream that never pushes.
                None => Ok(Box::new(MockStream(Script {
                    jobs: vec![],
                    end: Ok(()),
                })) as Box<dyn JobStream>),
            }
        })
    }
}

fn job(key: &str) -> ActivatedJob {
    MockJob::new("t").key(key).build()
}

async fn run_streaming(
    client: &Arc<FakeClient>,
    source: Arc<MockSource>,
    config: WorkerConfig,
    d: Duration,
) -> ShutdownReport {
    Worker::new(Arc::clone(client), config, ok)
        .rng(Box::new(Half))
        .stream(source)
        .run(sleep(d))
        .await
}

fn keys(client: &FakeClient) -> Vec<String> {
    let mut k: Vec<String> = client
        .commands()
        .into_iter()
        .filter_map(|c| match c {
            Call::Complete(k, _) => Some(k),
            _ => None,
        })
        .collect();
    k.sort();
    k
}

#[tokio::test(start_paused = true)]
async fn streamed_jobs_are_handled_and_request_carries_the_config() {
    let client = Arc::new(FakeClient::new());
    let source = MockSource::new(vec![Ok(Script {
        jobs: vec![job("1"), job("2")],
        end: Err(Error::Stream("x".into())),
    })]);
    let cfg = cfg(32)
        .stream_enabled(true)
        .worker_name("w")
        .fetch_variables(["a"])
        .tenant_ids(["tt"]);
    run_streaming(&client, Arc::clone(&source), cfg, Duration::from_millis(20)).await;
    assert_eq!(keys(&client), vec!["1", "2"]);
    assert_eq!(
        source.requests.lock().unwrap()[0],
        StreamRequest {
            job_type: "t".into(),
            worker: "w".into(),
            timeout: 300_000,
            fetch_variable: vec!["a".into()],
            tenant_ids: vec!["tt".into()],
        }
    );
}

#[tokio::test(start_paused = true)]
async fn stream_is_off_unless_enabled() {
    let client = Arc::new(FakeClient::new());
    let source = MockSource::new(vec![Ok(Script {
        jobs: vec![job("1")],
        end: Ok(()),
    })]);
    run_streaming(
        &client,
        Arc::clone(&source),
        cfg(32),
        Duration::from_millis(20),
    )
    .await;
    assert_eq!(source.opens.load(Ordering::SeqCst), 0);
    assert!(keys(&client).is_empty());
}

#[tokio::test(start_paused = true)]
async fn reconnects_after_close_error_and_failed_open() {
    let client = Arc::new(FakeClient::new());
    let source = MockSource::new(vec![
        Ok(Script {
            jobs: vec![job("1")],
            end: Ok(()),
        }),
        Err(Error::Stream("refused".into())),
        Ok(Script {
            jobs: vec![job("2")],
            end: Err(Error::Stream("reset".into())),
        }),
        Ok(Script {
            jobs: vec![job("3")],
            end: Ok(()),
        }),
    ]);
    run_streaming(
        &client,
        Arc::clone(&source),
        cfg(32).stream_enabled(true),
        Duration::from_secs(30),
    )
    .await;
    assert_eq!(keys(&client), vec!["1", "2", "3"]);
    assert!(source.opens.load(Ordering::SeqCst) >= 4);
}

#[tokio::test(start_paused = true)]
async fn polling_still_delivers_while_the_stream_is_down() {
    let client = Arc::new(FakeClient::new());
    client.push_jobs(vec![job("polled")]);
    let source = MockSource::new(vec![Err(Error::Stream("down".into()))]);
    run_streaming(
        &client,
        source,
        cfg(32).stream_enabled(true),
        Duration::from_millis(50),
    )
    .await;
    assert_eq!(keys(&client), vec!["polled"]);
}

#[tokio::test(start_paused = true)]
async fn streamed_jobs_respect_max_jobs_active() {
    let client = Arc::new(FakeClient::new());
    let source = MockSource::new(vec![Ok(Script {
        jobs: (1..=6).map(|i| job(&i.to_string())).collect(),
        end: Ok(()),
    })]);
    let running = Arc::new(AtomicUsize::new(0));
    let peak = Arc::new(AtomicUsize::new(0));
    let (r, p) = (Arc::clone(&running), Arc::clone(&peak));
    let handler = move |_: ActivatedJob| {
        let (r, p) = (Arc::clone(&r), Arc::clone(&p));
        async move {
            let now = r.fetch_add(1, Ordering::SeqCst) + 1;
            p.fetch_max(now, Ordering::SeqCst);
            sleep(Duration::from_millis(10)).await;
            r.fetch_sub(1, Ordering::SeqCst);
            Ok(Complete::new())
        }
    };
    Worker::new(Arc::clone(&client), cfg(2).stream_enabled(true), handler)
        .rng(Box::new(Half))
        .stream(source)
        .run(sleep(Duration::from_millis(200)))
        .await;
    assert_eq!(keys(&client).len(), 6);
    assert_eq!(peak.load(Ordering::SeqCst), 2);
}
