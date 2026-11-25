//! The regular expressions of `camunda-compat.ts` (timer values from the plugin's
//! `utils/iso8601.js` and `cron.js`, secrets, variable names), as small backtracking
//! matchers with JS semantics: `\d` and `\w` are ASCII, `\s` is JS's white space.

use std::sync::OnceLock;

/// JS's `\s` (and what `String.prototype.trim` strips).
pub fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// `String.prototype.trim`.
pub fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

fn is_word(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_'
}

/// A regular expression: every way it can match yields an end position.
enum P {
    Lit(&'static str),
    Range(char, char),
    NotChar(char),
    Class(fn(char) -> bool),
    Seq(Vec<P>),
    Alt(Vec<P>),
    Opt(Box<P>),
    Star(Box<P>),
    /// `(?!$)`.
    NotEnd,
}

use P::*;

impl P {
    fn ends(&self, s: &[char], i: usize, out: &mut Vec<usize>) {
        match self {
            Lit(l) => {
                let mut j = i;
                for c in l.chars() {
                    if s.get(j) != Some(&c) {
                        return;
                    }
                    j += 1;
                }
                out.push(j);
            }
            Range(lo, hi) => {
                if s.get(i).is_some_and(|c| (lo..=hi).contains(&c)) {
                    out.push(i + 1)
                }
            }
            NotChar(x) => {
                if s.get(i).is_some_and(|c| c != x) {
                    out.push(i + 1)
                }
            }
            Class(f) => {
                if s.get(i).is_some_and(|c| f(*c)) {
                    out.push(i + 1)
                }
            }
            Seq(ps) => {
                let mut cur = vec![i];
                for p in ps {
                    let mut next = vec![];
                    for &c in &cur {
                        p.ends(s, c, &mut next);
                    }
                    next.sort_unstable();
                    next.dedup();
                    cur = next;
                    if cur.is_empty() {
                        return;
                    }
                }
                out.extend(cur);
            }
            Alt(ps) => {
                for p in ps {
                    p.ends(s, i, out);
                }
            }
            Opt(p) => {
                out.push(i);
                p.ends(s, i, out);
            }
            Star(p) => {
                let mut seen = vec![i];
                let mut frontier = vec![i];
                while let Some(c) = frontier.pop() {
                    let mut next = vec![];
                    p.ends(s, c, &mut next);
                    for e in next {
                        if !seen.contains(&e) {
                            seen.push(e);
                            frontier.push(e);
                        }
                    }
                }
                out.extend(seen);
            }
            NotEnd => {
                if i < s.len() {
                    out.push(i)
                }
            }
        }
    }

    fn matches_at(&self, s: &[char], i: usize) -> Vec<usize> {
        let mut out = vec![];
        self.ends(s, i, &mut out);
        out
    }

    /// `^…$`.
    fn full(&self, s: &str) -> bool {
        let chars: Vec<char> = s.chars().collect();
        self.matches_at(&chars, 0).contains(&chars.len())
    }

    /// `^…` (no end anchor).
    fn prefix(&self, s: &str) -> bool {
        let chars: Vec<char> = s.chars().collect();
        !self.matches_at(&chars, 0).is_empty()
    }

