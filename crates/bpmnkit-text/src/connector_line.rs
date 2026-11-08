//! Port of `bpmn/connector-line.ts`: `with <id>: <alias> <args> | key=value …` lines,
//! read as written; resolving the alias against a connector catalog is not this crate's.

use bpmnkit_bpmn::js::{is_js_space, js_trim};
use serde::{Deserialize, Serialize};

use crate::js_record::JsRecord;
use crate::process_text::ProcessTextProblem;

/// TS's `ConnectorLine`: one `with` line, nothing resolved yet.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConnectorLine {
    /// The node's id as written.
    pub id: String,
    /// The connector alias, lower-cased unless it is a URL.
    pub alias: String,
    /// The words after the alias, before the first `|`.
    pub args: Vec<String>,
    /// `key=value` parts in the order written; a later key wins.
    pub values: JsRecord,
    pub line: u32,
}

fn is_line_terminator(c: char) -> bool {
    matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}

fn is_id_start(c: char) -> bool {
    c.is_ascii_alphabetic() || c == '_'
}

fn is_id_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-')
}

/// TS's `CONNECTOR_LINE` (`/^with\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i`): the id and the body
/// of a `with` line, or `None`.
pub fn match_connector_line(text: &str) -> Option<(&str, &str)> {
    let head = text.get(..4)?;
    if !head.eq_ignore_ascii_case("with") {
        return None;
    }
    let rest = &text[4..];
    let after_ws = rest.trim_start_matches(is_js_space);
    if after_ws.len() == rest.len() {
        return None;
    }
    let mut chars = after_ws.char_indices();
    match chars.next() {
        Some((_, c)) if is_id_start(c) => {}
        _ => return None,
    }
    let id_end = after_ws
        .char_indices()
        .skip(1)
        .find(|&(_, c)| !is_id_char(c))
        .map_or(after_ws.len(), |(i, _)| i);
    let id = &after_ws[..id_end];
    let rest = after_ws[id_end..].trim_start_matches(is_js_space);
    let body = rest.strip_prefix(':')?.trim_start_matches(is_js_space);
    if body.contains(is_line_terminator) {
        return None;
    }
    Some((id, body))
}

/// Splits on `|` outside quotes, brackets, braces and parentheses.
fn split_parts(text: &str) -> Vec<String> {
    let mut parts = vec![];
    let mut depth: u32 = 0;
    let mut quote: Option<char> = None;
    let mut start = 0;
    let mut chars = text.char_indices();
    while let Some((i, ch)) = chars.next() {
        if let Some(q) = quote {
            if ch == '\\' {
                chars.next();
            } else if ch == q {
                quote = None;
            }
        } else if ch == '"' || ch == '\'' {
            quote = Some(ch);
        } else if matches!(ch, '(' | '[' | '{') {
            depth += 1;
        } else if matches!(ch, ')' | ']' | '}') {
            depth = depth.saturating_sub(1);
        } else if ch == '|' && depth == 0 {
            parts.push(text[start..i].to_owned());
            start = i + 1;
        }
    }
    parts.push(text[start..].to_owned());
    parts.iter().map(|p| js_trim(p).to_owned()).collect()
}

/// `/^\s+[A-Za-z_][\w.]*\*?=/` at `s`.
fn starts_pair(s: &str) -> bool {
    let rest = s.trim_start_matches(is_js_space);
    if rest.len() == s.len() {
        return false;
    }
    let mut chars = rest.chars().peekable();
    if !chars.next().is_some_and(is_id_start) {
        return false;
    }
    while chars
        .peek()
        .is_some_and(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '.')
    {
        chars.next();
    }
    if chars.peek() == Some(&'*') {
        chars.next();
    }
    chars.next() == Some('=')
}

/// `a=1 b=2 c==x + 1` split into one part per input, at a space before `key=`, outside
/// quotes and brackets; a FEEL value (`==`) runs to the end of the part.
fn split_pairs(part: &str) -> Vec<String> {
    let mut pairs = vec![];
    let mut depth: u32 = 0;
    let mut quote: Option<char> = None;
    let mut start = 0;
    let mut chars = part.char_indices();
    while let Some((i, ch)) = chars.next() {
        if let Some(q) = quote {
            if ch == '\\' {
                chars.next();
            } else if ch == q {
                quote = None;
            }
        } else if ch == '"' || ch == '\'' {
            quote = Some(ch);
        } else if matches!(ch, '(' | '[' | '{') {
            depth += 1;
        } else if matches!(ch, ')' | ']' | '}') {
            depth = depth.saturating_sub(1);
        } else if ch == '=' && part[i + 1..].starts_with('=') && depth == 0 {
            break;
        } else if is_js_space(ch) && depth == 0 && starts_pair(&part[i..]) {
            pairs.push(part[start..i].to_owned());
            start = i + ch.len_utf8();
        }
    }
    pairs.push(part[start..].to_owned());
    pairs
        .iter()
        .map(|p| js_trim(p).to_owned())
        .filter(|p| !p.is_empty())
        .collect()
}

