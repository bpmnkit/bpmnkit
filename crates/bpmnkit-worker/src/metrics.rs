//! A metrics facade: the worker reports through [`Metrics`]; plug in your own sink, or use
//! [`CounterMetrics`] (and, with the `prometheus` feature, its text exposition).

use std::collections::BTreeMap;
use std::sync::Mutex;
use std::time::Duration;

/// Called by the worker loop. Every method defaults to doing nothing.
pub trait Metrics: Send + Sync + 'static {
    fn activated(&self, _job_type: &str, _count: usize) {}
    fn completed(&self, _job_type: &str, _latency: Duration) {}
    fn failed(&self, _job_type: &str, _latency: Duration) {}
    fn errored(&self, _job_type: &str, _latency: Duration) {}
    /// Handlers running now.
    fn in_flight(&self, _job_type: &str, _count: usize) {}
    /// A complete/fail/error request did not reach the cluster (the job will time out).
    fn command_failed(&self, _job_type: &str) {}
}

/// Discards everything.
#[derive(Clone, Copy, Debug, Default)]
pub struct NoopMetrics;

impl Metrics for NoopMetrics {}

/// Totals for one job type.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Counts {
    pub activated: u64,
    pub completed: u64,
    pub failed: u64,
    pub errored: u64,
    pub command_failed: u64,
    pub in_flight: u64,
    /// Sum of handler latencies (completed + failed + errored).
    pub latency_total: Duration,
}

/// In-memory counters per job type.
#[derive(Debug, Default)]
pub struct CounterMetrics {
    by_type: Mutex<BTreeMap<String, Counts>>,
}

impl CounterMetrics {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get(&self, job_type: &str) -> Counts {
        self.lock().get(job_type).copied().unwrap_or_default()
    }

    pub fn snapshot(&self) -> BTreeMap<String, Counts> {
        self.lock().clone()
    }

    fn lock(&self) -> std::sync::MutexGuard<'_, BTreeMap<String, Counts>> {
        // A panic while holding the lock cannot leave the counters inconsistent.
        self.by_type.lock().unwrap_or_else(|e| e.into_inner())
    }

    fn update(&self, job_type: &str, f: impl FnOnce(&mut Counts)) {
        f(self.lock().entry(job_type.to_owned()).or_default());
    }

    /// Prometheus text exposition format (0.0.4), job types sorted.
    #[cfg(feature = "prometheus")]
    pub fn render_prometheus(&self) -> String {
        use std::fmt::Write;
        let snap = self.snapshot();
        let mut out = String::new();
        type Series = (
            &'static str,
            &'static str,
            &'static str,
            fn(&Counts) -> String,
        );
        let series: [Series; 7] = [
            (
                "bpmnkit_worker_jobs_activated_total",
                "counter",
                "Jobs activated.",
                |c| c.activated.to_string(),
            ),
            (
                "bpmnkit_worker_jobs_completed_total",
                "counter",
                "Jobs completed.",
                |c| c.completed.to_string(),
            ),
            (
                "bpmnkit_worker_jobs_failed_total",
                "counter",
                "Jobs failed.",
                |c| c.failed.to_string(),
            ),
            (
                "bpmnkit_worker_jobs_errored_total",
                "counter",
                "Jobs that threw a BPMN error.",
                |c| c.errored.to_string(),
            ),
            (
                "bpmnkit_worker_commands_failed_total",
                "counter",
                "Complete/fail/error requests that did not reach the cluster.",
                |c| c.command_failed.to_string(),
            ),
            (
                "bpmnkit_worker_jobs_in_flight",
                "gauge",
                "Handlers running now.",
                |c| c.in_flight.to_string(),
            ),
            (
                "bpmnkit_worker_handler_seconds_total",
                "counter",
                "Total handler time.",
                |c| format!("{}", c.latency_total.as_secs_f64()),
            ),
        ];
        for (name, kind, help, value) in series {
            let _ = writeln!(out, "# HELP {name} {help}\n# TYPE {name} {kind}");
            for (t, c) in &snap {
                let label = t
                    .replace('\\', "\\\\")
                    .replace('"', "\\\"")
                    .replace('\n', "\\n");
                let _ = writeln!(out, "{name}{{job_type=\"{label}\"}} {}", value(c));
            }
        }
        out
    }
}

impl Metrics for CounterMetrics {
    fn activated(&self, t: &str, n: usize) {
        self.update(t, |c| c.activated += n as u64);
    }
    fn completed(&self, t: &str, d: Duration) {
        self.update(t, |c| {
            c.completed += 1;
            c.latency_total += d;
        });
    }
    fn failed(&self, t: &str, d: Duration) {
        self.update(t, |c| {
            c.failed += 1;
            c.latency_total += d;
        });
    }
    fn errored(&self, t: &str, d: Duration) {
        self.update(t, |c| {
            c.errored += 1;
            c.latency_total += d;
        });
    }
    fn in_flight(&self, t: &str, n: usize) {
        self.update(t, |c| c.in_flight = n as u64);
    }
    fn command_failed(&self, t: &str) {
        self.update(t, |c| c.command_failed += 1);
    }
}

#[cfg(all(test, feature = "prometheus"))]
mod tests {
    use super::*;

    #[test]
    fn prometheus_text() {
        let m = CounterMetrics::new();
        m.activated("pay", 2);
        m.completed("pay", Duration::from_millis(1500));
        m.in_flight("pay", 1);
        let text = m.render_prometheus();
        assert!(text.contains("# TYPE bpmnkit_worker_jobs_activated_total counter\n"));
        assert!(text.contains("bpmnkit_worker_jobs_activated_total{job_type=\"pay\"} 2\n"));
        assert!(text.contains("bpmnkit_worker_jobs_in_flight{job_type=\"pay\"} 1\n"));
        assert!(text.contains("bpmnkit_worker_handler_seconds_total{job_type=\"pay\"} 1.5\n"));
    }
}