    /// Unanchored `test`.
    fn search(&self, s: &str) -> bool {
        let chars: Vec<char> = s.chars().collect();
        (0..=chars.len()).any(|i| !self.matches_at(&chars, i).is_empty())
    }
}

fn digit() -> P {
    Class(|c| c.is_ascii_digit())
}

fn plus(p: impl Fn() -> P) -> P {
    Seq(vec![p(), Star(Box::new(p()))])
}

fn opt(p: P) -> P {
    Opt(Box::new(p))
}

fn star(p: P) -> P {
    Star(Box::new(p))
}

fn space() -> P {
    Class(is_js_space)
}

fn word_or_dash() -> P {
    Class(|c| is_word(c) || c == '-')
}

/// `ISO_DATE_RE` without anchors.
fn iso_date() -> P {
    let r = Range;
    let d2 = |first: P| Seq(vec![first, digit()]);
    Seq(vec![
        digit(),
        digit(),
        digit(),
        digit(),
        Lit("-"),
        Alt(vec![
            Seq(vec![Lit("0"), r('1', '9')]),
            Seq(vec![Lit("1"), r('0', '2')]),
        ]),
        Lit("-"),
        Alt(vec![
            Seq(vec![Lit("0"), r('1', '9')]),
            d2(r('1', '2')),
            Seq(vec![Lit("3"), r('0', '1')]),
        ]),
        Lit("T"),
        Alt(vec![
            d2(Lit("0")),
            d2(Lit("1")),
            Seq(vec![Lit("2"), r('0', '3')]),
        ]),
        Lit(":"),
        d2(r('0', '5')),
        Lit(":"),
        d2(r('0', '5')),
        Alt(vec![
            Lit("Z"),
            Seq(vec![
                Alt(vec![Lit("+"), Lit("-")]),
                Alt(vec![d2(Lit("0")), Seq(vec![Lit("1"), r('0', '3')])]),
                Lit(":"),
                d2(r('0', '5')),
                opt(Seq(vec![Lit("["), plus(|| NotChar(']')), Lit("]")])),
            ]),
        ]),
    ])
}

/// `ISO_DURATION` (its trailing `$` is the caller's anchor).
fn iso_duration() -> P {
    let part = |unit: &'static str, lower: &'static str| {
        opt(Seq(vec![
            plus(digit),
            opt(Seq(vec![Lit("."), plus(digit)])),
            Alt(vec![Lit(unit), Lit(lower)]),
        ]))
    };
    Seq(vec![
        Lit("P"),
        NotEnd,
        part("Y", "y"),
        part("M", "m"),
        part("W", "w"),
        part("D", "d"),
        opt(Seq(vec![
            Lit("T"),
            NotEnd,
            part("H", "h"),
            part("M", "m"),
            part("S", "s"),
        ])),
    ])
}

fn iso_cycle() -> P {
    Seq(vec![
        Lit("R"),
        opt(Alt(vec![Lit("-1"), plus(digit)])),
        Lit("/"),
        opt(Seq(vec![iso_date(), Lit("/")])),
        iso_duration(),
    ])
}

fn cron() -> P {
    fn range(p: fn() -> P) -> P {
        Seq(vec![p(), opt(Seq(vec![Lit("-"), p()]))])
    }
    fn list(p: fn() -> P) -> P {
        Seq(vec![p(), star(Seq(vec![Lit(","), p()]))])
    }
    fn step(p: P) -> P {
        Seq(vec![p, Lit("/"), plus(digit)])
    }
    fn second() -> P {
        Seq(vec![opt(Range('0', '5')), digit()])
    }
    fn hour() -> P {
        Alt(vec![
            Seq(vec![opt(Range('0', '1')), digit()]),
            Seq(vec![Lit("2"), Range('0', '3')]),
        ])
    }
    fn day29() -> P {
        Seq(vec![opt(Range('0', '2')), digit()])
    }
    fn day3x() -> P {
        Seq(vec![Lit("3"), Range('0', '1')])
    }
    fn dom() -> P {
        Alt(vec![
            Seq(vec![
                Lit("L"),
                opt(Seq(vec![Lit("-"), Alt(vec![day29(), day3x()])])),
            ]),
            day29(),
            day3x(),
            Seq(vec![Alt(vec![Lit("L"), day29(), day3x()]), Lit("W")]),
        ])
    }
    fn month() -> P {
        let mut alts = vec![
            Seq(vec![opt(Lit("0")), Range('1', '9')]),
            Seq(vec![Lit("1"), Range('0', '2')]),
        ];
        for m in [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
        ] {
            alts.push(Lit(m));
        }
        Alt(alts)
    }
    fn dow() -> P {
        let mut alts = vec![Range('0', '7')];
        for d in ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] {
            alts.push(Lit(d));
        }
        Alt(alts)
    }
    fn time(p: fn() -> P) -> P {
        fn alt_of(p: fn() -> P) -> P {
            Alt(vec![step(p()), range(p)])
        }
        // cronList over cronAlt(cronStep(p), cronRange(p)), spelled out as list() needs a fn.
        let item = || alt_of(p);
        Alt(vec![
            Lit("*"),
            step(Lit("*")),
            Seq(vec![item(), star(Seq(vec![Lit(","), item()]))]),
        ])
    }
    fn dow_item() -> P {
        Alt(vec![
            range(dow),
            Seq(vec![
                dow(),
                Alt(vec![Seq(vec![Lit("#"), Range('1', '5')]), Lit("L")]),
            ]),
        ])
    }
    fn dom_range() -> P {
        range(dom)
    }
    fn month_range() -> P {
        range(month)
    }
    Seq(vec![
        time(second),
        Lit(" "),
        time(second),
        Lit(" "),
        time(hour),
        Lit(" "),
        Alt(vec![Lit("*"), Lit("?"), list(dom_range)]),
        Lit(" "),
        Alt(vec![Lit("*"), list(month_range)]),
        Lit(" "),
        Alt(vec![Lit("*"), Lit("?"), list(dow_item)]),
    ])
}