fn head_words(head: &str) -> Vec<String> {
    let mut words = vec![];
    let mut rest = js_trim(head);
    while !rest.is_empty() {
        if rest.starts_with('=') || rest.starts_with('"') || rest.starts_with('\'') {
            words.push(rest.to_owned());
            break;
        }
        match rest.find(is_js_space) {
            None => {
                words.push(rest.to_owned());
                rest = "";
            }
            Some(space) => {
                words.push(rest[..space].to_owned());
                rest = js_trim(&rest[space..]);
            }
        }
    }
    words
}

/// The first `n` UTF-16 units of `s` (JS `s.slice(0, n)`); a pair `n` would split is left
/// out whole, as Rust cannot hold the lone surrogate JS would keep.
fn utf16_prefix(s: &str, n: usize) -> &str {
    let mut units = 0;
    for (i, c) in s.char_indices() {
        units += c.len_utf16();
        if units > n {
            return &s[..i];
        }
    }
    s
}

fn is_key(key: &str) -> bool {
    !key.is_empty()
        && key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | ':' | '$' | '-'))
}

/// TS's `parseConnectorLine`: the `with` line `text`, or `None` when it is not one. Never
/// fails: what cannot be read becomes a problem on `line`.
pub fn parse_connector_line(
    text: &str,
    line: u32,
    problems: &mut Vec<ProcessTextProblem>,
) -> Option<ConnectorLine> {
    let (id, body) = match_connector_line(js_trim(text))?;
    let mut parts = split_parts(body).into_iter();
    let head = parts.next().unwrap_or_default();
    let mut words = head_words(&head).into_iter();
    let Some(alias) = words.next() else {
        problems.push(ProcessTextProblem {
            line,
            message: format!("\"with {id}:\" names no connector; ignored"),
        });
        return None;
    };
    let args: Vec<String> = words.collect();
    let mut values = JsRecord::new();
    for part in parts.flat_map(|p| split_pairs(&p)) {
        let eq = part.find('=');
        let key = eq.map_or(String::new(), |eq| {
            let key = js_trim(&part[..eq]);
            key.strip_suffix('*').unwrap_or(key).to_owned()
        });
        if eq.is_none_or(|eq| eq == 0) || !is_key(&key) {
            problems.push(ProcessTextProblem {
                line,
                message: format!(
                    "expected \"key=value\" at \"{}\"; ignored",
                    utf16_prefix(&part, 30)
                ),
            });
            continue;
        }
        let eq = eq.unwrap_or_default();
        values.insert(key, js_trim(&part[eq + 1..]));
    }
    let is_url = {
        let lower = alias.to_ascii_lowercase();
        lower.starts_with("http://") || lower.starts_with("https://")
    };
    Some(ConnectorLine {
        id: id.to_owned(),
        alias: if is_url { alias } else { alias.to_lowercase() },
        args,
        values,
        line,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_with_line() {
        let mut problems = vec![];
        let line = parse_connector_line(
            "with post: Slack chat.postMessage | data.channel=#ops data.text== \"a\" + b | bad",
            3,
            &mut problems,
        )
        .unwrap();
        assert_eq!(line.id, "post");
        assert_eq!(line.alias, "slack");
        assert_eq!(line.args, ["chat.postMessage"]);
        assert_eq!(
            line.values.entries(),
            [
                (&"data.channel".to_owned(), &"#ops".to_owned()),
                (&"data.text".to_owned(), &"= \"a\" + b".to_owned()),
            ]
        );
        assert_eq!(problems.len(), 1);
        assert_eq!(
            problems[0].message,
            "expected \"key=value\" at \"bad\"; ignored"
        );
    }

    #[test]
    fn not_a_with_line() {
        assert_eq!(match_connector_line("without: x"), None);
        assert_eq!(
            match_connector_line("WITH a.b-c :  x y"),
            Some(("a.b-c", "x y"))
        );
        assert_eq!(match_connector_line("with a: x\ny"), None);
    }
}
