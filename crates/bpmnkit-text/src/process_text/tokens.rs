//! Port of `bpmn/process-text.ts` lines 115–457 and 890–997: the kind words, the line
//! patterns, and the helpers that read one path line.
//!
//! Porter notes:
//! - Offsets here are byte offsets into `&str`. TS indexes UTF-16 units; that is only
//!   visible where TS cuts text for a message (`text.slice(i, i + 20)`: 20 UTF-16 units).
//! - JS regexes without the `u` flag: `\w`, `\d`, `\b` are ASCII; `\s` and `trim()` are the
//!   JS whitespace set (`bpmnkit_bpmn::js::is_js_space`), which is not Rust's; `.` stops
//!   at `\n`, `\r`, U+2028, U+2029; `/i` folds case. With the `regex` crate write
//!   `(?-u:\w)`, `(?-u:\b)`, an explicit JS-space class instead of `\s`, and keep patterns
//!   in `std::sync::LazyLock<Regex>`. Hand-written scanners are fine where clearer.
//! - [`kind`]/[`alias`] are own-key lookups, as TS's `kindOf` / `Object.hasOwn(KINDS, …)`:
//!   `constructor`, `toString` and the rest of `Object.prototype` are not kind words.
//! - `typeFromId` and `nameFromId` are used by `assemble`; `nameFromId` lower-cases with
//!   JS `toLowerCase` (Unicode) and upper-cases the first UTF-16 unit with `toUpperCase`.

use std::sync::LazyLock;

use bpmnkit_bpmn::js::{is_js_space, js_trim};
use bpmnkit_bpmn::BpmnElementType;
use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::compact::CompactElement;

/// TS's `KINDS`: the kind word a declaration starts with, and the type it means.
pub const KINDS: [(&str, BpmnElementType); 19] = {
    use BpmnElementType as T;
    [
        ("start", T::StartEvent),
        ("end", T::EndEvent),
        ("task", T::Task),
        ("user", T::UserTask),
        ("service", T::ServiceTask),
        ("rule", T::BusinessRuleTask),
        ("send", T::SendTask),
        ("receive", T::ReceiveTask),
        ("script", T::ScriptTask),
        ("manual", T::ManualTask),
        ("call", T::CallActivity),
        ("adhoc", T::AdHocSubProcess),
        ("xor", T::ExclusiveGateway),
        ("and", T::ParallelGateway),
        ("or", T::InclusiveGateway),
        ("eventgw", T::EventBasedGateway),
        ("catch", T::IntermediateCatchEvent),
        ("throw", T::IntermediateThrowEvent),
        ("boundary", T::BoundaryEvent),
    ]
};

/// TS's `ALIASES`: kind words models write instead, accepted without a problem.
pub const ALIASES: [(&str, BpmnElementType); 8] = {
    use BpmnElementType as T;
    [
        ("event", T::IntermediateCatchEvent),
        ("parallel", T::ParallelGateway),
        ("exclusive", T::ExclusiveGateway),
        ("gateway", T::ExclusiveGateway),
        ("inclusive", T::InclusiveGateway),
        ("decision", T::BusinessRuleTask),
        ("dmn", T::BusinessRuleTask),
        ("human", T::UserTask),
    ]
};

/// TS's `TRIGGERS`: the event triggers a `kind:trigger` may name.
pub const TRIGGERS: [&str; 10] = [
    "timer",
    "message",
    "signal",
    "error",
    "escalation",
    "terminate",
    "conditional",
    "compensate",
    "link",
    "cancel",
];

/// TS's `EVENTS`.
pub(crate) const EVENTS: [BpmnElementType; 5] = [
    BpmnElementType::StartEvent,
    BpmnElementType::EndEvent,
    BpmnElementType::IntermediateCatchEvent,
    BpmnElementType::IntermediateThrowEvent,
    BpmnElementType::BoundaryEvent,
];

/// TS's `GATEWAYS` (no complex gateway).
pub(crate) const GATEWAYS: [BpmnElementType; 4] = [
    BpmnElementType::ExclusiveGateway,
    BpmnElementType::ParallelGateway,
    BpmnElementType::InclusiveGateway,
    BpmnElementType::EventBasedGateway,
];

/// TS's `CONDITIONAL`: gateways whose outgoing flows carry conditions and a default.
pub(crate) const CONDITIONAL: [BpmnElementType; 2] = [
    BpmnElementType::ExclusiveGateway,
    BpmnElementType::InclusiveGateway,
];

/// TS's `JOB_TASKS`: tasks that need a job type; the id stands in when none is given.
pub(crate) const JOB_TASKS: [BpmnElementType; 2] =
    [BpmnElementType::ServiceTask, BpmnElementType::SendTask];

