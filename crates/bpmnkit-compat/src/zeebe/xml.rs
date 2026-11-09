//! Twin of `zeebe-validate/xml.ts`: Zeebe's parse and XSD stage on the text.
//!
//! Zeebe reads BPMN with a validating Xerces parser, which stops at the first
//! well-formedness or schema error. This is a small strict scanner and XSD
//! content-model check that reports that first error with Xerces' own text.
//! Positions are UTF-16 units, as in the TS, so lines and offsets agree for
//! non-ASCII input.

use super::context::ZeebeContext;
use super::xsd::{XSD_ELEMENTS, XSD_ENUMS, XSD_TYPES};
use crate::compat::pattern::{is_js_space, js_trim};
use std::collections::{HashMap, HashSet};
use std::rc::Rc;
use std::sync::OnceLock;

const MODEL: &str = "http://www.omg.org/spec/BPMN/20100524/MODEL";
const XSI: &str = "http://www.w3.org/2001/XMLSchema-instance";
const XML_NS: &str = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NS: &str = "http://www.w3.org/2000/xmlns/";
const XSD_NS: &str = "http://www.w3.org/2001/XMLSchema";

/// Prefixes the schema table uses for each target namespace.
const SCHEMA_PREFIXES: [(&str, &str); 4] = [
    ("", MODEL),
    ("bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"),
    ("di", "http://www.omg.org/spec/DD/20100524/DI"),
    ("dc", "http://www.omg.org/spec/DD/20100524/DC"),
];

/// What ZCheck prints before Xerces' message for a parse failure.
const PARSE_PREFIX: &str = "PARSE: SAXException while parsing input stream / ";

fn suggestion(rule: &str) -> &'static str {
    match rule {
        "xml-schema" => {
            "Fix the XML so it is well-formed and the BPMN elements follow the schema order."
        }
        "target-namespace" => "Add a targetNamespace attribute to bpmn:definitions.",
        "sequence-flow-refs" => "Give the sequence flow both sourceRef and targetRef.",
        "boundary-attached-ref" => {
            "Set attachedToRef to the activity the boundary event is attached to."
        }
        "association-refs" => "Give the association or message flow both sourceRef and targetRef.",
        "xsd-required-name" => "Add the attribute the BPMN schema requires.",
        "id-ncname-unique" => {
            "Use unique ids that are valid XML names (no spaces, no leading digit)."
        }
        "idref-resolves" => {
            "Point the reference at an existing element id that is a valid XML name."
        }
        "xsd-content" => "Remove the attribute or value the BPMN schema does not allow.",
        "id-present" => "Give the element a non-empty id.",
        _ => "Fix the BPMN XML.",
    }
}

// ---------------------------------------------------------------------------
// Schema table
// ---------------------------------------------------------------------------

#[derive(Clone, Copy, PartialEq, Eq)]
enum AltKind {
    Ref,
    Local,
    Any,
    Other,
}

#[derive(Clone)]
struct Alt {
    kind: AltKind,
    ns: String,
    local: String,
    /// For a local element, its type.
    ty: Option<String>,
}

#[derive(Clone)]
struct Particle {
    alts: Vec<Alt>,
    min: f64,
    max: f64,
}

struct AttrDecl {
    name: String,
    ty: String,
    required: bool,
}

struct ComplexType {
    name: String,
    /// Target namespace of the schema the type is declared in.
    ns: String,
    particles: Vec<Particle>,
    attrs: Vec<AttrDecl>,
    any_attr: bool,
    mixed: bool,
    is_abstract: bool,
}

const BUILTIN_SIMPLE: [&str; 9] = [
    "string", "anyURI", "boolean", "integer", "int", "double", "ID", "IDREF", "QName",
];

/// Pseudo-type of `di:extension`, whose anonymous type takes any foreign content.
const EXT_TYPE: &str = "#ext";

fn table<'a>(
    cell: &'static OnceLock<HashMap<&'static str, &'a str>>,
    rows: &'static [(&'static str, &'a str)],
) -> &'static HashMap<&'static str, &'a str> {
    cell.get_or_init(|| rows.iter().copied().collect())
}

fn xsd_element(key: &str) -> Option<&'static str> {
    static CELL: OnceLock<HashMap<&'static str, &'static str>> = OnceLock::new();
    table(&CELL, XSD_ELEMENTS).get(key).copied()
}

fn xsd_type(key: &str) -> Option<&'static str> {
    static CELL: OnceLock<HashMap<&'static str, &'static str>> = OnceLock::new();
    table(&CELL, XSD_TYPES).get(key).copied()
}

fn xsd_enum(key: &str) -> Option<&'static [&'static str]> {
    static CELL: OnceLock<HashMap<&'static str, &'static [&'static str]>> = OnceLock::new();
    CELL.get_or_init(|| XSD_ENUMS.iter().copied().collect())
        .get(key)
        .copied()
}

fn ns_of_prefix(prefix: &str) -> &'static str {
    SCHEMA_PREFIXES
        .iter()
        .find(|(p, _)| *p == prefix)
        .map_or("", |(_, ns)| ns)
}

/// A table name such as `bpmndi:BPMNShape` or `task`, split into namespace and local name.
fn schema_name(name: &str) -> (&'static str, &str) {
    match name.find(':') {
        None => (MODEL, name),
        Some(c) => (ns_of_prefix(&name[..c]), &name[c + 1..]),
    }
}

/// The table key of a namespace-qualified name, or `None` outside the BPMN schemas.
fn schema_key(ns: &str, local: &str) -> Option<String> {
    SCHEMA_PREFIXES
        .iter()
        .find(|(_, uri)| *uri == ns)
        .map(|(p, _)| {
            if p.is_empty() {
                local.to_string()
            } else {
                format!("{p}:{local}")
            }
        })
}

/// Splits on `sep` outside parentheses and braces.
fn split_top(text: &str, sep: char) -> Vec<&str> {
    let mut out = vec![];
    let mut depth = 0i32;
    let mut start = 0;
    for (i, ch) in text.char_indices() {
        if ch == '(' || ch == '{' {
            depth += 1;
        } else if ch == ')' || ch == '}' {
            depth -= 1;
        } else if ch == sep && depth == 0 {
            out.push(&text[start..i]);
            start = i + 1;
        }
    }
    out.push(&text[start..]);
    out
}

/// Splits an occurrence suffix off a particle: `a*` -> `("a", 0, inf)`.
fn occurrence(text: &str) -> (&str, f64, f64) {
    match text.as_bytes().last() {
        Some(b'?') => (&text[..text.len() - 1], 0.0, 1.0),
        Some(b'*') => (&text[..text.len() - 1], 0.0, f64::INFINITY),
        Some(b'+') => (&text[..text.len() - 1], 1.0, f64::INFINITY),
        Some(b'}') => {
            let open = text.rfind('{').unwrap_or(0);
            let inner = &text[open + 1..text.len() - 1];
            let mut parts = inner.split(',');
            let min = parts.next().unwrap_or("");
            let max = parts.next();
            (
                &text[..open],
                min.parse().unwrap_or(0.0),
                match max {
                    None | Some("") => f64::INFINITY,
                    Some(m) => m.parse().unwrap_or(0.0),
                },
            )
        }
        _ => (text, 1.0, 1.0),
    }
}

fn parse_alt(text: &str, type_ns: &str) -> (Alt, f64, f64) {
    let (body, min, max) = occurrence(text);
    if body == "#any" {
        let alt = Alt {
            kind: AltKind::Any,
            ns: String::new(),
            local: String::new(),
            ty: None,
        };
        return (alt, min, max);
    }
    if body == "#other" {
        let alt = Alt {
            kind: AltKind::Other,
            ns: type_ns.to_string(),
            local: String::new(),
            ty: None,
        };
        return (alt, min, max);
    }
    match body.find('=') {
        None => {
            let (ns, local) = schema_name(body);
            let alt = Alt {
                kind: AltKind::Ref,
                ns: ns.to_string(),
                local: local.to_string(),
                ty: None,
            };
            (alt, min, max)
        }
        Some(eq) => {
            let (ns, local) = schema_name(&body[..eq]);
            let alt = Alt {
                kind: AltKind::Local,
                ns: ns.to_string(),
                local: local.to_string(),
                ty: Some(body[eq + 1..].to_string()),
            };
            (alt, min, max)
        }
    }
}

