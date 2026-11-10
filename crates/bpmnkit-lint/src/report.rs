//! Human-readable lint output: plain text (terminals, logs), Markdown (PR comments) and
//! Slack `mrkdwn`. Pure string building, so a chat server can call it on any thread.
//!
//! ```
//! use bpmnkit_lint::report::{check_findings_to_text, TextStyle};
//! use bpmnkit_lint::{CheckFinding, CheckSeverity};
//!
//! let findings = [CheckFinding {
//!     rule: "form/duplicate-key".into(),
//!     severity: CheckSeverity::Error,
//!     element_id: Some("c1".into()),
//!     message: "Key \"a\" is used twice".into(),
//!     fix: "Rename one of them".into(),
//! }];
//! let text = check_findings_to_text(&findings, &TextStyle::default());
//! assert!(text.starts_with("1 problem: 1 error"));
//! ```

use std::fmt::Write as _;

use crate::check_finding::{CheckFinding, CheckSeverity};
use crate::lint::{LintReport, SeverityCounts};
use crate::Severity;

/// How [`to_text`] and [`check_findings_to_text`] print.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct TextStyle {
    /// Wrap the severity word in ANSI colour codes.
    pub color: bool,
    /// Print at most this many findings, then a `... and N more` line. `0` prints all.
    pub max: usize,
}

/// One finding, whatever produced it.
struct Item<'a> {
    severity: Level,
    rule: &'a str,
    location: String,
    message: &'a str,
    fix: &'a str,
}

#[derive(Clone, Copy)]
enum Level {
    Error,
    Warning,
    Info,
}

impl Level {
    fn word(self) -> &'static str {
        match self {
            Level::Error => "error",
            Level::Warning => "warning",
            Level::Info => "info",
        }
    }
    fn ansi(self) -> &'static str {
        match self {
            Level::Error => "\x1b[31m",
            Level::Warning => "\x1b[33m",
            Level::Info => "\x1b[36m",
        }
    }
}

impl From<Severity> for Level {
    fn from(s: Severity) -> Self {
        match s {
            Severity::Error => Level::Error,
            Severity::Warning => Level::Warning,
            Severity::Info => Level::Info,
        }
    }
}

impl From<CheckSeverity> for Level {
    fn from(s: CheckSeverity) -> Self {
        match s {
            CheckSeverity::Error => Level::Error,
            CheckSeverity::Warning => Level::Warning,
            CheckSeverity::Info => Level::Info,
        }
    }
}

fn report_items(report: &LintReport) -> Vec<Item<'_>> {
    report
        .diagnostics
        .iter()
        .map(|d| {
            let mut location = String::new();
            if !d.process_id.is_empty() {
                let _ = write!(location, "process {}", d.process_id);
            }
            if !d.element_ids.is_empty() {
                if !location.is_empty() {
                    location.push_str(": ");
                }
                location.push_str(&d.element_ids.join(", "));
            }
            Item {
                severity: d.severity.into(),
                rule: &d.id,
                location,
                message: &d.message,
                fix: &d.suggestion,
            }
        })
        .collect()
}

fn finding_items(findings: &[CheckFinding]) -> Vec<Item<'_>> {
    findings
        .iter()
        .map(|f| Item {
            severity: f.severity.into(),
            rule: &f.rule,
            location: f.element_id.clone().unwrap_or_default(),
            message: &f.message,
            fix: &f.fix,
        })
        .collect()
}

fn counts(items: &[Item<'_>]) -> SeverityCounts {
    let mut c = SeverityCounts::default();
    for i in items {
        match i.severity {
            Level::Error => c.error += 1,
            Level::Warning => c.warning += 1,
            Level::Info => c.info += 1,
        }
    }
    c
}

/// `3 problems: 1 error, 2 warnings`; zero counts are left out.
fn summary(items: &[Item<'_>]) -> String {
    if items.is_empty() {
        return "No problems found".to_string();
    }
    let c = counts(items);
    let plural =
        |n: usize, one: &str, many: &str| format!("{n} {}", if n == 1 { one } else { many });
    let parts: Vec<String> = [
        (c.error, "error", "errors"),
        (c.warning, "warning", "warnings"),
        (c.info, "info", "infos"),
    ]
    .iter()
    .filter(|(n, _, _)| *n > 0)
    .map(|(n, one, many)| plural(*n, one, many))
    .collect();
    format!(
        "{}: {}",
        plural(items.len(), "problem", "problems"),
        parts.join(", ")
    )
}

fn limit<'a, 'b>(items: &'a [Item<'b>], max: usize) -> (&'a [Item<'b>], usize) {
    if max == 0 || items.len() <= max {
        (items, 0)
    } else {
        (&items[..max], items.len() - max)
    }
}

