//! JS semantics the layout depends on.

/// `Math.round`: halves round towards +∞ (`-2.5` → `-2`), unlike [`f64::round`].
pub fn round(x: f64) -> f64 {
    if !x.is_finite() {
        return x;
    }
    let f = x.floor();
    if x - f >= 0.5 {
        f + 1.0
    } else {
        f
    }
}

/// `s.length`: UTF-16 code units.
pub fn len(s: &str) -> usize {
    s.encode_utf16().count()
}

/// `Math.min` / `Math.max` over f64 (NaN propagates as in JS).
pub fn min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.min(b)
    }
}

pub fn max(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else {
        a.max(b)
    }
}

/// Comparator for `arr.sort((a, b) => a - b)` on numbers.
pub fn cmp_num(a: f64, b: f64) -> std::cmp::Ordering {
    a.partial_cmp(&b).unwrap_or(std::cmp::Ordering::Equal)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_matches_math_round() {
        assert_eq!(round(2.5), 3.0);
        assert_eq!(round(-2.5), -2.0);
        assert_eq!(round(0.49999999999999994), 0.0);
        assert_eq!(round(-0.6), -1.0);
    }

    #[test]
    fn len_counts_utf16() {
        assert_eq!(len("a😀"), 3);
    }
}