fn parse_particle(text: &str, type_ns: &str) -> Particle {
    if !text.starts_with('(') {
        let (alt, min, max) = parse_alt(text, type_ns);
        return Particle {
            alts: vec![alt],
            min,
            max,
        };
    }
    let close = text.rfind(')').unwrap_or(0);
    let (_, min, max) = occurrence(&format!("x{}", &text[close + 1..]));
    let alts: Vec<(Alt, f64, f64)> = split_top(&text[1..close], '|')
        .into_iter()
        .map(|a| parse_alt(a, type_ns))
        .collect();
    // A choice's occurrence bounds combine with its alternatives' (the timer choice of three
    // optional elements may be empty).
    Particle {
        min: min * alts.iter().map(|a| a.1).fold(f64::INFINITY, f64::min),
        max: max * alts.iter().map(|a| a.2).fold(f64::NEG_INFINITY, f64::max),
        alts: alts.into_iter().map(|a| a.0).collect(),
    }
}

fn is_simple_type(name: &str) -> bool {
    BUILTIN_SIMPLE.contains(&name) || xsd_enum(name).is_some()
}

/// A global element's type and substitution head.
fn global_element(key: &str) -> Option<(&'static str, Option<&'static str>)> {
    let spec = xsd_element(key)?;
    Some(match spec.find('/') {
        None => (spec, None),
        Some(slash) => (&spec[..slash], Some(&spec[slash + 1..])),
    })
}

/// Whether a type is, or derives from, `ancestor`.
fn derives_from(ty: &str, ancestor: &str) -> bool {
    let mut current: Option<&str> = Some(ty);
    let mut guard = 0;
    while let Some(c) = current {
        if guard >= 32 {
            break;
        }
        if c == ancestor {
            return true;
        }
        let base = xsd_type(c).map_or("", |spec| split_top(spec, '|')[0]);
        current = if base.is_empty() { None } else { Some(base) };
        guard += 1;
    }
    false
}

fn alt_label(alt: &Alt) -> String {
    match alt.kind {
        AltKind::Any => "WC[##any]".to_string(),
        AltKind::Other => format!("WC[##other:\"{}\"]", alt.ns),
        _ => format!("\"{}\":{}", alt.ns, alt.local),
    }
}

/// Xerces' rendering of an element in "Invalid content" messages.
fn expanded_name(ns: &str, local: &str) -> String {
    if ns.is_empty() {
        local.to_string()
    } else {
        format!("{{\"{ns}\":{local}}}")
    }
}

// ---------------------------------------------------------------------------
// Lexical checks
// ---------------------------------------------------------------------------

fn is_name_start(cp: i64) -> bool {
    (0x61..=0x7a).contains(&cp)
        || (0x41..=0x5a).contains(&cp)
        || cp == 0x5f
        || (0xc0..=0xd6).contains(&cp)
        || (0xd8..=0xf6).contains(&cp)
        || (0xf8..=0x2ff).contains(&cp)
        || (0x370..=0x37d).contains(&cp)
        || (0x37f..=0x1fff).contains(&cp)
        || (0x200c..=0x200d).contains(&cp)
        || (0x2070..=0x218f).contains(&cp)
        || (0x2c00..=0x2fef).contains(&cp)
        || (0x3001..=0xd7ff).contains(&cp)
        || (0xf900..=0xfdcf).contains(&cp)
        || (0xfdf0..=0xfffd).contains(&cp)
        || (0x10000..=0xeffff).contains(&cp)
}

fn is_name_char(cp: i64) -> bool {
    is_name_start(cp)
        || cp == 0x2d
        || cp == 0x2e
        || (0x30..=0x39).contains(&cp)
        || cp == 0xb7
        || (0x300..=0x36f).contains(&cp)
        || (0x203f..=0x2040).contains(&cp)
}

fn is_nc_name(text: &str) -> bool {
    if text.is_empty() {
        return false;
    }
    text.chars().enumerate().all(|(i, ch)| {
        let cp = ch as i64;
        if i == 0 {
            is_name_start(cp)
        } else {
            is_name_char(cp)
        }
    })
}

fn is_qname(text: &str) -> bool {
    match text.find(':') {
        None => is_nc_name(text),
        Some(c) => is_nc_name(&text[..c]) && is_nc_name(&text[c + 1..]),
    }
}

fn is_xml_ws_char(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\n' | '\r')
}

/// XSD whitespace collapse (`xsd:token` and every non-string built-in).
fn collapse(text: &str) -> String {
    let mut out = String::new();
    let mut in_ws = false;
    for ch in text.chars() {
        if is_xml_ws_char(ch) {
            in_ws = true;
        } else {
            if in_ws {
                out.push(' ');
            }
            in_ws = false;
            out.push(ch);
        }
    }
    if in_ws {
        out.push(' ');
    }
    if out.starts_with(' ') {
        out.remove(0);
    }
    if out.ends_with(' ') {
        out.pop();
    }
    out
}

fn is_xml_whitespace(text: &str) -> bool {
    text.chars().all(is_xml_ws_char)
}

fn is_xml_char(cp: u64) -> bool {
    cp == 0x9
        || cp == 0xa
        || cp == 0xd
        || (0x20..=0xd7ff).contains(&cp)
        || (0xe000..=0xfffd).contains(&cp)
        || (0x10000..=0x10ffff).contains(&cp)
}

/// `^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$|^(-?INF|NaN)$`
fn is_double(v: &str) -> bool {
    if matches!(v, "INF" | "-INF" | "NaN") {
        return true;
    }
    let b = v.as_bytes();
    let mut i = 0;
    if matches!(b.first(), Some(b'+' | b'-')) {
        i += 1;
    }
    let digits = |i: &mut usize| {
        let s = *i;
        while *i < b.len() && b[*i].is_ascii_digit() {
            *i += 1;
        }
        *i - s
    };
    let int = digits(&mut i);
    if int > 0 {
        if b.get(i) == Some(&b'.') {
            i += 1;
            digits(&mut i);
        }
    } else if b.get(i) == Some(&b'.') {
        i += 1;
        if digits(&mut i) == 0 {
            return false;
        }
    } else {
        return false;
    }
    if matches!(b.get(i), Some(b'e' | b'E')) {
        i += 1;
        if matches!(b.get(i), Some(b'+' | b'-')) {
            i += 1;
        }
        if digits(&mut i) == 0 {
            return false;
        }
    }
    i == b.len()
}

fn is_integer(v: &str) -> bool {
    let d = v.strip_prefix(['+', '-']).unwrap_or(v);
    !d.is_empty() && d.bytes().all(|c| c.is_ascii_digit())
}

// ---------------------------------------------------------------------------
// Scanner and validator
// ---------------------------------------------------------------------------

/// The first error, in Zeebe's words.
struct XmlFailure {
    rule: &'static str,
    message: String,
}

type R<T> = Result<T, XmlFailure>;