fn text(items: &[Item<'_>], style: &TextStyle) -> String {
    let mut out = summary(items);
    out.push('\n');
    let (shown, hidden) = limit(items, style.max);
    for i in shown {
        let word = if style.color {
            format!("{}{}\x1b[0m", i.severity.ansi(), i.severity.word())
        } else {
            i.severity.word().to_string()
        };
        let _ = write!(out, "{word} [{}] {}", i.rule, i.message);
        if !i.location.is_empty() {
            let _ = write!(out, " ({})", i.location);
        }
        out.push('\n');
        if !i.fix.is_empty() {
            let _ = writeln!(out, "  fix: {}", i.fix);
        }
    }
    if hidden > 0 {
        let _ = writeln!(out, "... and {hidden} more");
    }
    out
}

fn markdown(items: &[Item<'_>]) -> String {
    let mut out = format!("**{}**\n", summary(items));
    if !items.is_empty() {
        out.push('\n');
    }
    for i in items {
        let _ = write!(
            out,
            "- **{}** `{}`: {}",
            i.severity.word(),
            i.rule,
            i.message
        );
        if !i.location.is_empty() {
            let _ = write!(out, " (`{}`)", i.location);
        }
        out.push('\n');
        if !i.fix.is_empty() {
            let _ = writeln!(out, "  - Fix: {}", i.fix);
        }
    }
    out
}

/// Slack treats `&`, `<` and `>` as control characters in `mrkdwn`.
fn slack_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn slack(items: &[Item<'_>]) -> String {
    let mut out = format!("*{}*\n", slack_escape(&summary(items)));
    for i in items {
        let _ = write!(
            out,
            "• *{}* `{}`: {}",
            i.severity.word(),
            slack_escape(i.rule),
            slack_escape(i.message)
        );
        if !i.location.is_empty() {
            let _ = write!(out, " (`{}`)", slack_escape(&i.location));
        }
        out.push('\n');
        if !i.fix.is_empty() {
            let _ = writeln!(out, "    _Fix:_ {}", slack_escape(i.fix));
        }
    }
    out
}

/// A [`LintReport`] as plain text, one finding per line.
pub fn to_text(report: &LintReport, style: &TextStyle) -> String {
    text(&report_items(report), style)
}

/// A [`LintReport`] as a Markdown bullet list.
pub fn to_markdown(report: &LintReport) -> String {
    markdown(&report_items(report))
}

/// A [`LintReport`] as Slack `mrkdwn` (`<`, `>` and `&` escaped).
pub fn to_slack_mrkdwn(report: &LintReport) -> String {
    slack(&report_items(report))
}

/// DMN or form findings as plain text.
pub fn check_findings_to_text(findings: &[CheckFinding], style: &TextStyle) -> String {
    text(&finding_items(findings), style)
}

/// DMN or form findings as Markdown.
pub fn check_findings_to_markdown(findings: &[CheckFinding]) -> String {
    markdown(&finding_items(findings))
}

/// DMN or form findings as Slack `mrkdwn`.
pub fn check_findings_to_slack_mrkdwn(findings: &[CheckFinding]) -> String {
    slack(&finding_items(findings))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn findings() -> Vec<CheckFinding> {
        vec![
            CheckFinding {
                rule: "dmn/a".into(),
                severity: CheckSeverity::Error,
                element_id: Some("d1".into()),
                message: "x < y & z > 1".into(),
                fix: "Use <b>".into(),
            },
            CheckFinding {
                rule: "dmn/b".into(),
                severity: CheckSeverity::Warning,
                element_id: None,
                message: "careful".into(),
                fix: String::new(),
            },
        ]
    }

    #[test]
    fn text_snapshot() {
        assert_eq!(
            check_findings_to_text(&findings(), &TextStyle::default()),
            "2 problems: 1 error, 1 warning\n\
             error [dmn/a] x < y & z > 1 (d1)\n  fix: Use <b>\n\
             warning [dmn/b] careful\n"
        );
    }

    #[test]
    fn text_color_and_max() {
        let t = check_findings_to_text(
            &findings(),
            &TextStyle {
                color: true,
                max: 1,
            },
        );
        assert!(t.contains("\x1b[31merror\x1b[0m [dmn/a]"));
        assert!(t.ends_with("... and 1 more\n"));
        assert!(!t.contains("dmn/b"));
    }

    #[test]
    fn markdown_snapshot() {
        assert_eq!(
            check_findings_to_markdown(&findings()),
            "**2 problems: 1 error, 1 warning**\n\n\
             - **error** `dmn/a`: x < y & z > 1 (`d1`)\n  - Fix: Use <b>\n\
             - **warning** `dmn/b`: careful\n"
        );
    }

    #[test]
    fn slack_escapes_control_characters() {
        let s = check_findings_to_slack_mrkdwn(&findings());
        assert!(s.contains("x &lt; y &amp; z &gt; 1"));
        assert!(s.contains("_Fix:_ Use &lt;b&gt;"));
        assert!(!s.contains("<b>"));
    }

    #[test]
    fn empty_report() {
        assert_eq!(
            check_findings_to_text(&[], &TextStyle::default()),
            "No problems found\n"
        );
    }

    #[test]
    fn lint_report_renders() {
        use bpmnkit_bpmn::parse_bpmn;
        let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true"><bpmn:startEvent id="s"/></bpmn:process>
</bpmn:definitions>"#;
        let report = crate::lint::lint_diagram(&parse_bpmn(xml).unwrap(), Default::default());
        assert!(report.total > 0);
        let t = to_text(&report, &TextStyle::default());
        assert!(t.starts_with(&format!("{} problem", report.total)));
        assert!(to_markdown(&report).contains("`p"));
        assert!(!to_slack_mrkdwn(&report).contains('<'));
    }
}