/// TS's `TIME_WORDS`: "every day" is a schedule, not a list.
pub(crate) const TIME_WORDS: [&str; 13] = [
    "second", "minute", "hour", "day", "week", "month", "quarter", "year", "morning", "evening",
    "night", "time", "other",
];

/// TS's `ACTIVITIES`: types `each=` makes multi-instance.
pub(crate) const ACTIVITIES: [BpmnElementType; 10] = {
    use BpmnElementType as T;
    [
        T::Task,
        T::ServiceTask,
        T::SendTask,
        T::ReceiveTask,
        T::UserTask,
        T::ManualTask,
        T::ScriptTask,
        T::BusinessRuleTask,
        T::CallActivity,
        T::SubProcess,
    ]
};

/// TS's `UNITS`: duration unit letter → ISO 8601 designator.
pub(crate) const UNITS: [(char, &str); 5] =
    [('s', "S"), ('m', "M"), ('h', "H"), ('d', "D"), ('w', "W")];

/// `KINDS[word]` (own keys only; see the module notes).
pub fn kind(word: &str) -> Option<BpmnElementType> {
    KINDS.iter().find(|(w, _)| *w == word).map(|(_, t)| *t)
}

/// `ALIASES[word]` (own keys only).
pub fn alias(word: &str) -> Option<BpmnElementType> {
    ALIASES.iter().find(|(w, _)| *w == word).map(|(_, t)| *t)
}

pub(crate) fn is_event(ty: BpmnElementType) -> bool {
    EVENTS.contains(&ty)
}

pub(crate) fn is_gateway(ty: BpmnElementType) -> bool {
    GATEWAYS.contains(&ty)
}

pub(crate) fn is_conditional(ty: BpmnElementType) -> bool {
    CONDITIONAL.contains(&ty)
}

pub(crate) fn is_job_task(ty: BpmnElementType) -> bool {
    JOB_TASKS.contains(&ty)
}

/// A node as the reader declared it (TS's `Node`).
#[derive(Debug, Clone, PartialEq)]
pub(crate) struct Node {
    pub element: CompactElement,
    pub line: u32,
    /// The bracket text it was declared with, to tell a restatement from a new node.
    pub spec: String,
    /// Boundary host id, from `on=`.
    pub on: Option<String>,
    /// The ad-hoc sub-process it lives in, from `inside=`.
    pub inside: Option<String>,
}

/// An arrow the reader read (TS's `Edge`: a `CompactFlow` without `id`, plus `line`).
/// TS compares edges by object identity in `assemble`; `assemble` may wrap them.
#[derive(Debug, Clone, Default, PartialEq)]
pub(crate) struct Edge {
    pub from: String,
    pub to: String,
    pub name: Option<String>,
    pub condition: Option<String>,
    pub is_default: Option<bool>,
    pub line: u32,
}

/// TS's `Pick<CompactFlow, "name" | "condition" | "isDefault">`.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EdgeLabel {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub condition: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub is_default: Option<bool>,
}

/// JS `\s` as a regex class, for patterns compiled without Unicode mode.
macro_rules! js_s {
    () => {
        r"(?u:[\t\n\x0B\x0C\r \u{A0}\u{1680}\u{2000}-\u{200A}\u{2028}\u{2029}\u{202F}\u{205F}\u{3000}\u{FEFF}])"
    };
}

fn is_line_terminator(c: char) -> bool {
    matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}

fn is_id_start(c: char) -> bool {
    c.is_ascii_alphabetic() || c == '_'
}

/// `[\w.-]`.
fn is_id_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-')
}

/// Length of `/^[A-Za-z_][\w.-]*/` on `s`, 0 when it does not match.
fn id_len(s: &str) -> usize {
    let mut chars = s.char_indices();
    match chars.next() {
        Some((_, c)) if is_id_start(c) => {}
        _ => return 0,
    }
    chars
        .find(|&(_, c)| !is_id_char(c))
        .map_or(s.len(), |(i, _)| i)
}

/// `/^(?:note|doc)\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i` for the keyword `word`.
fn match_keyword_line<'a>(text: &'a str, word: &str) -> Option<(&'a str, &'a str)> {
    let head = text.get(..word.len())?;
    if !head.eq_ignore_ascii_case(word) {
        return None;
    }
    let rest = &text[word.len()..];
    let after_ws = rest.trim_start_matches(is_js_space);
    if after_ws.len() == rest.len() {
        return None;
    }
    let id = &after_ws[..id_len(after_ws)];
    if id.is_empty() {
        return None;
    }
    let rest = after_ws[id.len()..].trim_start_matches(is_js_space);
    let body = rest.strip_prefix(':')?.trim_start_matches(is_js_space);
    // `.` stops at line terminators and `$` is the end of the string.
    if body.contains(is_line_terminator) {
        return None;
    }
    Some((id, body))
}

