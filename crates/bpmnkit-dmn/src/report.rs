//! Decision results for people: plain text (terminals, logs), a Markdown table (PR comments)
//! and Slack `mrkdwn`, in the style of `bpmnkit_lint::report`. Pure string building.
//!
//! A table decision's result is a context (one hit, one entry per output), a list of contexts
//! (`COLLECT`, `RULE ORDER`, ...) or a single value (one output column, or `COLLECT` with an
//! aggregation). Contexts become rows, the union of their keys the columns.
//!
//! ```
//! use bpmnkit_dmn::report::{result_to_markdown, result_to_text};
//! use bpmnkit_feel::{evaluate, Context};
//!
//! let result = evaluate(r#"[{grade: "A", limit: 100}, {grade: "B", limit: 50}]"#, &Context::new()).unwrap();
//! assert_eq!(result_to_text("Grade", &result), "Grade (2 results)\n  1. grade: A, limit: 100\n  2. grade: B, limit: 50\n");
//! assert!(result_to_markdown("Grade", &result).contains("| grade | limit |"));
//! ```

use std::fmt::Write as _;

use bpmnkit_feel::Value;

/// A result in the shape it is shown in.
enum Shape<'a> {
    /// No rule matched, or the value is null.
    Empty,
    /// One value: a scalar or a list of scalars.
    Scalar(&'a Value),
    /// Rows with named cells.
    Rows(Vec<Vec<(&'a str, &'a Value)>>),
}

fn shape(result: &Value) -> Shape<'_> {
    match result {
        Value::Null => Shape::Empty,
        Value::List(items) if items.is_empty() => Shape::Empty,
        Value::Context(c) => Shape::Rows(vec![c.iter().map(|(k, v)| (k.as_str(), v)).collect()]),
        Value::List(items) if items.iter().all(|i| matches!(i, Value::Context(_))) => Shape::Rows(
            items
                .iter()
                .filter_map(|i| match i {
                    Value::Context(c) => Some(c.iter().map(|(k, v)| (k.as_str(), v)).collect()),
                    _ => None,
                })
                .collect(),
        ),
        other => Shape::Scalar(other),
    }
}

/// How one value reads in a cell or after a label: strings unquoted, null as `null`.
fn cell(v: &Value) -> String {
    v.to_string()
}

/// The columns of `rows`: every key, in order of first appearance.
fn columns<'a>(rows: &[Vec<(&'a str, &'a Value)>]) -> Vec<&'a str> {
    let mut cols: Vec<&str> = Vec::new();
    for row in rows {
        for (k, _) in row {
            if !cols.contains(k) {
                cols.push(k);
            }
        }
    }
    cols
}

fn lookup(row: &[(&str, &Value)], col: &str) -> String {
    row.iter()
        .find(|(k, _)| *k == col)
        .map_or_else(|| "null".to_owned(), |(_, v)| cell(v))
}

fn count_label(n: usize) -> String {
    format!("{n} result{}", if n == 1 { "" } else { "s" })
}

/// A decision result as plain text: `Title: value` for one value, otherwise a numbered list
/// of `key: value` rows.
pub fn result_to_text(title: &str, result: &Value) -> String {
    match shape(result) {
        Shape::Empty => format!("{title}: no result\n"),
        Shape::Scalar(v) => format!("{title}: {}\n", cell(v)),
        Shape::Rows(rows) if rows.len() == 1 => {
            let mut out = format!("{title}\n");
            for (k, v) in &rows[0] {
                let _ = writeln!(out, "  {k}: {}", cell(v));
            }
            out
        }
        Shape::Rows(rows) => {
            let mut out = format!("{title} ({})\n", count_label(rows.len()));
            for (i, row) in rows.iter().enumerate() {
                let cells: Vec<String> = row
                    .iter()
                    .map(|(k, v)| format!("{k}: {}", cell(v)))
                    .collect();
                let _ = writeln!(out, "  {}. {}", i + 1, cells.join(", "));
            }
            out
        }
    }
}

fn md_escape(s: &str) -> String {
    s.replace('|', "\\|").replace(['\n', '\r'], " ")
}