macro_rules! lazy {
    ($name:ident, $build:expr) => {
        fn $name() -> &'static P {
            static CELL: OnceLock<P> = OnceLock::new();
            CELL.get_or_init(|| $build)
        }
    };
}

lazy!(iso_date_re, iso_date());
lazy!(iso_duration_re, iso_duration());
lazy!(iso_cycle_re, iso_cycle());
lazy!(cron_re, cron());
lazy!(
    camunda_secret_re,
    Seq(vec![
        Lit("camunda.secrets."),
        Alt(vec![
            plus(word_or_dash),
            Seq(vec![Lit("`"), plus(|| NotChar('`')), Lit("`")]),
        ]),
    ])
);
lazy!(
    legacy_secret_re,
    Seq(vec![
        Lit("{{"),
        star(space()),
        Lit("secrets."),
        plus(word_or_dash),
        star(space()),
        Lit("}}"),
    ])
);
lazy!(
    secret_reference_re,
    Seq(vec![Lit("camunda.secrets."), plus(word_or_dash)])
);
lazy!(
    context_put_re,
    Seq(vec![
        opt(Lit("=")),
        star(space()),
        Lit("context"),
        plus(space),
        Lit("put"),
        star(space()),
        Lit("("),
        star(space()),
        Lit("toolCallResult"),
        star(space()),
        Lit(","),
    ])
);

fn days_in_month(year: u32, month: u32) -> u32 {
    match month {
        2 if year.is_multiple_of(4) && (!year.is_multiple_of(100) || year.is_multiple_of(400)) => {
            29
        }
        2 => 28,
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    }
}

/// `isIsoDate`: an ISO 8601 date-time whose day exists in its month.
pub fn is_iso_date(value: &str) -> bool {
    if !iso_date_re().full(value) {
        return false;
    }
    let num = |r: std::ops::Range<usize>| value[r].parse::<u32>().unwrap_or(0);
    let (year, month, day) = (num(0..4), num(5..7), num(8..10));
    day <= days_in_month(year, month)
}

/// `ISO_DURATION_RE`.
pub fn is_iso_duration(value: &str) -> bool {
    iso_duration_re().full(value)
}

/// `ISO_CYCLE_RE`.
pub fn is_iso_cycle(value: &str) -> bool {
    iso_cycle_re().full(value)
}

/// `isCron`: a macro (case-sensitive) or six fields (case-insensitive).
pub fn is_cron(value: &str) -> bool {
    let macro_name = value.strip_prefix('@').is_some_and(|m| {
        matches!(
            m,
            "yearly" | "annually" | "monthly" | "weekly" | "daily" | "midnight" | "hourly"
        )
    });
    macro_name || cron_re().full(&value.to_ascii_uppercase())
}

/// `/camunda\.secrets\.(?:[\w-]+|`[^`]+`)/`.
pub fn has_camunda_secret(value: &str) -> bool {
    camunda_secret_re().search(value)
}

/// `/{{\s*secrets\.[\w-]+\s*}}/`.
pub fn has_legacy_secret(value: &str) -> bool {
    legacy_secret_re().search(value)
}

/// `SECRET_REFERENCE_LITERAL`: `/camunda\.secrets\.[\w-]+/`.
pub fn has_secret_reference(value: &str) -> bool {
    secret_reference_re().search(value)
}

/// `/^=?\s*context\s+put\s*\(\s*toolCallResult\s*,/`.
pub fn is_context_put_onto_result(value: &str) -> bool {
    context_put_re().prefix(value)
}

/// Every match of `/\b<word>\b/g` (`ignore_case`: `/gi`), as written. `word` is ASCII.
pub fn word_matches<'s>(value: &'s str, word: &str, ignore_case: bool) -> Vec<&'s str> {
    let bytes = value.as_bytes();
    let n = word.len();
    let mut out = vec![];
    let mut i = 0;
    while i + n <= bytes.len() {
        let candidate = &bytes[i..i + n];
        let hit = if ignore_case {
            candidate.eq_ignore_ascii_case(word.as_bytes())
        } else {
            candidate == word.as_bytes()
        };
        let before = i == 0 || !is_word(bytes[i - 1] as char);
        let after = i + n == bytes.len() || !is_word(bytes[i + n] as char);
        if hit && before && after {
            out.push(&value[i..i + n]);
            i += n;
        } else {
            i += 1;
        }
    }
    out
}