/// `NOTE_LINE` (`/^note\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i`): `(id, text)`.
pub fn match_note_line(text: &str) -> Option<(&str, &str)> {
    match_keyword_line(text, "note")
}

/// `DOC_LINE` (`/^doc\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i`): `(id, text)`.
pub fn match_doc_line(text: &str) -> Option<(&str, &str)> {
    match_keyword_line(text, "doc")
}

/// `HEADER_SEGMENT.test(s)` (`/^[\s,]*(?:camunda=[^\s,|]*[\s,]*)+$/`).
pub(crate) fn is_header_segment(s: &str) -> bool {
    let sep = |c: char| is_js_space(c) || c == ',';
    let mut rest = s.trim_start_matches(sep);
    if !rest.starts_with("camunda=") {
        return false;
    }
    // Greedy runs cannot be improved by backtracking: a shorter value would leave
    // characters the separators or the next `camunda=` would have to match.
    while let Some(after) = rest.strip_prefix("camunda=") {
        let value_end = after
            .find(|c: char| is_js_space(c) || c == ',' || c == '|')
            .unwrap_or(after.len());
        rest = after[value_end..].trim_start_matches(sep);
    }
    rest.is_empty()
}

/// `-{0,2}>` at the start of `s`: the arrow's length.
fn arrow_len(s: &str) -> Option<usize> {
    let dashes = s.bytes().take_while(|&b| b == b'-').count();
    if dashes <= 2 && s.as_bytes().get(dashes) == Some(&b'>') {
        Some(dashes + 1)
    } else {
        None
    }
}

/// `^\(([^()]*)\)` then whitespace to the end, or whitespace to the end: `\s*(\([^()]*\))?\s*$`
/// on `s` (the optional group is matched at most once).
fn paren_tail(s: &str) -> bool {
    let t = s.trim_start_matches(is_js_space);
    match t.strip_prefix('(') {
        Some(inner) => match inner.find(['(', ')']) {
            Some(p) if inner.as_bytes()[p] == b')' => {
                inner[p + 1..].trim_start_matches(is_js_space).is_empty()
            }
            _ => false,
        },
        None => t.is_empty(),
    }
}

/// The byte index where `DANGLING` matches (it ends at the end of the string).
fn dangling_start(s: &str) -> Option<usize> {
    // Matches start further right with the `>` they belong to, so the first `>` whose
    // rest fits is the leftmost match.
    let p = s
        .char_indices()
        .find(|&(i, c)| c == '>' && paren_tail(&s[i + 1..]))
        .map(|(i, _)| i)?;
    let before = &s[..p];
    let dashes = before
        .bytes()
        .rev()
        .take_while(|&b| b == b'-')
        .count()
        .min(2);
    Some(before[..p - dashes].trim_end_matches(is_js_space).len())
}

/// `DANGLING.test(s)` (`/\s*-{0,2}>\s*(\([^()]*\))?\s*$/`): the line ends in an arrow.
pub(crate) fn dangles(s: &str) -> bool {
    dangling_start(s).is_some()
}

/// `s.replace(DANGLING, "")`.
pub(crate) fn strip_dangling(s: &str) -> String {
    match dangling_start(s) {
        Some(at) => s[..at].to_owned(),
        None => s.to_owned(),
    }
}

/// TS's `matching`: the byte index of the `close` matching the `open` at `start`, skipping
/// double-quoted text.
pub(crate) fn matching(text: &str, start: usize, open: char, close: char) -> Option<usize> {
    let mut depth = 0i32;
    let mut quote = false;
    for (off, ch) in text[start..].char_indices() {
        if ch == '"' {
            quote = !quote;
        }
        if quote {
            continue;
        }
        if ch == open {
            depth += 1;
        } else if ch == close {
            depth -= 1;
            if depth == 0 {
                return Some(start + off);
            }
        }
    }
    None
}

/// What [`split_feel`] returns.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SplitFeel {
    pub plain: String,
    /// The expression with its leading `=` (`"= …"` added when written without).
    pub feel: Option<String>,
}

/// `(?:^|[\s,|])` followed by what `matches` accepts: the leftmost `(index, end)` of such a
/// match. `matches` gets the text after the separator and returns the length it consumed.
fn find_after_separator(
    s: &str,
    mut matches: impl FnMut(&str) -> Option<usize>,
) -> Option<(usize, usize)> {
    if let Some(n) = matches(s) {
        return Some((0, n));
    }
    for (i, c) in s.char_indices() {
        if is_js_space(c) || c == ',' || c == '|' {
            let after = i + c.len_utf8();
            if let Some(n) = matches(&s[after..]) {
                return Some((i, after + n));
            }
        }
    }
    None
}

