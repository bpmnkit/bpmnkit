//! Per-caller token bucket for the endpoints that start cargo.

use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RateConfig {
    /// Requests a caller may make at once.
    pub burst: u32,
    /// Refill rate; at least 1.
    pub per_minute: u32,
}
impl Default for RateConfig {
    fn default() -> Self {
        Self {
            burst: 10,
            per_minute: 30,
        }
    }
}

#[derive(Debug)]
pub struct RateLimiter {
    cfg: RateConfig,
    buckets: HashMap<String, (f64, Instant)>,
}

impl RateLimiter {
    pub fn new(cfg: RateConfig) -> Self {
        Self {
            cfg,
            buckets: HashMap::new(),
        }
    }

    /// Takes one token; `Err(wait)` until the next one when the caller's bucket is empty.
    pub fn take(&mut self, caller: &str, now: Instant) -> Result<(), Duration> {
        let burst = f64::from(self.cfg.burst);
        let rate = f64::from(self.cfg.per_minute.max(1)) / 60.0;
        let b = self
            .buckets
            .entry(caller.to_owned())
            .or_insert((burst, now));
        let elapsed = now.saturating_duration_since(b.1).as_secs_f64();
        b.0 = (b.0 + elapsed * rate).min(burst);
        b.1 = now;
        if b.0 >= 1.0 {
            b.0 -= 1.0;
            Ok(())
        } else {
            Err(Duration::from_secs_f64((1.0 - b.0) / rate))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn burst_then_refill_per_caller() {
        let mut r = RateLimiter::new(RateConfig {
            burst: 2,
            per_minute: 60,
        });
        let t = Instant::now();
        assert!(r.take("a", t).is_ok());
        assert!(r.take("a", t).is_ok());
        let wait = r.take("a", t).unwrap_err();
        assert!(wait <= Duration::from_secs(1) && wait > Duration::ZERO);
        assert!(r.take("b", t).is_ok(), "buckets are per caller");
        assert!(r.take("a", t + Duration::from_secs(1)).is_ok());
        assert!(r.take("a", t + Duration::from_secs(1)).is_err());
    }

    #[test]
    fn refill_caps_at_burst() {
        let mut r = RateLimiter::new(RateConfig {
            burst: 1,
            per_minute: 60,
        });
        let t = Instant::now();
        r.take("a", t).unwrap();
        let later = t + Duration::from_secs(3600);
        assert!(r.take("a", later).is_ok());
        assert!(r.take("a", later).is_err());
    }
}