/// A decision result as Markdown: a bold `Title` line, then a table with one row per hit
/// (or `**Title:** value` for a single value).
pub fn result_to_markdown(title: &str, result: &Value) -> String {
    let title = md_escape(title);
    match shape(result) {
        Shape::Empty => format!("**{title}:** no result\n"),
        Shape::Scalar(v) => format!("**{title}:** `{}`\n", cell(v).replace('`', "'")),
        Shape::Rows(rows) => {
            let cols = columns(&rows);
            let mut out = format!(
                "**{title}**\n\n| {} |\n|",
                cols.iter()
                    .map(|c| md_escape(c))
                    .collect::<Vec<_>>()
                    .join(" | ")
            );
            for _ in &cols {
                out.push_str(" --- |");
            }
            out.push('\n');
            for row in &rows {
                let cells: Vec<String> = cols.iter().map(|c| md_escape(&lookup(row, c))).collect();
                let _ = writeln!(out, "| {} |", cells.join(" | "));
            }
            out
        }
    }
}

/// Slack escapes only these three characters.
fn slack_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// A decision result as Slack `mrkdwn`, which has no tables: a bold title, then the rows
/// aligned in a code block (`<`, `>` and `&` escaped).
pub fn result_to_slack_mrkdwn(title: &str, result: &Value) -> String {
    let title = slack_escape(title);
    match shape(result) {
        Shape::Empty => format!("*{title}:* no result\n"),
        Shape::Scalar(v) => format!(
            "*{title}:* `{}`\n",
            slack_escape(&cell(v)).replace('`', "'")
        ),
        Shape::Rows(rows) => {
            let cols = columns(&rows);
            let grid: Vec<Vec<String>> = rows
                .iter()
                .map(|r| {
                    cols.iter()
                        .map(|c| slack_escape(&lookup(r, c)).replace(['\n', '\r'], " "))
                        .collect()
                })
                .collect();
            let heads: Vec<String> = cols.iter().map(|c| slack_escape(c)).collect();
            let widths: Vec<usize> = (0..cols.len())
                .map(|i| {
                    grid.iter()
                        .map(|r| r[i].chars().count())
                        .chain([heads[i].chars().count()])
                        .max()
                        .unwrap_or(0)
                })
                .collect();
            let line = |cells: &[String]| {
                let padded: Vec<String> = cells
                    .iter()
                    .zip(&widths)
                    .map(|(c, w)| format!("{c:<w$}"))
                    .collect();
                format!("{}\n", padded.join("  ").trim_end())
            };
            let mut out = format!("*{title}*\n```\n{}", line(&heads));
            for r in &grid {
                out.push_str(&line(r));
            }
            out.push_str("```\n");
            out
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bpmnkit_feel::{evaluate, Context};

    fn v(src: &str) -> Value {
        evaluate(src, &Context::new()).unwrap()
    }

    #[test]
    fn scalar_and_empty() {
        assert_eq!(result_to_text("Risk", &v(r#""high""#)), "Risk: high\n");
        assert_eq!(result_to_text("Risk", &Value::Null), "Risk: no result\n");
        assert_eq!(result_to_text("Risk", &v("[]")), "Risk: no result\n");
        assert_eq!(result_to_markdown("Risk", &v("42")), "**Risk:** `42`\n");
        assert_eq!(
            result_to_slack_mrkdwn("Risk", &v(r#""a<b""#)),
            "*Risk:* `a&lt;b`\n"
        );
        assert_eq!(result_to_text("L", &v(r#"[1, "x"]"#)), "L: [1, \"x\"]\n");
    }

    #[test]
    fn single_hit() {
        let r = v(r#"{a: 1, b: "x"}"#);
        assert_eq!(result_to_text("D", &r), "D\n  a: 1\n  b: x\n");
        assert_eq!(
            result_to_markdown("D", &r),
            "**D**\n\n| a | b |\n| --- | --- |\n| 1 | x |\n"
        );
    }

    #[test]
    fn many_hits_union_columns() {
        let r = v(r#"[{a: 1}, {a: 2, b: "p|q"}]"#);
        assert_eq!(
            result_to_text("D", &r),
            "D (2 results)\n  1. a: 1\n  2. a: 2, b: p|q\n"
        );
        assert_eq!(
            result_to_markdown("D", &r),
            "**D**\n\n| a | b |\n| --- | --- |\n| 1 | null |\n| 2 | p\\|q |\n"
        );
        assert_eq!(
            result_to_slack_mrkdwn("D", &r),
            "*D*\n```\na  b\n1  null\n2  p|q\n```\n"
        );
    }
}