/// TS's `splitFeel`.
pub fn split_feel(attrs: &str) -> SplitFeel {
    let Some((index, end)) = find_after_separator(attrs, |r| r.starts_with("feel=").then_some(5))
    else {
        return SplitFeel {
            plain: attrs.to_owned(),
            feel: None,
        };
    };
    let feel = js_trim(&attrs[end..]);
    let plain = attrs[..index].to_owned();
    if feel.is_empty() {
        return SplitFeel { plain, feel: None };
    }
    let feel = if feel.starts_with('=') {
        feel.to_owned()
    } else {
        format!("= {feel}")
    };
    SplitFeel {
        plain,
        feel: Some(feel),
    }
}

/// `"in" | "out"` of a mapping.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MappingDirection {
    In,
    Out,
}

/// One `in.<target>=<FEEL>` / `out.<target>=<FEEL>` attribute.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Mapping {
    pub direction: MappingDirection,
    pub target: String,
    pub value: String,
}

/// What [`split_mappings`] returns.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SplitMappings {
    pub plain: String,
    pub mappings: Vec<Mapping>,
}

/// `(in|out)\.([A-Za-z_][\w.-]*)=` at the start of `s`: direction, target, length.
fn mapping_head(s: &str) -> Option<(MappingDirection, &str, usize)> {
    let (direction, rest) = if let Some(r) = s.strip_prefix("in.") {
        (MappingDirection::In, r)
    } else {
        (MappingDirection::Out, s.strip_prefix("out.")?)
    };
    let n = id_len(rest);
    if n == 0 || rest.as_bytes().get(n) != Some(&b'=') {
        return None;
    }
    Some((direction, &rest[..n], s.len() - rest.len() + n + 1))
}

/// `/\s[A-Za-z_][\w.-]*=/.exec(s)?.index`.
fn next_attribute(s: &str) -> Option<usize> {
    s.char_indices().find_map(|(i, c)| {
        if !is_js_space(c) {
            return None;
        }
        let rest = &s[i + c.len_utf8()..];
        let n = id_len(rest);
        (n > 0 && rest.as_bytes().get(n) == Some(&b'=')).then_some(i)
    })
}

/// TS's `splitMappings`.
pub fn split_mappings(attrs: &str) -> SplitMappings {
    let mut mappings = vec![];
    let mut plain = attrs.to_owned();
    loop {
        let mut head = None;
        let found = find_after_separator(&plain, |r| {
            let (d, t, n) = mapping_head(r)?;
            head = Some((d, t.to_owned()));
            Some(n)
        });
        let (Some((index, start)), Some((direction, target))) = (found, head) else {
            return SplitMappings { plain, mappings };
        };
        let end = next_attribute(&plain[start..]).map_or(plain.len(), |n| start + n);
        // FEEL never ends in `|` or `,`: that is the separator before the next attribute
        let value = plain[start..end]
            .trim_end_matches(|c: char| is_js_space(c) || c == ',' || c == '|')
            .to_owned();
        mappings.push(Mapping {
            direction,
            target,
            value: js_trim(&value).to_owned(),
        });
        plain = format!("{} {}", &plain[..index], &plain[end..]);
    }
}

static HANDLING: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(concat!(
        r"(?i-u)\b(?:fail\w*|error\w*|handle\w*|alert\w*|notify\w*|retr(?:y|ies)|escalat\w*|",
        r"cancel\w*|reject\w*|abort\w*|roll",
        js_s!(),
        r"?back|compensat\w*|timeout|timed out|late)\b"
    ))
    .expect("HANDLING")
});

/// TS's `handles`: whether the element reads as handling a failure (`HANDLING` on its
/// name, and on its id with `_ . -` runs as spaces).
pub(crate) fn handles(element: Option<&CompactElement>) -> bool {
    let Some(element) = element else {
        return false;
    };
    HANDLING.is_match(element.name.as_deref().unwrap_or(""))
        || HANDLING.is_match(&replace_runs(&element.id, |c| matches!(c, '_' | '.' | '-')))
}

/// `s.replace(/[<set>]+/g, " ")`.
fn replace_runs(s: &str, in_set: impl Fn(char) -> bool) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_run = false;
    for c in s.chars() {
        if in_set(c) {
            if !in_run {
                out.push(' ');
            }
            in_run = true;
        } else {
            in_run = false;
            out.push(c);
        }
    }
    out
}

/// TS's `typeFromId`.
pub(crate) fn type_from_id(id: &str) -> BpmnElementType {
    // `pick > and`, `and > dispatch`: the kind written as if it were an id.
    let lower = id.to_lowercase();
    if let Some(kind) = kind(&lower).or_else(|| alias(&lower)) {
        if is_gateway(kind) {
            return kind;
        }
    }
    let starts = |word: &str| {
        id.as_bytes()
            .get(..word.len())
            .is_some_and(|p| p.eq_ignore_ascii_case(word.as_bytes()))
    };
    if starts("start") {
        BpmnElementType::StartEvent
    } else if starts("end") || starts("done") || starts("finish") {
        BpmnElementType::EndEvent
    } else {
        BpmnElementType::Task
    }
}

