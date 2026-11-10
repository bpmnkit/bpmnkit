//! A short, chat-ready description of a [`BpmnDiff`].

use crate::diff::{BpmnDiff, ChangeKind, ElementChange};
use crate::js::stringify;
use serde_json::Value;

/// How [`diff_to_text`] writes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiffTextOptions {
    /// Markdown (bold summary, bullets, code spans) instead of plain text.
    pub markdown: bool,
    /// Field changes shown per changed element before "… and n more". `0` shows none.
    pub max_fields: usize,
}

impl Default for DiffTextOptions {
    fn default() -> Self {
        Self {
            markdown: false,
            max_fields: 5,
        }
    }
}

/// Longest value shown inline, in characters.
const VALUE_WIDTH: usize = 60;

fn show(v: Option<&Value>) -> String {
    let Some(v) = v else {
        return "(none)".into();
    };
    let s = stringify(v);
    if s.chars().count() > VALUE_WIDTH {
        format!("{}…", s.chars().take(VALUE_WIDTH).collect::<String>())
    } else {
        s
    }
}

fn label(c: &ElementChange, markdown: bool) -> String {
    let name = c.name_after.as_ref().or(c.name_before.as_ref());
    let id = if markdown {
        format!("`{}`", c.id)
    } else {
        c.id.clone()
    };
    let mut out = String::new();
    if let Some(t) = &c.element_type {
        out.push_str(t);
        out.push(' ');
    }
    out.push_str(&id);
    if let Some(n) = name {
        out.push_str(&format!(" \"{n}\""));
    }
    if c.kind == ChangeKind::Changed {
        if let (Some(b), Some(a)) = (&c.name_before, &c.name_after) {
            if b != a {
                return format!("{out} (was \"{b}\")");
            }
        }
    }
    out
}

/// Describes a diff in text, one line per element, for chat surfaces (no HTML).
pub fn diff_to_text(diff: &BpmnDiff, opts: &DiffTextOptions) -> String {
    let s = &diff.summary;
    if s.total == 0 {
        return if diff.before_hash == diff.after_hash {
            "No changes: the models are semantically identical.".into()
        } else {
            "No element changes (the models differ outside any element).".into()
        };
    }
    let counts = format!(
        "{} added, {} removed, {} changed, {} moved",
        s.added, s.removed, s.changed, s.moved
    );
    let noun = if s.total == 1 { "change" } else { "changes" };
    let mut out = if opts.markdown {
        format!("**{} {noun}**: {counts}\n", s.total)
    } else {
        format!("{} {noun}: {counts}\n", s.total)
    };
    let bullet = if opts.markdown { "- " } else { "" };
    for c in &diff.changes {
        let (sign, word) = match c.kind {
            ChangeKind::Added => ("+", "added"),
            ChangeKind::Removed => ("-", "removed"),
            ChangeKind::Changed => ("~", "changed"),
            ChangeKind::Moved => (">", "moved"),
        };
        let mark = if opts.markdown {
            format!("**{word}**")
        } else {
            sign.to_string()
        };
        out.push_str(&format!("{bullet}{mark} {}\n", label(c, opts.markdown)));
        let pad = if opts.markdown { "  " } else { "    " };
        for f in c.fields.iter().take(opts.max_fields) {
            let path = if opts.markdown {
                format!("`{}`", f.path)
            } else {
                f.path.clone()
            };
            out.push_str(&format!(
                "{pad}{path}: {} → {}\n",
                show(f.before.as_ref()),
                show(f.after.as_ref())
            ));
        }
        if c.fields.len() > opts.max_fields {
            out.push_str(&format!(
                "{pad}… and {} more\n",
                c.fields.len() - opts.max_fields
            ));
        }
    }
    out
}
