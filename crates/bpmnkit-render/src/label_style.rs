//! Port of `packages/core/src/bpmn/label-style.ts`: `bpmndi:BPMNLabelStyle` fonts.

use bpmnkit_bpmn::js::{js_number, js_trim};
use bpmnkit_bpmn::{BpmnDefinitions, BpmnDiLabel, XmlElement};
use std::collections::HashMap;

/// The `dc:Font` of a label style; unset fields take the renderer default.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct LabelFont {
    name: Option<String>,
    size: Option<f64>,
    is_bold: Option<bool>,
    is_italic: Option<bool>,
    is_underline: Option<bool>,
    is_strike_through: Option<bool>,
}

/// CSS values for a resolved label font.
#[derive(Debug, Clone, PartialEq)]
pub(crate) struct LabelFontCss {
    pub family: String,
    pub size: f64,
    pub bold: bool,
    pub italic: bool,
    /// `none`, `underline`, `line-through` or both.
    pub decoration: String,
}

pub(crate) type LabelStyles = HashMap<String, LabelFont>;

fn local_name(name: &str) -> &str {
    name.find(':').map_or(name, |i| &name[i + 1..])
}

fn parse_bool(v: Option<&String>) -> Option<bool> {
    match v.map(String::as_str) {
        Some("true" | "1") => Some(true),
        Some("false" | "0") => Some(false),
        _ => None,
    }
}

fn parse_font(style: &XmlElement) -> LabelFont {
    let Some(font) = style
        .children
        .iter()
        .find(|c| local_name(&c.name) == "Font")
    else {
        return LabelFont::default();
    };
    let a = &font.attributes;
    let name = a.get("name").map(|n| js_trim(n)).filter(|n| !n.is_empty());
    let size = a.get("size").map_or(f64::NAN, |s| js_number(s));
    LabelFont {
        name: name.map(str::to_owned),
        size: (size.is_finite() && size > 0.0).then_some(size),
        is_bold: parse_bool(a.get("isBold")),
        is_italic: parse_bool(a.get("isItalic")),
        is_underline: parse_bool(a.get("isUnderline")),
        is_strike_through: parse_bool(a.get("isStrikeThrough")),
    }
}

/// Every `BPMNLabelStyle` of every diagram, by id (a label may use another diagram's style).
pub(crate) fn collect_label_styles(defs: &BpmnDefinitions) -> LabelStyles {
    let mut styles = LabelStyles::new();
    for diagram in &defs.diagrams {
        for child in &diagram.unknown_children {
            if local_name(&child.name) != "BPMNLabelStyle" {
                continue;
            }
            if let Some(id) = child.attributes.get("id").filter(|id| !id.is_empty()) {
                styles.insert(id.clone(), parse_font(child));
            }
        }
    }
    styles
}

/// The style a label's `labelStyle` (a QName: the local part is the fallback) points at.
pub(crate) fn resolve_label_font<'a>(
    label: Option<&BpmnDiLabel>,
    styles: &'a LabelStyles,
) -> Option<&'a LabelFont> {
    let r = label?
        .unknown_attributes
        .as_ref()?
        .get("labelStyle")
        .map(|r| js_trim(r))?;
    if r.is_empty() {
        return None;
    }
    styles.get(r).or_else(|| styles.get(local_name(r)))
}

const GENERIC_FAMILIES: [&str; 13] = [
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-serif",
    "ui-sans-serif",
    "ui-monospace",
    "ui-rounded",
    "math",
    "emoji",
    "fangsong",
];

fn css_family(family: &str) -> String {
    let lower = family.to_lowercase();
    if GENERIC_FAMILIES.contains(&lower.as_str()) {
        return lower;
    }
    let mut out = String::with_capacity(family.len() + 2);
    out.push('"');
    for c in family.chars() {
        match c {
            '\\' | '"' => {
                out.push('\\');
                out.push(c);
            }
            '\n' | '\r' | '\u{c}' => out.push(' '),
            _ => out.push(c),
        }
    }
    out.push('"');
    out
}

/// JS `f.replace(/^(["'])(.*)\1$/, "$2")`: `.` stops at line terminators.
fn unquote(f: &str) -> &str {
    let bytes = f.as_bytes();
    if bytes.len() >= 2 {
        let q = bytes[0];
        if (q == b'"' || q == b'\'') && bytes[bytes.len() - 1] == q {
            let inner = &f[1..f.len() - 1];
            if !inner.contains(['\n', '\r', '\u{2028}', '\u{2029}']) {
                return inner;
            }
        }
    }
    f
}

/// The file's families (quoted) in front of `default_family`; missing fields take defaults.
pub(crate) fn label_font_css(
    font: Option<&LabelFont>,
    default_family: &str,
    default_size: f64,
) -> LabelFontCss {
    let name = font.and_then(|f| f.name.as_deref()).unwrap_or("");
    let mut families: Vec<String> = name
        .split(',')
        .map(|f| unquote(js_trim(f)))
        .filter(|f| !f.is_empty())
        .map(css_family)
        .collect();
    families.push(default_family.to_owned());
    let flag = |get: fn(&LabelFont) -> Option<bool>| font.and_then(get).unwrap_or(false);
    let mut decorations = vec![];
    if flag(|f| f.is_underline) {
        decorations.push("underline");
    }
    if flag(|f| f.is_strike_through) {
        decorations.push("line-through");
    }
    LabelFontCss {
        family: families.join(", "),
        size: font.and_then(|f| f.size).unwrap_or(default_size),
        bold: flag(|f| f.is_bold),
        italic: flag(|f| f.is_italic),
        decoration: if decorations.is_empty() {
            "none".into()
        } else {
            decorations.join(" ")
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn families_are_quoted_and_generics_lowered() {
        let font = LabelFont {
            name: Some("'Open Sans', SERIF, a\"b".into()),
            size: Some(13.0),
            is_bold: Some(true),
            is_underline: Some(true),
            is_strike_through: Some(true),
            ..LabelFont::default()
        };
        let css = label_font_css(Some(&font), "sans-serif", 11.0);
        assert_eq!(css.family, "\"Open Sans\", serif, \"a\\\"b\", sans-serif");
        assert_eq!(css.size, 13.0);
        assert!(css.bold && !css.italic);
        assert_eq!(css.decoration, "underline line-through");
    }

    #[test]
    fn unquote_needs_matching_quotes() {
        assert_eq!(unquote("\"x\""), "x");
        assert_eq!(unquote("'x\""), "'x\"");
        assert_eq!(unquote("\""), "\"");
        assert_eq!(unquote("\"a\nb\""), "\"a\nb\"");
    }
}