/// `s.replace(/([a-z0-9])([A-Z])/g, "$1 $2")`.
fn split_camel(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 4);
    let mut prev: Option<char> = None;
    for c in s.chars() {
        if c.is_ascii_uppercase()
            && prev.is_some_and(|p| p.is_ascii_lowercase() || p.is_ascii_digit())
        {
            out.push(' ');
        }
        out.push(c);
        prev = Some(c);
    }
    out
}

/// TS's `nameFromId`: `send_email` / `sendEmail` → `Send email`.
pub(crate) fn name_from_id(id: &str) -> String {
    let spaced = replace_runs(&split_camel(id), |c| matches!(c, '_' | '.' | '-'));
    let words = js_trim(&spaced).to_lowercase();
    // `charAt(0).toUpperCase()` upper-cases one UTF-16 unit: an astral first character
    // stays as it is.
    let mut chars = words.chars();
    match chars.next() {
        Some(c) if c.len_utf16() == 1 => c.to_uppercase().chain(chars).collect(),
        _ => words,
    }
}

/// A node reference of a path line, with the bracket text it was declared with.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PathRef {
    pub id: String,
    pub spec: Option<String>,
}

/// An id written with spaces or as a number, and the id it was read as.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct JoinedId {
    pub written: String,
    pub id: String,
}

/// TS's `PathTokens`. TS's optional arrays are empty `Vec`s here.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PathTokens {
    pub refs: Vec<PathRef>,
    /// The label of each arrow, between `refs[k]` and `refs[k + 1]`.
    pub labels: Vec<Option<String>>,
    pub note: Option<String>,
    pub joined: Vec<JoinedId>,
    pub unclosed: Vec<String>,
    pub bracketless: Vec<String>,
}

/// `text.slice(i, i + 20)`: 20 UTF-16 units. A cut through a surrogate pair drops the pair
/// (TS keeps a lone surrogate, which a Rust string cannot hold).
fn slice20(text: &str, i: usize) -> &str {
    let mut units = 0;
    for (off, c) in text[i..].char_indices() {
        units += c.len_utf16();
        if units > 20 {
            return &text[i..i + off];
        }
    }
    &text[i..]
}

