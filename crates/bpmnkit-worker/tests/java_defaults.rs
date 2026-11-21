//! D5 contract: the runtime defaults equal camunda-client-java 8.8. The fixture holds the
//! Java source lines verbatim, pinned to a commit (see its header); a bump replaces the fixture
//! and this test says which default moved.

use std::collections::BTreeMap;
use std::time::Duration;

use bpmnkit_worker::{defaults, BackoffConfig, WorkerConfig};

const FIXTURE: &str = include_str!("fixtures/java-defaults-8.8.txt");

#[derive(Debug, PartialEq)]
enum Java {
    Duration(Duration),
    Int(i64),
    Float(f64),
    Bool(bool),
    Str(String),
}

fn parse(expr: &str) -> Java {
    let e = expr.trim().trim_end_matches(';');
    let call = |prefix: &str| {
        e.strip_prefix(prefix)
            .and_then(|r| r.strip_suffix(')'))
            .map(|n| n.parse::<u64>().unwrap())
    };
    // Backoff delays are longs in milliseconds; client timeouts are Durations.
    if let Some(n) = call("TimeUnit.SECONDS.toMillis(") {
        return Java::Int(n as i64 * 1000);
    }
    if let Some(n) = call("TimeUnit.MILLISECONDS.toMillis(") {
        return Java::Int(n as i64);
    }
    if let Some(n) = call("Duration.ofMillis(") {
        return Java::Duration(Duration::from_millis(n));
    }
    if let Some(n) = call("Duration.ofSeconds(") {
        return Java::Duration(Duration::from_secs(n));
    }
    if let Some(n) = call("Duration.ofMinutes(") {
        return Java::Duration(Duration::from_secs(n * 60));
    }
    if let Some(s) = e
        .strip_prefix("getURIFromString(\"")
        .and_then(|r| r.strip_suffix("\")"))
    {
        return Java::Str(s.into());
    }
    if let Some(s) = e.strip_prefix('"').and_then(|r| r.strip_suffix('"')) {
        return Java::Str(s.into());
    }
    match e {
        "true" => Java::Bool(true),
        "false" => Java::Bool(false),
        _ if e.contains('.') => Java::Float(e.parse().unwrap()),
        _ => Java::Int(
            e.parse()
                .unwrap_or_else(|_| panic!("unknown Java expression {e:?}")),
        ),
    }
}

fn java() -> BTreeMap<String, Java> {
    FIXTURE
        .lines()
        .filter(|l| !l.starts_with('#') && l.contains(" DEFAULT_"))
        .map(|l| {
            let (lhs, rhs) = l.split_once(" = ").unwrap();
            (lhs.rsplit(' ').next().unwrap().to_string(), parse(rhs))
        })
        .collect()
}

#[test]
fn fixture_is_pinned_to_a_commit() {
    assert!(FIXTURE.contains("commit: bdfc18408ec235ed4748c93e82ff5c41eb3cd297"));
    assert!(FIXTURE.contains("branch: stable/8.8"));
}

#[test]
fn defaults_equal_camunda_client_java_8_8() {
    let j = java();
    let w = WorkerConfig::new("t");
    let b = BackoffConfig::default();
    let expect = [
        (
            "DEFAULT_REST_ADDRESS",
            Java::Str(defaults::REST_ADDRESS.into()),
        ),
        (
            "DEFAULT_JOB_WORKER_NAME_VAR",
            Java::Str(w.worker_name.clone()),
        ),
        (
            "DEFAULT_PREFER_REST_OVER_GRPC",
            Java::Bool(defaults::PREFER_REST_OVER_GRPC),
        ),
        (
            "DEFAULT_STREAM_ENABLED",
            Java::Bool(defaults::STREAM_ENABLED),
        ),
        (
            "DEFAULT_MAX_JOBS_ACTIVE",
            Java::Int(w.max_jobs_active as i64),
        ),
        ("DEFAULT_JOB_TIMEOUT", Java::Duration(w.timeout)),
        ("DEFAULT_JOB_POLL_INTERVAL", Java::Duration(w.poll_interval)),
        ("DEFAULT_REQUEST_TIMEOUT", Java::Duration(w.request_timeout)),
        (
            "DEFAULT_REQUEST_TIMEOUT_OFFSET",
            Java::Duration(defaults::REQUEST_TIMEOUT_OFFSET),
        ),
        ("DEFAULT_MAX_DELAY", Java::Int(b.max.as_millis() as i64)),
        ("DEFAULT_MIN_DELAY", Java::Int(b.min.as_millis() as i64)),
        ("DEFAULT_MULTIPLIER", Java::Float(b.multiplier)),
        ("DEFAULT_JITTER", Java::Float(b.jitter)),
    ];
    assert_eq!(
        j.len(),
        expect.len(),
        "fixture has defaults this test does not check: {:?}",
        j.keys()
    );
    for (name, ours) in expect {
        assert_eq!(j.get(name), Some(&ours), "{name}");
    }
}
