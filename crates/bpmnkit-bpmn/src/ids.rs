//! Element ids, as `generateId` / `resetIdCounter` in `@bpmnkit/core` make them.
//!
//! Random by default. `reset_id_counter` switches the current thread to the
//! deterministic `<prefix>_<base36 counter, 7 wide>` form TS tests and the
//! conformance recorder use, so generated ids compare byte for byte.

use std::cell::Cell;
use std::time::{SystemTime, UNIX_EPOCH};

const ALPHABET: &[u8] = b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

thread_local! {
    static COUNTER: Cell<Option<u64>> = const { Cell::new(None) };
    static SEED: Cell<u64> = const { Cell::new(0) };
}

/// A new id `<prefix>_<suffix>`.
pub fn generate_id(prefix: &str) -> String {
    if let Some(n) = COUNTER.with(Cell::get) {
        let n = n + 1;
        COUNTER.with(|c| c.set(Some(n)));
        return format!("{prefix}_{:0>7}", base36(n));
    }
    format!("{prefix}_{}", random_suffix())
}

/// Switches this thread to deterministic ids and restarts the counter.
pub fn reset_id_counter() {
    COUNTER.with(|c| c.set(Some(0)));
}

/// Back to random ids on this thread.
pub fn use_random_ids() {
    COUNTER.with(|c| c.set(None));
}

fn base36(mut n: u64) -> String {
    let digits = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut out = vec![];
    loop {
        out.push(digits[(n % 36) as usize]);
        n /= 36;
        if n == 0 {
            break;
        }
    }
    out.reverse();
    String::from_utf8(out).unwrap_or_default()
}

// Ids only need to be unlikely to collide within one document, not secret.
fn random_suffix() -> String {
    let mut s = SEED.with(Cell::get);
    if s == 0 {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |d| d.as_nanos() as u64);
        s = nanos ^ 0x9E37_79B9_7F4A_7C15 ^ (&s as *const u64 as u64);
    }
    let mut out = String::with_capacity(8);
    for _ in 0..8 {
        s ^= s << 13;
        s ^= s >> 7;
        s ^= s << 17;
        out.push(ALPHABET[(s % ALPHABET.len() as u64) as usize] as char);
    }
    SEED.with(|c| c.set(s));
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_ids_match_ts() {
        reset_id_counter();
        assert_eq!(generate_id("Flow"), "Flow_0000001");
        for _ in 0..33 {
            generate_id("x");
        }
        assert_eq!(generate_id("Task"), "Task_000000z");
        assert_eq!(generate_id("Task"), "Task_0000010");
        use_random_ids();
        let a = generate_id("A");
        assert_eq!(a.len(), 10);
        assert_ne!(a, generate_id("A"));
    }
}