/// `/^\d[\w-]*(?=\s*(?:\[|-{0,2}>))/` on `s`: the length of the number.
fn number_len(s: &str) -> Option<usize> {
    if !s.as_bytes().first()?.is_ascii_digit() {
        return None;
    }
    // The run is greedy; a shorter one would put a run character where the lookahead needs
    // whitespace, `[`, `-` or `>`, and only `-` is one, which the longer run covers.
    let run = s
        .bytes()
        .take_while(|&b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
        .count();
    let after = s[run..].trim_start_matches(is_js_space);
    (after.starts_with('[') || arrow_len(after).is_some()).then_some(run)
}

/// `/^((?: +[A-Za-z_][\w.-]*)+)(?= *\[)/` on `s`: the length of group 1.
fn words_len(s: &str) -> Option<usize> {
    let mut pos = 0;
    loop {
        let spaces = s[pos..].bytes().take_while(|&b| b == b' ').count();
        let n = if spaces == 0 {
            0
        } else {
            id_len(&s[pos + spaces..])
        };
        if n == 0 {
            break;
        }
        pos += spaces + n;
    }
    // Dropping words from the end cannot help: the next character would be a letter.
    (pos > 0 && s[pos..].trim_start_matches(' ').starts_with('[')).then_some(pos)
}

/// `\s*-{0,2}>` at the start of `s`.
fn ws_arrow(s: &str) -> bool {
    arrow_len(s.trim_start_matches(is_js_space)).is_some()
}

/// `/^ +([^[\]()>|]+?)(?=\s*(?:-{0,2}>|$))/` on `s`: `(match length, group 1)`.
fn bare_match(s: &str) -> Option<(usize, &str)> {
    let spaces = s.bytes().take_while(|&b| b == b' ').count();
    // ` +` is greedy and gives spaces back one at a time, which then start the group.
    for start in (1..=spaces).rev() {
        for (off, c) in s[start..].char_indices() {
            if matches!(c, '[' | ']' | '(' | ')' | '>' | '|') {
                break;
            }
            let end = start + off + c.len_utf8();
            let after = s[end..].trim_start_matches(is_js_space);
            if after.is_empty() || arrow_len(after).is_some() {
                return Some((end, &s[start..end]));
            }
        }
    }
    None
}

/// `/^[^[\]]*?(?:\)(?=\s*-{0,2}>)|(?=\s+-{0,2}>)|$)/` on `s`: the match.
fn unclosed_name(s: &str) -> Option<&str> {
    let mut len = 0;
    loop {
        let rest = &s[len..];
        if let Some(after) = rest.strip_prefix(')') {
            if ws_arrow(after) {
                return Some(&s[..len + 1]);
            }
        }
        let trimmed = rest.trim_start_matches(is_js_space);
        if trimmed.len() < rest.len() && arrow_len(trimmed).is_some() {
            return Some(&s[..len]);
        }
        match rest.chars().next() {
            None => return Some(&s[..len]),
            Some('[' | ']') => return None,
            Some(c) => len += c.len_utf8(),
        }
    }
}

/// `/^\([^()]*\)\s*$/` on `s`.
fn trailing_note(s: &str) -> bool {
    s.starts_with('(') && paren_tail(s)
}

/// TS's `tokenizePath`: `Err` is TS's `{ error }` message.
pub fn tokenize_path(text: &str) -> Result<PathTokens, String> {
    let mut refs: Vec<PathRef> = vec![];
    let mut labels: Vec<Option<String>> = vec![];
    let mut joined: Vec<JoinedId> = vec![];
    let mut unclosed: Vec<String> = vec![];
    let mut bracketless: Vec<String> = vec![];
    let mut note: Option<String> = None;
    let mut i = 0usize;
    let at = |i: usize| text.as_bytes().get(i).copied();
    loop {
        let rest = &text[i..];
        let id_n = id_len(rest);
        let mut id: String;
        if id_n == 0 {
            // `1[service List runs] > 2[xor …]`: numbers for ids, which BPMN ids cannot start with
            let Some(n) = number_len(rest) else {
                return Err(format!("expected a node id at \"{}\"", slice20(text, i)));
            };
            let number = &rest[..n];
            id = format!("n{number}");
            if !joined.iter().any(|j| j.id == id) {
                joined.push(JoinedId {
                    written: number.to_owned(),
                    id: id.clone(),
                });
            }
            i += n;
        } else {
            id = rest[..id_n].to_owned();
            i += id_n;
        }
        // `call back[service …]`: words before a bracket are one id
        if let Some(n) = words_len(&text[i..]) {
            let written = format!("{id}{}", &text[i..i + n]);
            id = written
                .split(' ')
                .filter(|p| !p.is_empty())
                .collect::<Vec<_>>()
                .join("_");
            joined.push(JoinedId {
                written,
                id: id.clone(),
            });
            i += n;
        }
        let mut spec: Option<String> = None;
        // `… > xor Notify sales? >(Yes: …)`: a kind and a name without brackets, after an
        // arrow. At the start of a line it is more likely prose ("end of the answer").
        if !refs.is_empty() && kind(&id).is_some() {
            if let Some((len, group)) = bare_match(&text[i..]) {
                // TS tests the group for truthiness; it is never empty.
                spec = Some(format!("{id} {}", js_trim(group)));
                bracketless.push(id.clone());
                i += len;
            }
        }
        // `done-end [end Done]`: a space before the bracket still declares.
        let gap = text[i..].bytes().take_while(|&b| b == b' ').count();
        if gap > 0 && at(i + gap) == Some(b'[') {
            i += gap;
        }
        if at(i) == Some(b'[') {
            let end;
            let after;
            if let Some(e) = matching(text, i, '[', ']') {
                end = e;
                after = e + 1;
            } else {
                // `start[start HR) > …` or `end[Page created` at the end of the line: the
                // bracket closes where its name plainly ends, before the next arrow
                let open = match unclosed_name(&text[i + 1..]) {
                    Some(o) if !js_trim(o).is_empty() => o,
                    _ => return Err(format!("\"{id}[\" is not closed")),
                };
                let closer = usize::from(open.ends_with(')'));
                end = i + 1 + open.len() - closer;
                after = i + 1 + open.len();
                unclosed.push(id.clone());
            }
            spec = Some(js_trim(&text[i + 1..end]).to_owned());
            i = after;
        }
        refs.push(PathRef { id, spec });

        while at(i) == Some(b' ') {
            i += 1;
        }
        if i >= text.len() {
            break;
        }
        // `gr[xor Reproducible?]   (ADDED)`: a note after the last node, most
        // often marking what a change added.
        if trailing_note(&text[i..]) {
            note = Some(js_trim(&text[i..]).to_owned());
            break;
        }
        // `->` and `-->` are what a model reaches for from Mermaid; take them too.
        let Some(arrow) = arrow_len(&text[i..]) else {
            return Err(format!("expected \">\" at \"{}\"", slice20(text, i)));
        };
        i += arrow;
        let mut label: Option<String> = None;
        // `credit > (No: default) decision`: a space before the label
        let spaced = text[i..].bytes().take_while(|&b| b == b' ').count();
        if spaced > 0 && at(i + spaced) == Some(b'(') {
            i += spaced;
        }
        if at(i) == Some(b'(') {
            let Some(end) = matching(text, i, '(', ')') else {
                return Err("edge label is not closed".to_owned());
            };
            label = Some(text[i + 1..end].to_owned());
            i = end + 1;
        }
        let labelled = label.is_some();
        labels.push(label);
        while at(i) == Some(b' ') {
            i += 1;
        }
        // `gw >(No: default) > next`: a second arrow after the label.
        if labelled && at(i) == Some(b'>') {
            i += 1;
            while at(i) == Some(b' ') {
                i += 1;
            }
        }
    }
    Ok(PathTokens {
        refs,
        labels,
        note,
        joined,
        unclosed,
        bracketless,
    })
}

/// `parseExpression(source).errors.length === 0`.
pub(crate) fn is_feel(source: &str) -> bool {
    bpmnkit_feel::parse_partial(source, &bpmnkit_feel::ParseOptions::default())
        .errors
        .is_empty()
}

/// TS's `conditionOrLabel`: keeps a condition only if it parses as FEEL, else moves it into
/// the label and returns the problem message. TS tests `parseExpression(prose).errors.length
/// === 0`, which `parse_partial` mirrors (`parse` also refuses an empty expression).
pub fn condition_or_label(edge: EdgeLabel) -> (EdgeLabel, Option<String>) {
    let Some(condition) = edge.condition.as_deref() else {
        return (edge, None);
    };
    // `slice(1)` drops the leading `=`.
    let mut chars = condition.chars();
    chars.next();
    let prose = js_trim(chars.as_str()).to_owned();
    if is_feel(&prose) {
        return (edge, None);
    }
    let name = match edge.name.as_deref() {
        Some(name) if !name.is_empty() => format!("{name}: {prose}"),
        _ => prose.clone(),
    };
    let problem = format!("condition \"{prose}\" is not FEEL; kept as the branch label");
    (
        EdgeLabel {
            name: Some(name),
            condition: None,
            is_default: edge.is_default,
        },
        Some(problem),
    )
}

/// TS's `itemOf`: `recipients` → `recipient`, else `item`.
pub(crate) fn item_of(collection: &str) -> String {
    let mut bytes = collection.bytes();
    let ident = bytes
        .next()
        .is_some_and(|b| b.is_ascii_alphabetic() || b == b'_')
        && bytes.all(|b| b.is_ascii_alphanumeric() || b == b'_');
    if !ident {
        return "item".to_owned();
    }
    if collection.ends_with("ies") && collection.len() > 4 {
        return format!("{}y", &collection[..collection.len() - 3]);
    }
    if collection.ends_with('s') && !collection.ends_with("ss") && collection.len() > 3 {
        return collection[..collection.len() - 1].to_owned();
    }
    "item".to_owned()
}

static ISO_DURATION: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i-u)\bP(?:\d+[YMWD])*(?:T(?:\d+[HMS])+)?\b").expect("ISO_DURATION")
});

