//! Label text: JS-exact wrapping estimate and escaping.

use bpmnkit_bpmn::js::{is_js_space, js_trim, utf16_len};

/// Estimated glyph width at 11 px (TS `AVG_CHAR_PX`).
pub(crate) const AVG_CHAR_PX: f64 = 6.5;

/// JS `text.split(/\s+/)`.
fn split_ws(text: &str) -> Vec<&str> {
    let mut out = vec![];
    let mut start = 0;
    let mut in_ws = false;
    for (i, c) in text.char_indices() {
        if is_js_space(c) {
            if !in_ws {
                out.push(&text[start..i]);
                in_ws = true;
            }
        } else if in_ws {
            start = i;
            in_ws = false;
        }
    }
    out.push(if in_ws { "" } else { &text[start..] });
    out
}

/// Greedy word wrap by estimated width (TS `wrapText`); lengths are UTF-16 units.
pub fn wrap_text(text: &str, max_px: f64, char_w: f64) -> Vec<String> {
    if js_trim(text).is_empty() {
        return vec![];
    }
    let mut lines = vec![];
    let mut line = String::new();
    for word in split_ws(text) {
        let candidate = if line.is_empty() {
            word.to_owned()
        } else {
            format!("{line} {word}")
        };
        if utf16_len(&candidate) as f64 * char_w <= max_px {
            line = candidate;
        } else if !line.is_empty() {
            lines.push(std::mem::replace(&mut line, word.to_owned()));
        } else {
            line = word.to_owned();
        }
    }
    if !line.is_empty() {
        lines.push(line);
    }
    if lines.is_empty() {
        vec![text.to_owned()]
    } else {
        lines
    }
}

/// Escapes `& < > "` (TS `esc`).
pub(crate) fn esc(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            _ => out.push(c),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_like_js() {
        assert_eq!(split_ws("a b"), ["a", "b"]);
        assert_eq!(split_ws(" a\u{a0}\u{2003}b "), ["", "a", "b", ""]);
    }

    #[test]
    fn wraps_greedily() {
        assert_eq!(
            wrap_text("Process the order now", 13.0 * 6.5, 6.5),
            ["Process the", "order now"]
        );
        assert!(wrap_text("  \n", 100.0, 6.5).is_empty());
    }

    #[test]
    fn long_word_gets_its_own_line() {
        assert_eq!(
            wrap_text("a Supercalifragilistic b", 30.0, 6.5),
            ["a", "Supercalifragilistic", "b"]
        );
    }

    #[test]
    fn counts_utf16_units() {
        // Each emoji is 2 UTF-16 units: 4 units * 6.5 = 26 > 20.
        assert_eq!(wrap_text("😀😀 x", 20.0, 6.5), ["😀😀", "x"]);
        assert_eq!(wrap_text("éé x", 20.0, 6.5), ["éé", "x"]);
        assert_eq!(wrap_text("é x", 20.0, 6.5), ["é x"]);
    }

    #[test]
    fn escapes_four_chars() {
        assert_eq!(esc(r#"a&b<c>d"e'f"#), "a&amp;b&lt;c&gt;d&quot;e'f");
    }
}
