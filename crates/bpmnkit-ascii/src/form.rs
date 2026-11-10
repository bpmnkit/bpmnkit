//! Twin of `packages/ascii/src/form.ts`: a text mock-up of each component in order.

use crate::js::{self, u, U16s};
use crate::{titled, AsciiOptions};
use bpmnkit_form::{ComponentKind, FormComponent, FormDefinition, FormValidation, FormValueOption};

/// Inner content width.
const WIDTH: i64 = 48;

pub(crate) fn render(form: &FormDefinition, options: &AsciiOptions) -> U16s {
    let mut lines: Vec<U16s> = vec![];
    for comp in &form.components {
        component(comp, 0, &mut lines);
        lines.push(vec![]);
    }
    while lines.last().is_some_and(Vec::is_empty) {
        lines.pop();
    }
    titled(options, Some(&form.id), js::join_lines(&lines))
}

fn required(validate: &Option<FormValidation>) -> &'static str {
    if validate.as_ref().and_then(|v| v.required) == Some(true) {
        " *"
    } else {
        ""
    }
}

fn container(
    indent: &str,
    label: &str,
    children: &[FormComponent],
    depth: usize,
    out: &mut Vec<U16s>,
) {
    let fill = js::repeat("─", (WIDTH - js::len(&u(label)) - 4).max(0));
    out.push([u(&format!("{indent}┌─ {label} ")), fill, u("┐")].concat());
    for child in children {
        component(child, depth + 1, out);
    }
    out.push([u(&format!("{indent}└")), js::repeat("─", WIDTH - 1), u("┘")].concat());
}

fn options(indent: &str, values: &Option<Vec<FormValueOption>>, mark: &str, out: &mut Vec<U16s>) {
    match values {
        Some(values) => {
            for opt in values {
                out.push(u(&format!("{indent}  {mark} {}", opt.label)));
            }
        }
        None => out.push(u(&format!("{indent}  {mark} (dynamic options)"))),
    }
}

fn component(c: &FormComponent, depth: usize, out: &mut Vec<U16s>) {
    let indent = "  ".repeat(depth);
    let indent = indent.as_str();
    let mut line = |s: String| out.push(u(&s));
    match &c.kind {
        ComponentKind::Text(k) => {
            for l in k.text.split('\n') {
                line(format!("{indent}{l}"));
            }
        }
        ComponentKind::Textfield(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            line(format!("{indent}[ ______________________ ]"));
        }
        ComponentKind::Textarea(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            line(format!("{indent}┌──────────────────────┐"));
            line(format!("{indent}│                      │"));
            line(format!("{indent}│                      │"));
            line(format!("{indent}└──────────────────────┘"));
        }
        ComponentKind::Number(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            line(format!("{indent}[ 0 ▲▼ ]"));
        }
        ComponentKind::Datetime(k) => {
            let label = k
                .date_label
                .as_deref()
                .or(k.time_label.as_deref())
                .unwrap_or("Date/Time");
            line(format!("{indent}{label}{}", required(&k.validate)));
            line(format!("{indent}[ YYYY-MM-DD ]  [ HH:MM ]"));
        }
        ComponentKind::Select(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            line(format!("{indent}[ ▼ Select...            ]"));
        }
        ComponentKind::Taglist(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            line(format!("{indent}[ × Tag1  × Tag2  +Add  ]"));
        }
        ComponentKind::Radio(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            options(indent, &k.values, "○", out);
        }
        ComponentKind::Checkbox(k) => {
            line(format!("{indent}☐  {}{}", k.label, required(&k.validate)));
        }
        ComponentKind::Checklist(k) => {
            line(format!("{indent}{}{}", k.label, required(&k.validate)));
            options(indent, &k.values, "☐ ", out);
        }
        ComponentKind::Button(k) => line(format!("{indent}[  {}  ]", k.label)),
        ComponentKind::Separator => line(format!("{indent}{}", "─".repeat(WIDTH as usize))),
        ComponentKind::Spacer(_) => line(String::new()),
        ComponentKind::Group(k) => container(indent, &k.label, &k.components, depth, out),
        ComponentKind::DynamicList(k) => {
            let label = k.label.as_deref().unwrap_or("List");
            container(indent, label, &k.components, depth, out);
            out.push(u(&format!("{indent}  [+ Add item]")));
        }
        ComponentKind::Table(k) => {
            let cols = k.columns.as_deref().unwrap_or_default();
            if cols.is_empty() {
                let label = k.label.as_deref().unwrap_or("(no label)");
                line(format!("{indent}[ Table: {label} ]"));
            } else {
                let n = cols.len() as i64;
                let w = 8.max((WIDTH - n - 1).div_euclid(n));
                let bar = js::repeat("─", w);
                let bars = |l: &str, m: &str, r: &str| -> U16s {
                    let parts: Vec<U16s> = cols.iter().map(|_| bar.clone()).collect();
                    [u(indent), u(l), parts.join(&u(m)[..]), u(r)].concat()
                };
                let label = k
                    .label
                    .as_deref()
                    .filter(|l| !l.is_empty())
                    .unwrap_or("Table");
                out.push(u(&format!("{indent}{label}")));
                out.push(bars("┌", "┬", "┐"));
                let heads: Vec<U16s> = cols
                    .iter()
                    .map(|c| js::pad_end(js::head(&u(&c.label), w), w))
                    .collect();
                out.push([u(&format!("{indent}│")), heads.join(&u("│")[..]), u("│")].concat());
                out.push(bars("├", "┼", "┤"));
                let blanks: Vec<U16s> = cols.iter().map(|_| js::repeat(" ", w)).collect();
                out.push([u(&format!("{indent}│")), blanks.join(&u("│")[..]), u("│")].concat());
                out.push(bars("└", "┴", "┘"));
            }
        }
        ComponentKind::Image(k) => {
            line(format!(
                "{indent}[ 🖼  {} ]",
                k.alt.as_deref().unwrap_or("Image")
            ));
        }
        ComponentKind::Iframe(k) => {
            line(format!(
                "{indent}[ iframe: {} ]",
                k.url.as_deref().unwrap_or("(url)")
            ));
        }
        ComponentKind::Html(_) => line(format!("{indent}[ HTML content ]")),
        ComponentKind::Expression(k) => {
            line(format!(
                "{indent}[ expr: {} ]",
                k.expression.as_deref().unwrap_or("")
            ));
        }
        ComponentKind::Filepicker(k) => {
            line(format!("{indent}{}", k.label.as_deref().unwrap_or("File")));
            line(format!("{indent}[ 📎 Choose file... ]"));
        }
        ComponentKind::DocumentPreview(k) => {
            line(format!(
                "{indent}[ 📄 {} ]",
                k.label.as_deref().unwrap_or("Document")
            ));
        }
        ComponentKind::Unknown(k) => line(format!("{indent}[ {} ]", k.type_)),
    }
}