struct Attr {
    raw: String,
    local: String,
    ns: String,
    value: String,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Mode {
    Skip,
    Complex,
    Simple,
}

type NsMap = Rc<HashMap<String, String>>;

struct Frame {
    raw: String,
    ns: String,
    local: String,
    ns_map: NsMap,
    mode: Mode,
    ct: Option<Rc<ComplexType>>,
    simple: Option<String>,
    /// Content-model state: the particle reached and how often it matched.
    pi: isize,
    pc: usize,
    text: String,
    saw_text: bool,
    saw_child: bool,
    /// Nearest id of this element or an ancestor, for Zeebe's `id > child` naming.
    owner_id: String,
    /// Inside a non-executable process, which Zeebe's model walker skips.
    skipped: bool,
    /// Child positions from the root, for Zeebe's model walk order.
    path: Vec<usize>,
    children: usize,
    /// Index into `XmlChecker::flow_nodes`.
    node: Option<usize>,
}

/// A flow node's sequence flow references, which Zeebe's validators resolve eagerly.
struct NodeRefs {
    path: Vec<usize>,
    outgoing: Vec<String>,
    incoming: Vec<String>,
    /// Exclusive and inclusive gateways resolve their outgoing flows only as some flow's source.
    gateway: bool,
    id: Option<String>,
    /// Boundary events and compensation handlers also resolve their incoming flows.
    resolves_incoming: bool,
}

fn predefined(name: &str) -> Option<char> {
    match name {
        "lt" => Some('<'),
        "gt" => Some('>'),
        "amp" => Some('&'),
        "quot" => Some('"'),
        "apos" => Some('\''),
        _ => None,
    }
}

/// Types whose elements Zeebe requires an id on (`IdentifiableBpmnElementValidator`).
const ID_REQUIRED_TYPES: [&str; 5] = [
    "tFlowElement",
    "tProcess",
    "tMessage",
    "tSignal",
    "tEscalation",
];

enum Match {
    /// Wildcard content: nothing to validate against.
    Wild,
    Type(String),
    No,
}

struct XmlChecker {
    s: Vec<u16>,
    i: usize,
    line_starts: Vec<usize>,
    stack: Vec<Frame>,
    ids: HashSet<String>,
    idrefs: Vec<String>,
    /// Elements without the id Zeebe requires, by the id Zeebe would name them under.
    missing_ids: Vec<String>,
    /// The element each id names (the first one), as Zeebe's `getModelElementById` finds it.
    elements_by_id: HashMap<String, (String, String)>,
    flow_nodes: Vec<NodeRefs>,
    flow_sources: HashSet<String>,
    types: HashMap<String, Option<Rc<ComplexType>>>,
}

fn u(s: &str) -> Vec<u16> {
    s.encode_utf16().collect()
}

fn split_qname(raw: &str) -> (&str, &str) {
    match raw.find(':') {
        None => ("", raw),
        Some(c) => (&raw[..c], &raw[c + 1..]),
    }
}

impl XmlChecker {
    fn new(xml: &str) -> Self {
        let s = u(xml);
        let mut line_starts = vec![0];
        for k in 0..s.len() {
            if s[k] == 0x0a || (s[k] == 0x0d && s.get(k + 1) != Some(&0x0a)) {
                line_starts.push(k + 1);
            }
        }
        Self {
            s,
            i: 0,
            line_starts,
            stack: vec![],
            ids: HashSet::new(),
            idrefs: vec![],
            missing_ids: vec![],
            elements_by_id: HashMap::new(),
            flow_nodes: vec![],
            flow_sources: HashSet::new(),
            types: HashMap::new(),
        }
    }

