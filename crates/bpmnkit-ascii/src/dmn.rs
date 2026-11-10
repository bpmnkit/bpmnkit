//! Twin of `packages/ascii/src/dmn.ts`: each decision table as a double-line box table.

use crate::js::{self, u, U16s};
use crate::{titled, AsciiOptions};
use bpmnkit_dmn::{DmnDecisionTable, DmnDefinitions};

pub(crate) fn render(defs: &DmnDefinitions, options: &AsciiOptions) -> U16s {
    let blocks: Vec<U16s> = defs
        .decisions
        .iter()
        .filter_map(|d| Some(table(d.name.as_deref(), d.decision_table.as_ref()?)))
        .collect();
    if blocks.is_empty() {
        return u("(no decision tables)");
    }
    let body = blocks.join(&u("\n\n")[..]);
    titled(options, Some(&defs.name), body)
}

/// `pad(s, w)`: cut or space-fill to exactly `w` units.
fn pad(s: &[u16], w: i64) -> U16s {
    if js::len(s) >= w {
        js::head(s, w).to_vec()
    } else {
        js::pad_end(s, w)
    }
}

fn cell(s: &[u16], w: i64) -> U16s {
    let mut out = u(" ");
    out.extend(pad(s, w));
    out.push(b' ' as u16);
    out
}

fn concat(parts: &[&[u16]]) -> U16s {
    parts.concat()
}

fn row(cells: &[U16s]) -> U16s {
    let v = u("║");
    concat(&[&v, &cells.join(&v[..]), &v])
}

fn border(bars: &[U16s], left: &str, mid: &str, right: &str) -> U16s {
    concat(&[&u(left), &bars.join(&u(mid)[..]), &u(right)])
}

fn table(name: Option<&str>, t: &DmnDecisionTable) -> U16s {
    let rules = &t.rules;
    let num_w = (rules.len().to_string().len() as i64).max(1);

    let input_headers: Vec<U16s> = t
        .inputs
        .iter()
        .enumerate()
        .map(|(i, inp)| {
            u(inp
                .label
                .as_deref()
                .or(inp.input_expression.text.as_deref())
                .map_or_else(|| format!("In{i}"), str::to_owned)
                .as_str())
        })
        .collect();
    let output_headers: Vec<U16s> = t
        .outputs
        .iter()
        .enumerate()
        .map(|(i, out)| {
            u(out
                .label
                .as_deref()
                .or(out.name.as_deref())
                .map_or_else(|| format!("Out{i}"), str::to_owned)
                .as_str())
        })
        .collect();
    let width = |header: &U16s, entry: &dyn Fn(usize) -> Option<i64>| {
        let entries = (0..rules.len())
            .map(|r| entry(r).unwrap_or(0))
            .max()
            .unwrap_or(0);
        js::len(header).max(entries).max(4)
    };
    let input_widths: Vec<i64> = input_headers
        .iter()
        .enumerate()
        .map(|(i, h)| {
            width(h, &|r| {
                rules[r].input_entries.get(i).map(|e| js::len(&u(&e.text)))
            })
        })
        .collect();
    let output_widths: Vec<i64> = output_headers
        .iter()
        .enumerate()
        .map(|(i, h)| {
            width(h, &|r| {
                rules[r].output_entries.get(i).map(|e| js::len(&u(&e.text)))
            })
        })
        .collect();

    let policy = t.hit_policy.as_deref().unwrap_or("UNIQUE");
    let aggregation = t.aggregation.as_deref().filter(|a| !a.is_empty());
    let mut policy_label = u(policy);
    if let Some(a) = aggregation {
        policy_label.push(b'(' as u16);
        policy_label.extend(js::head(&u(a), 1));
        policy_label.push(b')' as u16);
    }

    let bars: Vec<U16s> = std::iter::once(num_w)
        .chain(input_widths.iter().copied())
        .chain(output_widths.iter().copied())
        .map(|w| js::repeat("═", w + 2))
        .collect();

    let mut lines: Vec<U16s> = vec![];
    let title = u(name.filter(|n| !n.is_empty()).unwrap_or("Decision"));
    let hit_line = match aggregation {
        Some(a) => u(&format!(" [{policy}/{a}]")),
        None => u(&format!(" [{policy}]")),
    };
    lines.push(concat(&[&title, &hit_line]));
    lines.push(js::repeat("─", js::len(&title) + js::len(&hit_line)));
    lines.push(vec![]);
    lines.push(border(&bars, "╔", "╦", "╗"));

    let mut header = vec![cell(&pad(&policy_label, num_w), num_w)];
    header.extend(
        input_headers
            .iter()
            .zip(&input_widths)
            .map(|(h, &w)| cell(h, w)),
    );
    header.extend(
        output_headers
            .iter()
            .zip(&output_widths)
            .map(|(h, &w)| cell(h, w)),
    );
    lines.push(row(&header));
    lines.push(border(&bars, "╠", "╬", "╣"));

    if rules.is_empty() {
        let empty_w = bars.iter().map(|b| js::len(b)).sum::<i64>() + bars.len() as i64 - 1;
        let v = u("║ ");
        let v_end = u(" ║");
        lines.push(concat(&[&v, &pad(&u("(no rules)"), empty_w), &v_end]));
    } else {
        for (r, rule) in rules.iter().enumerate() {
            let entry = |list: &Vec<bpmnkit_dmn::DmnEntry>, i: usize| {
                u(list.get(i).map_or("", |e| e.text.as_str()))
            };
            let mut cells = vec![cell(&u(&(r + 1).to_string()), num_w)];
            cells.extend(
                input_widths
                    .iter()
                    .enumerate()
                    .map(|(i, &w)| cell(&entry(&rule.input_entries, i), w)),
            );
            cells.extend(
                output_widths
                    .iter()
                    .enumerate()
                    .map(|(i, &w)| cell(&entry(&rule.output_entries, i), w)),
            );
            lines.push(row(&cells));
        }
    }
    lines.push(border(&bars, "╚", "╩", "╝"));
    js::join_lines(&lines)
}