static WORD_DURATION: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(concat!(
        r"(?i-u)(\d+)",
        js_s!(),
        r"*(s|sec|secs|seconds?|m|min|mins|minutes?|h|hrs?|hours?|d|days?|w|weeks?)\b"
    ))
    .expect("WORD_DURATION")
});

/// TS's `duration`: an ISO 8601 duration from `PT5M`, `5m`, `5 minutes`, …
pub fn duration(text: &str) -> Option<String> {
    // `p1d` is P1D: models write ISO durations in lower case too
    if let Some(m) = ISO_DURATION.find(text) {
        let iso = m.as_str().to_ascii_uppercase();
        if iso != "P" && iso != "PT" {
            return Some(iso);
        }
    }
    let m = WORD_DURATION.captures(text)?;
    let (number, unit) = (m.get(1)?.as_str(), m.get(2)?.as_str());
    let letter = unit.chars().next()?.to_ascii_lowercase();
    let (_, unit) = UNITS.iter().find(|(l, _)| *l == letter)?;
    Some(if *unit == "D" || *unit == "W" {
        format!("P{number}{unit}")
    } else {
        format!("PT{number}{unit}")
    })
}

/// TS's `edgeLabel`: `Name: condition`, `default`, `Name: default`.
pub fn edge_label(label: Option<&str>) -> EdgeLabel {
    let Some(label) = label else {
        return EdgeLabel::default();
    };
    let colon = label.find(':');
    let name = js_trim(colon.map_or(label, |c| &label[..c]));
    let rest = colon.map_or("", |c| js_trim(&label[c + 1..]));
    if name.to_lowercase() == "default" && rest.is_empty() {
        return EdgeLabel {
            is_default: Some(true),
            ..EdgeLabel::default()
        };
    }
    let mut out = EdgeLabel::default();
    if !name.is_empty() {
        out.name = Some(name.to_owned());
    }
    if rest.to_lowercase() == "default" {
        out.is_default = Some(true);
    } else if !rest.is_empty() {
        out.condition = Some(if rest.starts_with('=') {
            rest.to_owned()
        } else {
            format!("= {rest}")
        });
    }
    out
}

