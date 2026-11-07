//! JS `Number(string)` and `String(number)`, so DI coordinates round-trip as in TS.

/// JS `String.prototype.trim`. Not `str::trim`: JS strips U+FEFF and keeps U+0085, Rust does
/// the opposite.
pub fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

pub fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\u{9}'..='\u{D}'
            | ' '
            | '\u{A0}'
            | '\u{1680}'
            | '\u{2000}'..='\u{200A}'
            | '\u{2028}'
            | '\u{2029}'
            | '\u{202F}'
            | '\u{205F}'
            | '\u{3000}'
            | '\u{FEFF}'
    )
}

/// JS `Number(s)`: surrounding whitespace is ignored, `""` is 0, `0x`/`0o`/`0b` literals and
/// `[+-]Infinity` are accepted, anything else must be a strict decimal literal or the result
/// is NaN. Rust's own `parse::<f64>` would also take `inf` and `nan`, which JS does not.
pub fn js_number(s: &str) -> f64 {
    let s = js_trim(s);
    if s.is_empty() {
        return 0.0;
    }
    if let Some((radix, digits)) = radix_literal(s) {
        return parse_radix(digits, radix);
    }
    match s {
        "Infinity" | "+Infinity" => return f64::INFINITY,
        "-Infinity" => return f64::NEG_INFINITY,
        _ => {}
    }
    if is_decimal_literal(s) {
        s.parse().unwrap_or(f64::NAN)
    } else {
        f64::NAN
    }
}

fn radix_literal(s: &str) -> Option<(u32, &str)> {
    let rest = s.strip_prefix('0')?;
    let radix = match rest.as_bytes().first()? {
        b'x' | b'X' => 16,
        b'o' | b'O' => 8,
        b'b' | b'B' => 2,
        _ => return None,
    };
    Some((radix, &rest[1..]))
}

fn parse_radix(digits: &str, radix: u32) -> f64 {
    if digits.is_empty() || !digits.chars().all(|c| c.is_digit(radix)) {
        return f64::NAN;
    }
    // u128 -> f64 rounds to nearest even, as JS does for literals up to 128 bits.
    if let Ok(v) = u128::from_str_radix(digits, radix) {
        return v as f64;
    }
    digits.chars().fold(0.0, |acc, c| {
        acc * f64::from(radix) + f64::from(c.to_digit(radix).unwrap_or(0))
    })
}

/// `[+-]? (digits [. digits?] | . digits) ([eE] [+-]? digits)?`
fn is_decimal_literal(s: &str) -> bool {
    let b = s.as_bytes();
    let mut i = usize::from(matches!(b.first(), Some(b'+' | b'-')));
    let int_start = i;
    while b.get(i).is_some_and(u8::is_ascii_digit) {
        i += 1;
    }
    let int_digits = i - int_start;
    let mut frac_digits = 0;
    if b.get(i) == Some(&b'.') {
        i += 1;
        let frac_start = i;
        while b.get(i).is_some_and(u8::is_ascii_digit) {
            i += 1;
        }
        frac_digits = i - frac_start;
    }
    if int_digits + frac_digits == 0 {
        return false;
    }
    if matches!(b.get(i), Some(b'e' | b'E')) {
        i += 1;
        if matches!(b.get(i), Some(b'+' | b'-')) {
            i += 1;
        }
        let exp_start = i;
        while b.get(i).is_some_and(u8::is_ascii_digit) {
            i += 1;
        }
        if i == exp_start {
            return false;
        }
    }
    i == b.len()
}

/// JS `String(n)`: shortest round-trip digits, no `.0` on integers, exponent form outside
/// `[1e-6, 1e21)`.
pub fn js_number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".into();
    }
    if n == 0.0 {
        return "0".into();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    // `{:e}` gives the shortest digits that round-trip: "d.ddde<exp>".
    let sci = format!("{:e}", n.abs());
    let (mantissa, exp) = sci.split_once('e').unwrap_or((&sci, "0"));
    let digits: String = mantissa.chars().filter(char::is_ascii_digit).collect();
    let k = digits.len() as i32;
    // The decimal point sits n digits from the left of `digits`.
    let n_pos = exp.parse::<i32>().unwrap_or(0) + 1;
    let mut out = String::new();
    if n < 0.0 {
        out.push('-');
    }
    if k <= n_pos && n_pos <= 21 {
        out.push_str(&digits);
        out.extend(std::iter::repeat_n('0', (n_pos - k) as usize));
    } else if 0 < n_pos && n_pos <= 21 {
        out.push_str(&digits[..n_pos as usize]);
        out.push('.');
        out.push_str(&digits[n_pos as usize..]);
    } else if -6 < n_pos && n_pos <= 0 {
        out.push_str("0.");
        out.extend(std::iter::repeat_n('0', (-n_pos) as usize));
        out.push_str(&digits);
    } else {
        let e = n_pos - 1;
        out.push_str(&digits[..1]);
        if k > 1 {
            out.push('.');
            out.push_str(&digits[1..]);
        }
        out.push('e');
        out.push(if e < 0 { '-' } else { '+' });
        out.push_str(&e.abs().to_string());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn number_from_strings() {
        assert_eq!(js_number(""), 0.0);
        assert_eq!(js_number("  \n\t "), 0.0);
        assert_eq!(js_number(" 42 "), 42.0);
        assert_eq!(js_number("\u{FEFF}7\u{A0}"), 7.0);
        assert_eq!(js_number("-1.5"), -1.5);
        assert_eq!(js_number("+.5"), 0.5);
        assert_eq!(js_number("5."), 5.0);
        assert_eq!(js_number("1e3"), 1000.0);
        assert_eq!(js_number("1.5E-2"), 0.015);
        assert_eq!(js_number("0x1F"), 31.0);
        assert_eq!(js_number("0o17"), 15.0);
        assert_eq!(js_number("0b101"), 5.0);
        assert_eq!(js_number("Infinity"), f64::INFINITY);
        assert_eq!(js_number("-Infinity"), f64::NEG_INFINITY);
        assert!(js_number("-0").is_sign_negative());
    }

    #[test]
    fn number_rejects_what_js_rejects() {
        for s in [
            "inf", "nan", "NaN", "infinity", "1_0", "1e", "e1", ".", "+", "-0x1", "0x", "0xg",
            "1 2", "--1", "0b2", "\u{85}1",
        ] {
            assert!(js_number(s).is_nan(), "{s:?}");
        }
    }

    #[test]
    fn number_to_string() {
        for (n, s) in [
            (0.0, "0"),
            (-0.0, "0"),
            (100.0, "100"),
            (-12.0, "-12"),
            (1.5, "1.5"),
            (0.1 + 0.2, "0.30000000000000004"),
            (0.000001, "0.000001"),
            (1e-7, "1e-7"),
            (1.5e-7, "1.5e-7"),
            (123456789012345680000.0, "123456789012345680000"),
            (1e21, "1e+21"),
            (1.2345e25, "1.2345e+25"),
            (-1e-10, "-1e-10"),
            (f64::NAN, "NaN"),
            (f64::INFINITY, "Infinity"),
            (f64::NEG_INFINITY, "-Infinity"),
            (5e-324, "5e-324"),
            (f64::MAX, "1.7976931348623157e+308"),
        ] {
            assert_eq!(js_number_to_string(n), s);
        }
    }
}