/// `VARIABLE_NAME`: `/^[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*$/`.
pub fn is_variable_name(value: &str) -> bool {
    value.split('.').all(|part| {
        let mut chars = part.chars();
        chars
            .next()
            .is_some_and(|c| c.is_ascii_alphabetic() || c == '_')
            && chars.all(is_word)
    })
}

/// `/^\d+$/.test(p) && Number(p) <= 100`.
pub fn is_priority(value: &str) -> bool {
    if value.is_empty() || !value.bytes().all(|b| b.is_ascii_digit()) {
        return false;
    }
    let digits = value.trim_start_matches('0');
    digits.len() <= 3 && digits.parse::<u32>().unwrap_or(0) <= 100
}

/// The value of a run of ASCII digits, saturating (`Number` of a long run is huge).
pub fn digits_value(digits: &str) -> u128 {
    let digits = digits.trim_start_matches('0');
    if digits.len() > 38 {
        return u128::MAX;
    }
    digits.parse().unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn iso_dates() {
        assert!(is_iso_date("2026-01-01T09:00:00Z"));
        assert!(is_iso_date("2024-02-29T09:00:00+01:00[Europe/Berlin]"));
        assert!(!is_iso_date("2023-02-29T09:00:00Z"));
        assert!(!is_iso_date("2024-04-31T09:00:00Z"));
        assert!(!is_iso_date("2024-01-01"));
        assert!(!is_iso_date("2024-01-01T24:00:00Z"));
        assert!(!is_iso_date("2024-01-01T09:00:00+14:00"));
    }

    #[test]
    fn durations_and_cycles() {
        for ok in ["PT15M", "P1D", "P1Y2M3W4DT5H6M7S", "PT1.5S", "P1dT1h"] {
            assert!(is_iso_duration(ok), "{ok}");
        }
        for bad in ["P", "PT", "P1YT", "p1d", "5 minutes", "PT1M1H", "1D"] {
            assert!(!is_iso_duration(bad), "{bad}");
        }
        for ok in [
            "R/PT1H",
            "R3/PT10M",
            "R-1/P1D",
            "R/2026-01-01T09:00:00Z/P1D",
        ] {
            assert!(is_iso_cycle(ok), "{ok}");
        }
        for bad in ["R-2/PT1H", "R3PT10M", "R/", "PT1H"] {
            assert!(!is_iso_cycle(bad), "{bad}");
        }
    }

    #[test]
    fn crons() {
        for ok in [
            "0 0 9 * * MON",
            "0 0 9 * * mon",
            "*/5 * * ? * *",
            "0 0 12 L * ?",
            "0 0 12 15W * ?",
            "0 0 12 ? * 5#3",
            "0 0 12 ? JAN-MAR MON-FRI",
            "0,30 1-5,2/3 0 1 1 0",
            "0 0 0 LW * ?",
            "@daily",
        ] {
            assert!(is_cron(ok), "{ok}");
        }
        for bad in [
            "0 0 9 * *",
            "60 0 9 * * *",
            "@DAILY",
            "0  0 9 * * *",
            "0 0 24 * * *",
        ] {
            assert!(!is_cron(bad), "{bad}");
        }
    }

    #[test]
    fn secrets_and_names() {
        assert!(has_camunda_secret("=camunda.secrets.TOKEN"));
        assert!(has_camunda_secret("camunda.secrets.`my key`"));
        assert!(!has_camunda_secret("camunda.secrets."));
        assert!(has_legacy_secret("Bearer {{ secrets.TOKEN }}"));
        assert!(!has_legacy_secret("{{secrets.}}"));
        assert!(has_secret_reference("\"camunda.secrets.A\""));
        assert!(is_context_put_onto_result(
            "= context put( toolCallResult ,"
        ));
        assert!(!is_context_put_onto_result("=contextput(toolCallResult,"));
        assert_eq!(
            word_matches(
                "toolCallResult.x + ToolCallResult + xtoolcallresult",
                "toolcallresult",
                true
            ),
            vec!["toolCallResult", "ToolCallResult"]
        );
        assert!(is_variable_name("a.b_1"));
        assert!(!is_variable_name("1a"));
        assert!(!is_variable_name("a..b"));
        assert!(!is_variable_name(""));
        assert!(is_priority("100") && is_priority("007") && !is_priority("101"));
        assert!(!is_priority("-1") && !is_priority(""));
    }
}