static OTHERWISE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"(?i-u)^(?:no|not|else|otherwise|default|false|reject(?:ed)?|fail(?:ed|ure)?|invalid|denied|declined)\b",
    )
    .expect("OTHERWISE")
});

/// `OTHERWISE.test(label)`: a branch label that reads as "otherwise".
pub(crate) fn is_otherwise(label: &str) -> bool {
    OTHERWISE.is_match(label)
}

/// TS's `listOf`: `"A", "B" and "C"`.
pub(crate) fn list_of(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [only] => only.clone(),
        [init @ .., last] => format!("{} and {last}", init.join(", ")),
    }
}

/// TS's `variableFrom`: `Status approved?` → `statusApproved`.
pub(crate) fn variable_from(text: &str) -> String {
    let spaced = split_camel(text);
    let name: String = spaced
        .split(|c: char| !c.is_ascii_alphanumeric())
        .filter(|w| !w.is_empty())
        .enumerate()
        .map(|(k, word)| {
            let lower = word.to_lowercase();
            if k == 0 {
                lower
            } else {
                let mut chars = lower.chars();
                chars
                    .next()
                    .map(|c| c.to_uppercase().chain(chars).collect())
                    .unwrap_or_default()
            }
        })
        .collect();
    if name.chars().next().is_some_and(is_id_start) {
        name
    } else {
        format!("_{name}")
    }
}

#[cfg(test)]
mod tests {
    //! The crate-private helpers against `tests/oracle/pt_tokens.json` (see `pt_tokens.mjs`).

    use serde_json::Value;

    use super::*;

    fn section(name: &str) -> Vec<Value> {
        let all: Value = serde_json::from_str(include_str!("../../tests/oracle/pt_tokens.json"))
            .expect("oracle");
        all[name].as_array().expect(name).clone()
    }

    #[test]
    fn header_segments() {
        for case in section("header") {
            let s = case[0].as_str().unwrap();
            assert_eq!(Some(is_header_segment(s)), case[1].as_bool(), "{s:?}");
        }
    }

    #[test]
    fn dangling_arrows() {
        for case in section("dangling") {
            let s = case[0].as_str().unwrap();
            assert_eq!(Some(dangles(s)), case[1].as_bool(), "dangles {s:?}");
            assert_eq!(
                Some(strip_dangling(s).as_str()),
                case[2].as_str(),
                "strip {s:?}"
            );
        }
    }

    #[test]
    fn matching_brackets() {
        for case in section("matching") {
            let text = case[0].as_str().unwrap();
            let start = case[1].as_u64().unwrap() as usize;
            let open = case[2].as_str().unwrap().chars().next().unwrap();
            let close = case[3].as_str().unwrap().chars().next().unwrap();
            let got = matching(text, start, open, close).map_or(-1, |i| i as i64);
            assert_eq!(Some(got), case[4].as_i64(), "{text:?} at {start}");
        }
    }

    #[test]
    fn handling_words() {
        for case in section("handles") {
            let e = &case[0];
            let element = CompactElement {
                id: e["id"].as_str().unwrap().to_owned(),
                name: e["name"].as_str().map(str::to_owned),
                ..CompactElement::default()
            };
            assert_eq!(Some(handles(Some(&element))), case[1].as_bool(), "{e}");
        }
        assert!(!handles(None));
    }

    #[test]
    fn id_helpers() {
        for case in section("typeFromId") {
            let id = case[0].as_str().unwrap();
            assert_eq!(Some(type_from_id(id).as_str()), case[1].as_str(), "{id:?}");
        }
        for case in section("nameFromId") {
            let id = case[0].as_str().unwrap();
            assert_eq!(Some(name_from_id(id).as_str()), case[1].as_str(), "{id:?}");
        }
        for case in section("variableFrom") {
            let text = case[0].as_str().unwrap();
            assert_eq!(
                Some(variable_from(text).as_str()),
                case[1].as_str(),
                "{text:?}"
            );
        }
    }

    #[test]
    fn small_helpers() {
        for case in section("itemOf") {
            let c = case[0].as_str().unwrap();
            assert_eq!(Some(item_of(c).as_str()), case[1].as_str(), "{c:?}");
        }
        for case in section("listOf") {
            let items: Vec<String> = case[0]
                .as_array()
                .unwrap()
                .iter()
                .map(|v| v.as_str().unwrap().to_owned())
                .collect();
            assert_eq!(
                Some(list_of(&items).as_str()),
                case[1].as_str(),
                "{items:?}"
            );
        }
        for case in section("otherwise") {
            let l = case[0].as_str().unwrap();
            assert_eq!(Some(is_otherwise(l)), case[1].as_bool(), "{l:?}");
        }
    }
}
