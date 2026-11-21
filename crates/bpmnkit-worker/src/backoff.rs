//! Activation backoff with jitter; the random source is injectable so tests are exact.

use std::time::Duration;

use crate::config::BackoffConfig;

/// Uniform numbers in `[0, 1)`.
pub trait Rng: Send {
    fn next_f64(&mut self) -> f64;
}

/// SplitMix64: tiny, fast, good enough for jitter (not for anything secret).
#[derive(Clone, Debug)]
pub struct SplitMix64(u64);

impl SplitMix64 {
    pub fn seeded(seed: u64) -> Self {
        Self(seed)
    }

    /// Seeded from the process's hash randomness, so workers on one host do not retry in step.
    pub fn from_entropy() -> Self {
        use std::hash::{BuildHasher, Hasher};
        let mut h = std::collections::hash_map::RandomState::new().build_hasher();
        h.write_u64(0x9e37_79b9_7f4a_7c15);
        Self(h.finish())
    }
}

impl Rng for SplitMix64 {
    fn next_f64(&mut self) -> f64 {
        self.0 = self.0.wrapping_add(0x9e37_79b9_7f4a_7c15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58_476d_1ce4_e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
        z ^= z >> 31;
        // The top 53 bits fill an f64 mantissa exactly.
        (z >> 11) as f64 / (1u64 << 53) as f64
    }
}

/// The camunda-client-java `ExponentialBackoff` formula.
pub struct Backoff {
    config: BackoffConfig,
    rng: Box<dyn Rng>,
}

impl Backoff {
    pub fn new(config: BackoffConfig, rng: Box<dyn Rng>) -> Self {
        Self { config, rng }
    }

    /// The delay after `prev`: `clamp(prev × multiplier, min, max)`, then ± `jitter` of it.
    pub fn next_delay(&mut self, prev: Duration) -> Duration {
        let c = &self.config;
        let ms = |d: Duration| d.as_secs_f64() * 1000.0;
        let delay = (ms(prev) * c.multiplier).min(ms(c.max)).max(ms(c.min));
        let jitter = delay * c.jitter * (self.rng.next_f64() * 2.0 - 1.0);
        Duration::from_millis((delay + jitter).round().max(0.0) as u64)
    }
}

/// Parses the ISO-8601 durations Camunda uses for `retryBackoff` (`PT10S`, `P1DT2H30M`, `PT0.5S`,
/// `P2W`). Years and months have no fixed length, so they are not accepted.
pub fn parse_iso8601_duration(s: &str) -> Option<Duration> {
    let rest = s.trim().strip_prefix('P')?;
    let (date, time) = match rest.split_once('T') {
        Some((d, t)) if !t.is_empty() => (d, Some(t)),
        Some(_) => return None,
        None => (rest, None),
    };
    if date.is_empty() && time.is_none() {
        return None;
    }
    let mut secs = 0f64;
    let mut take = |part: &str, units: &[(char, f64)]| -> Option<()> {
        let mut num = String::new();
        let mut unit_idx = 0;
        for ch in part.chars() {
            if ch.is_ascii_digit() || ch == '.' || ch == ',' {
                num.push(if ch == ',' { '.' } else { ch });
                continue;
            }
            // Units must come in order and each at most once.
            let pos = units[unit_idx..].iter().position(|(u, _)| *u == ch)? + unit_idx;
            let n: f64 = num.parse().ok()?;
            secs += n * units[pos].1;
            num.clear();
            unit_idx = pos + 1;
        }
        num.is_empty().then_some(())
    };
    take(date, &[('W', 604_800.0), ('D', 86_400.0)])?;
    if let Some(t) = time {
        take(t, &[('H', 3600.0), ('M', 60.0), ('S', 1.0)])?;
    }
    Duration::try_from_secs_f64(secs).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Fixed(f64);
    impl Rng for Fixed {
        fn next_f64(&mut self) -> f64 {
            self.0
        }
    }

    fn backoff(r: f64) -> Backoff {
        Backoff::new(BackoffConfig::default(), Box::new(Fixed(r)))
    }

    #[test]
    fn grows_by_multiplier_within_bounds() {
        let mut b = backoff(0.5); // jitter term 0
        assert_eq!(
            b.next_delay(Duration::from_millis(100)),
            Duration::from_millis(160)
        );
        assert_eq!(
            b.next_delay(Duration::from_millis(10)),
            Duration::from_millis(50)
        );
        assert_eq!(
            b.next_delay(Duration::from_secs(60)),
            Duration::from_secs(5)
        );
    }

    #[test]
    fn jitter_spans_plus_minus_ten_percent() {
        assert_eq!(
            backoff(0.0).next_delay(Duration::from_millis(1000)),
            Duration::from_millis(1440)
        );
        assert_eq!(
            backoff(1.0).next_delay(Duration::from_millis(1000)),
            Duration::from_millis(1760)
        );
    }

    #[test]
    fn seeded_rng_is_reproducible_and_in_range() {
        let mut a = SplitMix64::seeded(7);
        let mut b = SplitMix64::seeded(7);
        for _ in 0..1000 {
            let x = a.next_f64();
            assert_eq!(x, b.next_f64());
            assert!((0.0..1.0).contains(&x));
        }
    }

    #[test]
    fn iso8601_durations() {
        let p = parse_iso8601_duration;
        assert_eq!(p("PT10S"), Some(Duration::from_secs(10)));
        assert_eq!(p("PT0.5S"), Some(Duration::from_millis(500)));
        assert_eq!(p("P1DT2H30M"), Some(Duration::from_secs(86_400 + 9_000)));
        assert_eq!(p("P2W"), Some(Duration::from_secs(1_209_600)));
        assert_eq!(p("PT1M"), Some(Duration::from_secs(60)));
        for bad in [
            "", "P", "PT", "10S", "P1Y", "PT1S1M", "PT1H1H", "PTxS", "PT5",
        ] {
            assert_eq!(p(bad), None, "{bad}");
        }
    }
}