    fn line(&self, pos: usize) -> usize {
        let mut lo = 0;
        let mut hi = self.line_starts.len() - 1;
        while lo < hi {
            let mid = (lo + hi + 1) >> 1;
            if self.line_starts[mid] <= pos {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        lo + 1
    }

    fn fatal_at(&self, text: &str, pos: usize) -> XmlFailure {
        XmlFailure {
            rule: "xml-schema",
            message: format!(
                "{PARSE_PREFIX}Fatal Error: URI=null Line={}: {text}",
                self.line(pos)
            ),
        }
    }

    fn fatal(&self, text: &str) -> XmlFailure {
        self.fatal_at(text, self.i)
    }

    fn error(&self, rule: &'static str, text: &str, pos: usize) -> XmlFailure {
        XmlFailure {
            rule,
            message: format!(
                "{PARSE_PREFIX}Error: URI=null Line={}: {text}",
                self.line(pos)
            ),
        }
    }

    fn ch(&self, i: usize) -> Option<u16> {
        self.s.get(i).copied()
    }

    fn is(&self, i: usize, c: char) -> bool {
        self.ch(i) == Some(c as u16)
    }

    fn starts_with(&self, text: &str) -> bool {
        let t = u(text);
        self.s.get(self.i..self.i + t.len()) == Some(&t[..])
    }

    fn index_of(&self, needle: &str, from: usize) -> Option<usize> {
        let t = u(needle);
        if from > self.s.len() || t.len() > self.s.len() {
            return None;
        }
        (from..=self.s.len() - t.len()).find(|&k| self.s[k..k + t.len()] == t[..])
    }

    fn slice(&self, a: usize, b: usize) -> String {
        let b = b.min(self.s.len());
        let a = a.min(b);
        String::from_utf16_lossy(&self.s[a..b])
    }

    /// `codePointAt`, -1 past the end.
    fn cp_at(&self, i: usize) -> i64 {
        let Some(hi) = self.ch(i) else {
            return -1;
        };
        if (0xd800..0xdc00).contains(&hi) {
            if let Some(lo) = self.ch(i + 1) {
                if (0xdc00..0xe000).contains(&lo) {
                    return 0x10000 + (((hi as i64) - 0xd800) << 10) + ((lo as i64) - 0xdc00);
                }
            }
        }
        hi as i64
    }

    fn skip_ws(&mut self) -> bool {
        let start = self.i;
        while self.i < self.s.len() && matches!(self.s[self.i], 0x20 | 0x09 | 0x0a | 0x0d) {
            self.i += 1;
        }
        self.i > start
    }

    fn read_name(&mut self) -> Option<String> {
        let start = self.i;
        let first = self.cp_at(self.i);
        if !is_name_start(first) && first != 0x3a {
            return None;
        }
        self.i += if first > 0xffff { 2 } else { 1 };
        while self.i < self.s.len() {
            let cp = self.cp_at(self.i);
            if !is_name_char(cp) && cp != 0x3a {
                break;
            }
            self.i += if cp > 0xffff { 2 } else { 1 };
        }
        Some(self.slice(start, self.i))
    }

    /// Reads a reference at `&` and returns its replacement text.
    fn read_reference(&mut self) -> R<char> {
        self.i += 1;
        if self.is(self.i, '#') {
            self.i += 1;
            let hex = self.is(self.i, 'x');
            if hex {
                self.i += 1;
            }
            let start = self.i;
            while self.i < self.s.len()
                && u8::try_from(self.s[self.i]).is_ok_and(|b| b.is_ascii_hexdigit())
            {
                self.i += 1;
            }
            let digits = self.slice(start, self.i);
            if digits.is_empty() || (!hex && digits.bytes().any(|b| b.is_ascii_alphabetic())) {
                return Err(self.fatal(if hex {
                    "A hexadecimal representation must immediately follow the \"&#x\" in a character reference."
                } else {
                    "A decimal representation must immediately follow the \"&#\" in a character reference."
                }));
            }
            if !self.is(self.i, ';') {
                return Err(self.fatal("The character reference must end with the ';' delimiter."));
            }
            self.i += 1;
            let radix = if hex { 16 } else { 10 };
            let cp = digits.chars().fold(0u64, |acc, d| {
                acc.saturating_mul(radix)
                    .saturating_add(d.to_digit(16).unwrap_or(0) as u64)
            });
            if !is_xml_char(cp) {
                return Err(self.fatal(&format!(
                    "Character reference \"&#{}{digits}\" is an invalid XML character.",
                    if hex { "x" } else { "" }
                )));
            }
            return Ok(char::from_u32(cp as u32).unwrap_or('\u{fffd}'));
        }
        let Some(name) = self.read_name() else {
            return Err(self.fatal(
                "The entity name must immediately follow the '&' in the entity reference.",
            ));
        };
        if !self.is(self.i, ';') {
            return Err(self.fatal(&format!(
                "The reference to entity \"{name}\" must end with the ';' delimiter."
            )));
        }
        self.i += 1;
        predefined(&name).ok_or_else(|| {
            self.fatal(&format!(
                "The entity \"{name}\" was referenced, but not declared."
            ))
        })
    }

    fn eof_error(&self) -> XmlFailure {
        self.fatal_at(
            "XML document structures must start and end within the same entity.",
            self.s.len(),
        )
    }

    fn skip_comment(&mut self) -> R<()> {
        let Some(end) = self.index_of("-->", self.i + 4) else {
            return Err(self.eof_error());
        };
        // `dashes` is always found: "-->" contains "--".
        let dashes = self.index_of("--", self.i + 4).unwrap_or(usize::MAX);
        if dashes < end {
            return Err(self.fatal_at(
                "The string \"--\" is not permitted within comments.",
                dashes,
            ));
        }
        self.i = end + 3;
        Ok(())
    }

    fn skip_pi(&mut self) -> R<()> {
        let head = self.slice(self.i, self.i + 64);
        let target: String = head
            .strip_prefix("<?")
            .unwrap_or("")
            .chars()
            .take_while(|&c| !is_js_space(c) && c != '?')
            .collect();
        if target.to_lowercase() == "xml" {
            return Err(self.fatal(
                "The processing instruction target matching \"[xX][mM][lL]\" is not allowed.",
            ));
        }
        let Some(end) = self.index_of("?>", self.i + 2) else {
            return Err(self.eof_error());
        };
        self.i = end + 2;
        Ok(())
    }

    /// Misc before or after the root: whitespace, comments and processing instructions.
    fn skip_misc(&mut self) -> R<()> {
        loop {
            self.skip_ws();
            if self.starts_with("<!--") {
                self.skip_comment()?;
            } else if self.starts_with("<?") {
                self.skip_pi()?;
            } else {
                return Ok(());
            }
        }
    }

    /// `/\bencoding\s*=\s*(["'])(.*?)\1/` on the declaration: the first encoding name.
    fn declared_encoding(&self, a: usize, b: usize) -> Option<String> {
        let chars: Vec<char> = self.slice(a, b).chars().collect();
        let word = |c: char| c.is_ascii_alphanumeric() || c == '_';
        let needle: Vec<char> = "encoding".chars().collect();
        for p in 0..chars.len() {
            if chars[p..].len() < needle.len() || chars[p..p + needle.len()] != needle[..] {
                continue;
            }
            if p > 0 && word(chars[p - 1]) {
                continue;
            }
            let mut k = p + needle.len();
            while k < chars.len() && is_js_space(chars[k]) {
                k += 1;
            }
            if chars.get(k) != Some(&'=') {
                continue;
            }
            k += 1;
            while k < chars.len() && is_js_space(chars[k]) {
                k += 1;
            }
            let Some(&q) = chars.get(k) else {
                continue;
            };
            if q != '"' && q != '\'' {
                continue;
            }
            let mut e = k + 1;
            while e < chars.len() && chars[e] != q {
                if matches!(chars[e], '\n' | '\r' | '\u{2028}' | '\u{2029}') {
                    break;
                }
                e += 1;
            }
            if chars.get(e) == Some(&q) {
                return Some(chars[k + 1..e].iter().collect());
            }
        }
        None
    }

    fn run(&mut self) -> R<()> {
        if self.ch(0) == Some(0xfeff) {
            self.i = 1;
        }
        if self.starts_with("<?xml")
            && matches!(self.ch(self.i + 5), Some(0x20 | 0x09 | 0x0a | 0x0d | 0x3f))
        {
            let Some(end) = self.index_of("?>", self.i) else {
                return Err(self.eof_error());
            };
            if let Some(enc) = self.declared_encoding(self.i, end) {
                let mut cs = enc.chars();
                let ok = cs.next().is_some_and(|c| c.is_ascii_alphabetic())
                    && cs.all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'));
                if !ok {
                    return Err(self.fatal(&format!("Invalid encoding name \"{enc}\".")));
                }
            }
            self.i = end + 2;
        }
        self.skip_misc()?;
        if self.i >= self.s.len() {
            return Err(self.fatal("Premature end of file."));
        }
        if self.starts_with("<!DOCTYPE") {
            return Err(self.fatal("DOCTYPE is disallowed when the feature \"http://apache.org/xml/features/disallow-doctype-decl\" set to true."));
        }
        if !self.is(self.i, '<') {
            return Err(self.fatal("Content is not allowed in prolog."));
        }
        self.start_tag()?;
        while !self.stack.is_empty() {
            self.content()?;
        }
        self.skip_misc()?;
        if self.i < self.s.len() {
            if self.is(self.i, '<') {
                return Err(self.fatal(
                    "The markup in the document following the root element must be well-formed.",
                ));
            }
            return Err(self.fatal("Content is not allowed in trailing section."));
        }
        Ok(())
    }

    fn content(&mut self) -> R<()> {
        if self.i >= self.s.len() {
            return Err(
                self.fatal("XML document structures must start and end within the same entity.")
            );
        }
        if !self.is(self.i, '<') {
            return self.text();
        }
        if self.starts_with("</") {
            self.end_tag()?;
        } else if self.starts_with("<!--") {
            self.skip_comment()?;
        } else if self.starts_with("<![CDATA[") {
            let Some(end) = self.index_of("]]>", self.i + 9) else {
                return Err(self.eof_error());
            };
            let text = self.slice(self.i + 9, end);
            self.on_text(&text);
            self.i = end + 3;
        } else if self.starts_with("<?") {
            self.skip_pi()?;
        } else {
            self.start_tag()?;
        }
        Ok(())
    }

    fn text(&mut self) -> R<()> {
        let mut out = String::new();
        while self.i < self.s.len() && !self.is(self.i, '<') {
            if self.is(self.i, '&') {
                out.push(self.read_reference()?);
                continue;
            }
            if self.is(self.i, ']') && self.starts_with("]]>") {
                return Err(self.fatal("The character sequence \"]]>\" must not appear in content unless used to mark the end of a CDATA section."));
            }
            let cp = self.cp_at(self.i) as u64;
            if !is_xml_char(cp) {
                return Err(self.fatal(&format!(
                    "An invalid XML character (Unicode: 0x{cp:x}) was found in the element content of the document."
                )));
            }
            out.push(char::from_u32(cp as u32).unwrap_or('\u{fffd}'));
            self.i += if cp > 0xffff { 2 } else { 1 };
        }
        self.on_text(&out);
        Ok(())
    }

    fn on_text(&mut self, text: &str) {
        let Some(top) = self.stack.last_mut() else {
            return;
        };
        if top.mode == Mode::Skip {
            return;
        }
        top.text.push_str(text);
        if !is_xml_whitespace(text) {
            top.saw_text = true;
        }
    }

    fn eof_check(&self) -> R<()> {
        if self.i >= self.s.len() {
            return Err(
                self.fatal("XML document structures must start and end within the same entity.")
            );
        }
        Ok(())
    }

    fn start_tag(&mut self) -> R<()> {
        self.i += 1;
        let Some(raw) = self.read_name() else {
            return Err(self.fatal(if self.stack.is_empty() {
                "The markup in the document preceding the root element must be well-formed."
            } else {
                "The content of elements must consist of well-formed character data or markup."
            }));
        };
        let mut attrs: Vec<(String, String)> = vec![];
        let mut self_close = false;
        loop {
            let ws = self.skip_ws();
            self.eof_check()?;
            if self.is(self.i, '>') {
                self.i += 1;
                break;
            }
            if self.starts_with("/>") {
                self.i += 2;
                self_close = true;
                break;
            }
            let name = if ws { self.read_name() } else { None };
            self.eof_check()?;
            let Some(name) = name else {
                return Err(self.fatal(&format!(
                    "Element type \"{raw}\" must be followed by either attribute specifications, \">\" or \"/>\"."
                )));
            };
            self.skip_ws();
            self.eof_check()?;
            if !self.is(self.i, '=') {
                return Err(self.fatal(&format!(
                    "Attribute name \"{name}\" associated with an element type \"{raw}\" must be followed by the ' = ' character."
                )));
            }
            self.i += 1;
            self.skip_ws();
            self.eof_check()?;
            let quote = self.ch(self.i).unwrap_or(0);
            if quote != b'"' as u16 && quote != b'\'' as u16 {
                return Err(self.fatal(&format!(
                    "Open quote is expected for attribute \"{name}\" associated with an  element type  \"{raw}\"."
                )));
            }
            self.i += 1;
            let mut value = String::new();
            loop {
                if self.i >= self.s.len() {
                    return Err(self.fatal(
                        "XML document structures must start and end within the same entity.",
                    ));
                }
                let ch = self.s[self.i];
                if ch == quote {
                    self.i += 1;
                    break;
                }
                if ch == b'<' as u16 {
                    return Err(self.fatal(&format!(
                        "The value of attribute \"{name}\" associated with an element type \"{raw}\" must not contain the '<' character."
                    )));
                }
                if ch == b'&' as u16 {
                    value.push(self.read_reference()?);
                    continue;
                }
                let cp = self.cp_at(self.i) as u64;
                if !is_xml_char(cp) {
                    return Err(self.fatal(&format!(
                        "An invalid XML character (Unicode: 0x{cp:x}) was found in the value of attribute \"{name}\" and element is \"{raw}\"."
                    )));
                }
                // Attribute-value normalization: line breaks and tabs become spaces.
                if ch == 0x0d && self.ch(self.i + 1) == Some(0x0a) {
                    self.i += 1;
                }
                value.push(if matches!(ch, 0x09 | 0x0a | 0x0d) {
                    ' '
                } else {
                    char::from_u32(cp as u32).unwrap_or('\u{fffd}')
                });
                self.i += if cp > 0xffff { 2 } else { 1 };
            }
            if attrs.iter().any(|a| a.0 == name) {
                return Err(self.fatal(&format!(
                    "Attribute \"{name}\" was already specified for element \"{raw}\"."
                )));
            }
            attrs.push((name, value));
        }
        let end_pos = self.i - 1;
        let parent_idx = self.stack.len().checked_sub(1);
        let ns_map = self.namespaces(&attrs, parent_idx.map(|p| &self.stack[p].ns_map));
        let (prefix, local) = split_qname(&raw);
        let ns = if prefix.is_empty() {
            Some(ns_map.get("").cloned().unwrap_or_default())
        } else {
            self.resolve_prefix(&ns_map, prefix)
        };
        let Some(ns) = ns else {
            return Err(self.fatal_at(
                &format!("The prefix \"{prefix}\" for element \"{raw}\" is not bound."),
                end_pos,
            ));
        };
        let mut resolved: Vec<Attr> = vec![];
        for (a_raw, a_value) in &attrs {
            if a_raw == "xmlns" || a_raw.starts_with("xmlns:") {
                continue;
            }
            let (ap, al) = split_qname(a_raw);
            let ans = if ap.is_empty() {
                Some(String::new())
            } else {
                self.resolve_prefix(&ns_map, ap)
            };
            let Some(ans) = ans else {
                return Err(self.fatal_at(
                    &format!(
                        "The prefix \"{ap}\" for attribute \"{a_raw}\" associated with an element type \"{raw}\" is not bound."
                    ),
                    end_pos,
                ));
            };
            resolved.push(Attr {
                raw: a_raw.clone(),
                local: al.to_string(),
                ns: ans,
                value: a_value.clone(),
            });
        }
        let id_attr = resolved.iter().find(|a| a.ns.is_empty() && a.local == "id");
        let parent = parent_idx.map(|p| &self.stack[p]);
        let owner_id = match id_attr {
            Some(a) if !a.value.is_empty() => a.value.clone(),
            _ => parent.map(|p| p.owner_id.clone()).unwrap_or_default(),
        };
        let skipped = parent.is_some_and(|p| p.skipped)
            || (ns == MODEL
                && local == "process"
                && resolved
                    .iter()
                    .find(|a| a.ns.is_empty() && a.local == "isExecutable")
                    .is_none_or(|a| a.value.to_lowercase() != "true"));
        let path = match parent_idx {
            None => vec![0],
            Some(p) => {
                let par = &mut self.stack[p];
                let mut path = par.path.clone();
                path.push(par.children);
                par.children += 1;
                path
            }
        };
        if let Some(a) = id_attr {
            self.elements_by_id
                .entry(a.value.clone())
                .or_insert_with(|| (ns.clone(), local.to_string()));
        }
        let mut frame = Frame {
            raw: raw.clone(),
            ns,
            local: local.to_string(),
            ns_map,
            mode: Mode::Skip,
            ct: None,
            simple: None,
            pi: -1,
            pc: 0,
            text: String::new(),
            saw_text: false,
            saw_child: false,
            owner_id,
            skipped,
            path,
            children: 0,
            node: None,
        };
        self.validate_start(&mut frame, parent_idx, &resolved, end_pos)?;
        self.collect_refs(&mut frame, &resolved);
        self.stack.push(frame);
        if self_close {
            self.finish(end_pos)?;
        }
        Ok(())
    }

    fn end_tag(&mut self) -> R<()> {
        self.i += 2;
        let Some(top_raw) = self.stack.last().map(|t| t.raw.clone()) else {
            return Ok(());
        };
        // Like Xerces, match the open element's name first, then require the '>'.
        if !self.starts_with(&top_raw) {
            return Err(self.fatal(&format!(
                "The element type \"{top_raw}\" must be terminated by the matching end-tag \"</{top_raw}>\"."
            )));
        }
        self.i += top_raw.encode_utf16().count();
        self.skip_ws();
        if !self.is(self.i, '>') {
            return Err(self.fatal(&format!(
                "The end-tag for element type \"{top_raw}\" must end with a '>' delimiter."
            )));
        }
        self.i += 1;
        self.finish(self.i - 1)
    }

    fn resolve_prefix(&self, ns_map: &NsMap, prefix: &str) -> Option<String> {
        match prefix {
            "xml" => Some(XML_NS.to_string()),
            "xmlns" => Some(XMLNS_NS.to_string()),
            _ => ns_map.get(prefix).filter(|u| !u.is_empty()).cloned(),
        }
    }

    fn namespaces(&self, attrs: &[(String, String)], inherited: Option<&NsMap>) -> NsMap {
        let decls: Vec<&(String, String)> = attrs
            .iter()
            .filter(|a| a.0 == "xmlns" || a.0.starts_with("xmlns:"))
            .collect();
        if decls.is_empty() {
            if let Some(i) = inherited {
                return Rc::clone(i);
            }
        }
        let mut map: HashMap<String, String> = inherited.map(|m| (**m).clone()).unwrap_or_default();
        for d in decls {
            let key = if d.0 == "xmlns" {
                String::new()
            } else {
                d.0[6..].to_string()
            };
            map.insert(key, d.1.clone());
        }
        Rc::new(map)
    }

    fn collect_refs(&mut self, frame: &mut Frame, attrs: &[Attr]) {
        let Some(ct) = frame.ct.clone() else {
            return;
        };
        if frame.skipped || frame.ns != MODEL {
            return;
        }
        let attr = |name: &str| {
            attrs
                .iter()
                .find(|a| a.ns.is_empty() && a.local == name)
                .map(|a| a.value.as_str())
        };
        if frame.local == "sequenceFlow" {
            if let Some(source) = attr("sourceRef") {
                self.flow_sources.insert(collapse(source));
            }
        }
        if !derives_from(&ct.name, "tFlowNode") {
            return;
        }
        frame.node = Some(self.flow_nodes.len());
        self.flow_nodes.push(NodeRefs {
            path: frame.path.clone(),
            outgoing: vec![],
            incoming: vec![],
            gateway: frame.local == "exclusiveGateway" || frame.local == "inclusiveGateway",
            id: attr("id").map(str::to_string),
            resolves_incoming: frame.local == "boundaryEvent"
                || (derives_from(&ct.name, "tTask")
                    && attr("isForCompensation").is_some_and(|v| v.to_lowercase() == "true")),
        });
    }

    /// The exception Zeebe's validators throw resolving a flow node's `outgoing`
    /// (or a boundary event's `incoming`) to a sequence flow, for the first node in
    /// Zeebe's walk order: parents first, then children from the last to the first.
    fn reference_failure(&self) -> Option<String> {
        let mut nodes: Vec<&NodeRefs> = self.flow_nodes.iter().collect();
        nodes.sort_by(|a, b| walk_order(&a.path, &b.path));
        for node in nodes {
            let sourced = node
                .id
                .as_ref()
                .is_some_and(|id| self.flow_sources.contains(id));
            let outgoing: &[String] = if node.gateway && !sourced {
                &[]
            } else {
                &node.outgoing
            };
            let incoming: &[String] = if node.resolves_incoming {
                &node.incoming
            } else {
                &[]
            };
            for r in outgoing.iter().chain(incoming) {
                let text = js_trim(r);
                let id = text.find(':').map_or(text, |c| &text[c + 1..]);
                let Some((ns, local)) = self.elements_by_id.get(id) else {
                    return Some(format!(
                        "PARSE: Unable to find a model element instance for id {id}"
                    ));
                };
                if ns == MODEL && local != "sequenceFlow" {
                    let mut cs = local.chars();
                    let first: String = cs
                        .next()
                        .map(|c| c.to_uppercase().collect())
                        .unwrap_or_default();
                    return Some(format!(
                        "PARSE: class io.camunda.zeebe.model.bpmn.impl.instance.{first}{}Impl cannot be cast to class io.camunda.zeebe.model.bpmn.instance.SequenceFlow",
                        cs.as_str()
                    ));
                }
            }
        }
        None
    }

    // -- schema validation ----------------------------------------------------

    fn complex_type(&mut self, name: &str) -> Option<Rc<ComplexType>> {
        if let Some(c) = self.types.get(name) {
            return c.clone();
        }
        let result = xsd_type(name).map(|spec| {
            let parts = split_top(spec, '|');
            let part = |n: usize| parts.get(n).copied().unwrap_or("");
            let (base, particles, attrs, flags) = (part(0), part(1), part(2), part(3));
            let ns = schema_name(name).0;
            let parent = if base.is_empty() {
                None
            } else {
                self.complex_type(base)
            };
            let own_particles: Vec<Particle> = if particles.is_empty() {
                vec![]
            } else {
                split_top(particles, ',')
                    .into_iter()
                    .map(|p| parse_particle(p, ns))
                    .collect()
            };
            let own_attrs: Vec<AttrDecl> = if attrs.is_empty() {
                vec![]
            } else {
                attrs
                    .split(',')
                    .map(|a| {
                        let eq = a.find('=').unwrap_or(0);
                        let required = a.ends_with('!');
                        AttrDecl {
                            name: a[..eq].to_string(),
                            ty: a[eq + 1..a.len() - usize::from(required)].to_string(),
                            required,
                        }
                    })
                    .collect()
            };
            // Xerces lists a derived type's own attributes before the inherited ones.
            let mut all_attrs = vec![];
            let inherited: Vec<&AttrDecl> = parent
                .as_ref()
                .map(|p| {
                    p.attrs
                        .iter()
                        .filter(|a| !own_attrs.iter().any(|o| o.name == a.name))
                        .collect()
                })
                .unwrap_or_default();
            let inherited: Vec<AttrDecl> = inherited
                .into_iter()
                .map(|a| AttrDecl {
                    name: a.name.clone(),
                    ty: a.ty.clone(),
                    required: a.required,
                })
                .collect();
            all_attrs.extend(own_attrs);
            all_attrs.extend(inherited);
            let mut all_particles = parent
                .as_ref()
                .map(|p| p.particles.clone())
                .unwrap_or_default();
            let own_empty = own_particles.is_empty();
            all_particles.extend(own_particles);
            Rc::new(ComplexType {
                name: name.to_string(),
                ns: ns.to_string(),
                particles: all_particles,
                attrs: all_attrs,
                any_attr: flags.contains('@') || parent.as_ref().is_some_and(|p| p.any_attr),
                mixed: flags.contains('~')
                    || (own_empty && parent.as_ref().is_some_and(|p| p.mixed)),
                is_abstract: flags.contains('!'),
            })
        });
        self.types.insert(name.to_string(), result.clone());
        result
    }

    fn validate_start(
        &mut self,
        frame: &mut Frame,
        parent_idx: Option<usize>,
        attrs: &[Attr],
        pos: usize,
    ) -> R<()> {
        let mut type_name: String;
        match parent_idx {
            None => {
                let decl = schema_key(&frame.ns, &frame.local).and_then(|k| global_element(&k));
                let Some((ty, _)) = decl else {
                    return Err(self.error(
                        "xml-schema",
                        &format!(
                            "cvc-elt.1.a: Cannot find the declaration of element '{}'.",
                            frame.raw
                        ),
                        pos,
                    ));
                };
                type_name = ty.to_string();
            }
            Some(p) => {
                let parent = &mut self.stack[p];
                if parent.mode == Mode::Skip {
                    return Ok(());
                }
                // Xerces reports children of simple or empty content at the parent's end tag.
                if parent.mode == Mode::Simple
                    || parent.ct.as_ref().is_some_and(|c| c.particles.is_empty())
                {
                    parent.saw_child = true;
                    // Without a content model to place it, Xerces still validates a child by its
                    // global declaration.
                    let decl = schema_key(&frame.ns, &frame.local).and_then(|k| global_element(&k));
                    let Some((ty, _)) = decl else {
                        return Ok(());
                    };
                    type_name = ty.to_string();
                } else {
                    match self.step(p, frame, pos)? {
                        Some(t) => type_name = t,
                        None => return Ok(()),
                    }
                }
            }
        }
        if type_name == EXT_TYPE {
            return Ok(());
        }
        if let Some(xsi_type) = attrs.iter().find(|a| a.ns == XSI && a.local == "type") {
            let declared = type_name.clone();
            type_name = self.xsi_type(frame, &xsi_type.value, pos)?;
            if type_name != declared && !derives_from(&type_name, &declared) {
                return Err(self.error(
                    "xml-schema",
                    &format!(
                        "cvc-elt.4.3: Type '{}' is not validly derived from the type definition, '{}', of element '{}'.",
                        collapse(&xsi_type.value),
                        schema_name(&declared).1,
                        frame.raw
                    ),
                    pos,
                ));
            }
        }
        if is_simple_type(&type_name) {
            frame.mode = Mode::Simple;
            frame.simple = Some(type_name);
            if let Some(extra) = attrs.iter().find(|a| a.ns != XSI) {
                return Err(self.error(
                    "xsd-content",
                    &format!(
                        "cvc-type.3.1.1: Element '{}' is a simple type, so it cannot have attributes, excepting those whose namespace name is identical to '{XSI}' and whose [local name] is one of 'type', 'nil', 'schemaLocation' or 'noNamespaceSchemaLocation'. However, the attribute, '{}' was found.",
                        frame.raw, extra.raw
                    ),
                    pos,
                ));
            }
            return Ok(());
        }
        let Some(ct) = self.complex_type(&type_name) else {
            return Ok(());
        };
        if ct.is_abstract {
            return Err(self.error(
                "xml-schema",
                &format!(
                    "cvc-type.2: The type definition cannot be abstract for element {}.",
                    frame.raw
                ),
                pos,
            ));
        }
        frame.mode = Mode::Complex;
        frame.ct = Some(Rc::clone(&ct));
        for a in attrs {
            if a.ns == XSI {
                continue;
            }
            let decl = if a.ns.is_empty() {
                ct.attrs.iter().find(|d| d.name == a.local)
            } else {
                None
            };
            let Some(decl) = decl else {
                if !a.ns.is_empty() && ct.any_attr && a.ns != ct.ns {
                    continue;
                }
                return Err(self.error(
                    "xsd-content",
                    &format!(
                        "cvc-complex-type.3.2.2: Attribute '{}' is not allowed to appear in element '{}'.",
                        a.raw, frame.raw
                    ),
                    pos,
                ));
            };
            if let Some((rule, msg)) = self.value(&decl.ty, &a.value, &frame.ns_map) {
                return Err(self.error(rule, &msg, pos));
            }
        }
        for d in &ct.attrs {
            if !d.required || attrs.iter().any(|a| a.ns.is_empty() && a.local == d.name) {
                continue;
            }
            return Err(self.error(
                missing_attribute_rule(&frame.local, &d.name),
                &format!(
                    "cvc-complex-type.4: Attribute '{}' must appear on element '{}'.",
                    d.name, frame.raw
                ),
                pos,
            ));
        }
        if !frame.skipped
            && frame.ns == MODEL
            && !attrs.iter().any(|a| a.ns.is_empty() && a.local == "id")
            && ID_REQUIRED_TYPES
                .iter()
                .any(|t| derives_from(&type_name, t))
        {
            self.missing_ids.push(
                parent_idx
                    .map(|p| self.stack[p].owner_id.clone())
                    .unwrap_or_default(),
            );
        }
        Ok(())
    }

    fn xsi_type(&self, frame: &Frame, raw: &str, pos: usize) -> R<String> {
        let value = collapse(raw);
        if !is_qname(&value) {
            return Err(self.error(
                "xml-schema",
                &format!(
                    "cvc-elt.4.1: The value '{value}' of attribute '{XSI},type' of element '{}' is not a valid QName.",
                    frame.raw
                ),
                pos,
            ));
        }
        let (prefix, local) = split_qname(&value);
        let ns = if prefix.is_empty() {
            Some(frame.ns_map.get("").cloned().unwrap_or_default())
        } else {
            self.resolve_prefix(&frame.ns_map, prefix)
        };
        if ns.as_deref() == Some(XSD_NS) && BUILTIN_SIMPLE.contains(&local) {
            return Ok(local.to_string());
        }
        let key = ns.and_then(|n| schema_key(&n, local));
        match key {
            Some(k) if xsd_type(&k).is_some() || is_simple_type(&k) => Ok(k),
            _ => Err(self.error(
                "xml-schema",
                &format!(
                    "cvc-elt.4.2: Cannot resolve '{value}' to a type definition for element '{}'.",
                    frame.raw
                ),
                pos,
            )),
        }
    }

    /// Matches a child against the parent's content model; the child's type, or `None` for
    /// wildcard content.
    fn step(&mut self, p: usize, child: &Frame, pos: usize) -> R<Option<String>> {
        let Some(ct) = self.stack[p].ct.clone() else {
            return Ok(None);
        };
        let (pi, pc) = (self.stack[p].pi, self.stack[p].pc);
        let ps = &ct.particles;
        let current = usize::try_from(pi).ok().and_then(|i| ps.get(i));
        if let Some(cur) = current {
            if (pc as f64) < cur.max {
                match match_particle(cur, child) {
                    Match::Wild => {
                        self.stack[p].pc += 1;
                        return Ok(None);
                    }
                    Match::Type(t) => {
                        self.stack[p].pc += 1;
                        return Ok(Some(t));
                    }
                    Match::No => {}
                }
            }
        }
        if current.is_none_or(|c| (pc as f64) >= c.min) {
            let mut j = (pi + 1) as usize;
            while j < ps.len() {
                let part = &ps[j];
                let hit = match match_particle(part, child) {
                    Match::Wild => Some(None),
                    Match::Type(t) => Some(Some(t)),
                    Match::No => None,
                };
                if let Some(t) = hit {
                    self.stack[p].pi = j as isize;
                    self.stack[p].pc = 1;
                    return Ok(t);
                }
                if part.min > 0.0 {
                    break;
                }
                j += 1;
            }
        }
        let short = short_by(current, pc);
        if let (Some(cur), Some(short)) = (current, short) {
            return Err(self.error(
                "xml-schema",
                &format!(
                    "cvc-complex-type.2.4.{}: Invalid content was found starting with element '{}'. {}",
                    if short == 1 { "g" } else { "h" },
                    child.raw,
                    minimum_message(cur, short, " in the current sequence")
                ),
                pos,
            ));
        }
        let expected = expected_at(ps, pi, pc);
        if expected.is_empty() {
            return Err(self.error(
                "xml-schema",
                &format!("cvc-complex-type.2.4.d: Invalid content was found starting with element '{}'. No child element is expected at this point.", child.raw),
                pos,
            ));
        }
        let declared =
            schema_key(&child.ns, &child.local).is_some_and(|k| global_element(&k).is_some());
        Err(self.error(
            if declared { "xml-schema" } else { "xsd-content" },
            &format!(
                "cvc-complex-type.2.4.a: Invalid content was found starting with element '{}'. One of '{{{}}}' is expected.",
                expanded_name(&child.ns, &child.local),
                expected.join(", ")
            ),
            pos,
        ))
    }

    /// End of an element: content-model completion, simple content, and the document's IDREFs
    /// at the root.
    fn finish(&mut self, pos: usize) -> R<()> {
        let Some(frame) = self.stack.pop() else {
            return Ok(());
        };
        if let (Mode::Complex, Some(ct)) = (frame.mode, frame.ct.as_ref()) {
            if (frame.saw_text && !ct.mixed) || frame.saw_child {
                return Err(self.error(
                    "xml-schema",
                    &if ct.particles.is_empty() {
                        format!("cvc-complex-type.2.1: Element '{}' must have no character or element information item [children], because the type's content type is empty.", frame.raw)
                    } else {
                        format!("cvc-complex-type.2.3: Element '{}' cannot have character [children], because the type's content type is element-only.", frame.raw)
                    },
                    pos,
                ));
            }
            let current = usize::try_from(frame.pi)
                .ok()
                .and_then(|i| ct.particles.get(i));
            if let (Some(cur), Some(short)) = (current, short_by(current, frame.pc)) {
                return Err(self.error(
                    "xml-schema",
                    &format!(
                        "cvc-complex-type.2.4.{}: The content of element '{}' is not complete. {}",
                        if short == 1 { "i" } else { "j" },
                        frame.raw,
                        minimum_message(cur, short, "")
                    ),
                    pos,
                ));
            }
            if !is_complete(&ct.particles, frame.pi, frame.pc) {
                return Err(self.error(
                    "xml-schema",
                    &format!(
                        "cvc-complex-type.2.4.b: The content of element '{}' is not complete. One of '{{{}}}' is expected.",
                        frame.raw,
                        expected_at(&ct.particles, frame.pi, frame.pc).join(", ")
                    ),
                    pos,
                ));
            }
        } else if let (Mode::Simple, Some(simple)) = (frame.mode, frame.simple.as_ref()) {
            if frame.saw_child {
                return Err(self.error(
                    "xml-schema",
                    &format!("cvc-type.3.1.2: Element '{}' is a simple type, so it must have no element information item [children].", frame.raw),
                    pos,
                ));
            }
            if let Some((rule, msg)) = self.value(simple, &frame.text, &frame.ns_map) {
                return Err(self.error(rule, &msg, pos));
            }
            let owner = self.stack.last().and_then(|f| f.node);
            if let (Some(owner), true) = (owner, frame.ns == MODEL) {
                if frame.local == "outgoing" {
                    self.flow_nodes[owner].outgoing.push(frame.text.clone());
                } else if frame.local == "incoming" {
                    self.flow_nodes[owner].incoming.push(frame.text.clone());
                }
            }
        }
        if self.stack.is_empty() {
            if let Some(missing) = self.idrefs.iter().find(|r| !self.ids.contains(*r)) {
                return Err(self.error(
                    "idref-resolves",
                    &format!("cvc-id.1: There is no ID/IDREF binding for IDREF '{missing}'."),
                    pos,
                ));
            }
        }
        Ok(())
    }

    /// Validates a value against a simple type; the rule and Xerces' message on failure.
    fn value(&mut self, ty: &str, raw: &str, ns_map: &NsMap) -> Option<(&'static str, String)> {
        if ty == "string" || ty == "anyURI" {
            return None;
        }
        if let Some(en) = xsd_enum(ty) {
            if en.is_empty() || en.contains(&raw) {
                return None;
            }
            return Some((
                "xsd-content",
                format!(
                    "cvc-enumeration-valid: Value '{raw}' is not facet-valid with respect to enumeration '[{}]'. It must be a value from the enumeration.",
                    en.join(", ")
                ),
            ));
        }
        let v = collapse(raw);
        let invalid = |rule: &'static str, name: &str| {
            Some((
                rule,
                format!("cvc-datatype-valid.1.2.1: '{v}' is not a valid value for '{name}'."),
            ))
        };
        match ty {
            "boolean" => {
                if matches!(v.as_str(), "true" | "false" | "1" | "0") {
                    None
                } else {
                    invalid("xsd-content", "boolean")
                }
            }
            "integer" | "int" => {
                if is_integer(&v) {
                    None
                } else {
                    invalid("xsd-content", "integer")
                }
            }
            "double" => {
                if is_double(&v) {
                    None
                } else {
                    invalid("xsd-content", "double")
                }
            }
            "ID" => {
                if !is_nc_name(&v) {
                    return invalid("id-ncname-unique", "NCName");
                }
                if self.ids.contains(&v) {
                    return Some((
                        "id-ncname-unique",
                        format!("cvc-id.2: There are multiple occurrences of ID value '{v}'."),
                    ));
                }
                self.ids.insert(v);
                None
            }
            "IDREF" => {
                if !is_nc_name(&v) {
                    return invalid("idref-resolves", "NCName");
                }
                self.idrefs.push(v);
                None
            }
            "QName" => {
                if !is_qname(&v) {
                    return invalid("idref-resolves", "QName");
                }
                let prefix = split_qname(&v).0;
                if !prefix.is_empty() && self.resolve_prefix(ns_map, prefix).is_none() {
                    return Some((
                        "idref-resolves",
                        format!("UndeclaredPrefix: Cannot resolve '{v}' as a QName: the prefix '{prefix}' is not declared."),
                    ));
                }
                None
            }
            _ => None,
        }
    }
}

/// Zeebe's `ModelWalker` order: an element before its children, later siblings before earlier
/// ones.
fn walk_order(a: &[usize], b: &[usize]) -> std::cmp::Ordering {
    for (x, y) in a.iter().zip(b) {
        if x != y {
            return y.cmp(x);
        }
    }
    a.len().cmp(&b.len())
}

/// The type a child takes when it matches the particle.
fn match_particle(p: &Particle, child: &Frame) -> Match {
    for alt in &p.alts {
        match alt.kind {
            AltKind::Any => return Match::Wild,
            AltKind::Other => {
                if child.ns != alt.ns && !child.ns.is_empty() {
                    return Match::Wild;
                }
            }
            AltKind::Local => {
                if child.ns == alt.ns && child.local == alt.local {
                    return alt.ty.clone().map_or(Match::No, Match::Type);
                }
            }
            AltKind::Ref => {
                let key = schema_key(&child.ns, &child.local);
                let mut decl = key.as_deref().and_then(global_element);
                let ty = decl.map(|d| d.0);
                let mut name: Option<String> = key;
                let mut guard = 0;
                while let (Some(d), Some(n)) = (decl, name.as_deref()) {
                    if guard >= 16 {
                        break;
                    }
                    let (ns, local) = schema_name(n);
                    if ns == alt.ns && local == alt.local {
                        return ty.map_or(Match::No, |t| Match::Type(t.to_string()));
                    }
                    name = d.1.map(str::to_string);
                    decl = name.as_deref().and_then(global_element);
                    guard += 1;
                }
            }
        }
    }
    Match::No
}

/// What Xerces lists as allowed next: the current particle while it may repeat, then up to the
/// next required one.
fn expected_at(ps: &[Particle], pi: isize, pc: usize) -> Vec<String> {
    let mut out = vec![];
    if let Some(cur) = usize::try_from(pi).ok().and_then(|i| ps.get(i)) {
        if (pc as f64) < cur.max {
            out.extend(cur.alts.iter().map(alt_label));
        }
        if (pc as f64) < cur.min {
            return out;
        }
    }
    for p in ps.iter().skip((pi + 1) as usize) {
        out.extend(p.alts.iter().map(alt_label));
        if p.min > 0.0 {
            break;
        }
    }
    out
}

/// How many more a counted particle (minOccurs above 1) needs once it has started.
fn short_by(p: Option<&Particle>, count: usize) -> Option<usize> {
    let p = p?;
    if p.min <= 1.0 || count == 0 || (count as f64) >= p.min {
        return None;
    }
    Some(p.min as usize - count)
}

fn minimum_message(p: &Particle, short: usize, wher: &str) -> String {
    let label = p.alts.iter().map(alt_label).collect::<Vec<_>>().join(", ");
    let more = if short == 1 {
        "One more instance is required to satisfy this constraint.".to_string()
    } else {
        format!("'{short}' more instances are required to satisfy this constraint.")
    };
    format!(
        "'{label}' is expected to occur a minimum of '{}' times{wher}. {more}",
        p.min as usize
    )
}

fn is_complete(ps: &[Particle], pi: isize, pc: usize) -> bool {
    if let Some(cur) = usize::try_from(pi).ok().and_then(|i| ps.get(i)) {
        if (pc as f64) < cur.min {
            return false;
        }
    }
    !ps.iter().skip((pi + 1) as usize).any(|p| p.min > 0.0)
}

fn missing_attribute_rule(element: &str, attribute: &str) -> &'static str {
    if attribute == "targetNamespace" && element == "definitions" {
        "target-namespace"
    } else if element == "sequenceFlow" {
        "sequence-flow-refs"
    } else if element == "boundaryEvent" && attribute == "attachedToRef" {
        "boundary-attached-ref"
    } else if element == "association" || element == "messageFlow" {
        "association-refs"
    } else {
        "xsd-required-name"
    }
}

/// Zeebe's parse and XSD stage: what the text must satisfy before BPMN Kit's tolerant parser
/// reads it. Also the missing ids Zeebe rejects (`id-present`) and `incoming`/`outgoing`
/// references Zeebe's validators fail to resolve.
///
/// Returns `true` (fatal) when Zeebe would stop at parsing, so the model rules are not run.
pub(super) fn check_xml(xml: &str, ctx: &mut ZeebeContext) -> bool {
    let mut checker = XmlChecker::new(xml);
    if let Err(f) = checker.run() {
        ctx.report(f.rule, "", f.message, suggestion(f.rule));
        return true;
    }
    if let Some(reference) = checker.reference_failure() {
        ctx.report(
            "idref-resolves",
            "",
            reference,
            "Point incoming and outgoing at the ids of existing sequence flows.",
        );
        return true;
    }
    if !checker.missing_ids.is_empty() {
        for owner in &checker.missing_ids {
            ctx.report(
                "id-present",
                owner,
                "Element id must be present and not empty.".to_string(),
                suggestion("id-present"),
            );
        }
        // BPMN Kit's parser cannot build a model without these ids, so the model rules cannot run.
        return true;
    }
    false
}
