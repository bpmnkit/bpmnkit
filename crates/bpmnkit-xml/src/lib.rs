//! XML reading and writing with the fidelity `@bpmnkit/core` (`packages/core/src/xml/xml-parser.ts`)
//! has: qualified names keep their prefixes, attributes keep their source order, and nothing is
//! namespace-resolved, so unknown content can be written back as it was read.
//!
//! Tokenising is done by `quick-xml` (borrowed events, builds for `wasm32-unknown-unknown`, and
//! already in reebe's dependency tree). What the TS scanner decides itself is decided here too:
//! entity decoding (the five predefined entities and character references; anything else is kept
//! as written), CDATA kept raw, comments and processing instructions dropped, text concatenated
//! per element, and everything after the root element ignored.
//!
//! ```
//! use bpmnkit_xml::{parse_xml, serialize_xml};
//!
//! let root = parse_xml(r#"<a:root xmlns:a="urn:x" b="1"><a:child>t</a:child></a:root>"#).unwrap();
//! assert_eq!(root.name, "a:root"); // prefixes are kept, not resolved
//! assert_eq!(root.local_name(), "root");
//! assert_eq!(root.attr("b"), Some("1"));
//! assert!(serialize_xml(&root).contains("<a:child>t</a:child>"));
//! ```

use indexmap::IndexMap;
use quick_xml::events::{BytesStart, Event};
use quick_xml::Reader;
use serde::{Deserialize, Serialize};
use std::fmt;

/// Attributes in source order. Qualified keys (`xsi:type`) are kept as written.
pub type Attrs = IndexMap<String, String>;

/// An element with namespace prefixes preserved. The JSON shape matches TS's `XmlElement`.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct XmlElement {
    /// Qualified name, e.g. `zeebe:taskDefinition`.
    pub name: String,
    pub attributes: Attrs,
    pub children: Vec<XmlElement>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

impl XmlElement {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            ..Self::default()
        }
    }

    /// The name without its prefix.
    pub fn local_name(&self) -> &str {
        local_name(&self.name)
    }

    pub fn attr(&self, name: &str) -> Option<&str> {
        self.attributes.get(name).map(String::as_str)
    }
}

/// `name` without its prefix (`bpmn:task` → `task`).
pub fn local_name(name: &str) -> &str {
    match name.find(':') {
        Some(i) => &name[i + 1..],
        None => name,
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct XmlError(pub String);

impl fmt::Display for XmlError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for XmlError {}

/// What a sink wants the scanner to do with an element after its start tag.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Visit {
    /// Report child elements and character data.
    All,
    /// Skip the content without decoding it; `end` is not called for the element.
    Skip,
    /// Report child elements, drop character data.
    ElementsOnly,
}

/// Receives the events of one document from [`scan_xml`].
pub trait XmlSink {
    /// `name` is qualified, `local` has the prefix removed; `end` follows a self-closing
    /// tag immediately unless the sink returned [`Visit::Skip`].
    fn start(&mut self, name: &str, local: &str, attributes: Attrs, self_closing: bool) -> Visit;
    /// Character data or CDATA directly inside the current element, entities decoded.
    fn text(&mut self, text: &str);
    fn end(&mut self, name: &str);
}

fn err(e: impl fmt::Display) -> XmlError {
    XmlError(e.to_string())
}

fn utf8(bytes: &[u8]) -> Result<&str, XmlError> {
    std::str::from_utf8(bytes).map_err(err)
}

fn attributes(e: &BytesStart<'_>) -> Result<Attrs, XmlError> {
    let mut attrs = Attrs::new();
    // Duplicates are not an error in TS: the last value wins, at the first position.
    for a in e.attributes().with_checks(false) {
        let a = a.map_err(err)?;
        let key = utf8(a.key.as_ref())?;
        let value = decode_entities(utf8(&a.value)?);
        attrs.insert(key.to_owned(), value);
    }
    Ok(attrs)
}

/// Scans `xml`, reporting the root element and everything inside it to `sink`. Returns false
/// when the document has no root element. Content after the root element is ignored.
pub fn scan_xml(xml: &str, sink: &mut impl XmlSink) -> Result<bool, XmlError> {
    let mut reader = Reader::from_str(xml);
    let config = reader.config_mut();
    config.trim_text(false);
    config.check_end_names = true;
    config.expand_empty_elements = false;
    // Whether each open element wants character data.
    let mut want_text: Vec<bool> = Vec::new();
    let mut seen_root = false;
    loop {
        let event = reader.read_event().map_err(err)?;
        match event {
            Event::Start(e) => {
                let name = utf8(e.name().into_inner())?;
                let visit = sink.start(name, local_name(name), attributes(&e)?, false);
                seen_root = true;
                if visit == Visit::Skip {
                    reader.read_to_end(e.name()).map_err(err)?;
                    if want_text.is_empty() {
                        return Ok(true);
                    }
                } else {
                    want_text.push(visit == Visit::All);
                }
            }
            Event::Empty(e) => {
                let name = utf8(e.name().into_inner())?;
                if sink.start(name, local_name(name), attributes(&e)?, true) != Visit::Skip {
                    sink.end(name);
                }
                if want_text.is_empty() {
                    return Ok(true);
                }
            }
            Event::End(e) => {
                if want_text.pop().is_none() {
                    return Err(XmlError(format!(
                        "Unexpected closing tag </{}>",
                        String::from_utf8_lossy(e.name().into_inner())
                    )));
                }
                sink.end(utf8(e.name().into_inner())?);
                if want_text.is_empty() {
                    return Ok(true);
                }
            }
            Event::Text(t) => {
                if want_text.last() == Some(&true) {
                    sink.text(&decode_entities(utf8(&t)?));
                }
            }
            Event::CData(t) => {
                if want_text.last() == Some(&true) {
                    sink.text(utf8(&t)?);
                }
            }
            Event::Eof => {
                if !want_text.is_empty() {
                    return Err(XmlError(format!(
                        "Expected \"</\" at position {}",
                        reader.buffer_position()
                    )));
                }
                return Ok(seen_root);
            }
            // Comments, processing instructions, the declaration and DOCTYPE carry nothing.
            _ => {}
        }
    }
}

/// Parses `xml` into an element tree.
pub fn parse_xml(xml: &str) -> Result<XmlElement, XmlError> {
    let mut b = TreeBuilder::default();
    if !scan_xml(xml, &mut b)? || b.root.is_none() {
        return Err(XmlError(
            "Failed to parse XML: no root element found".into(),
        ));
    }
    Ok(b.root.unwrap_or_default())
}

#[derive(Default)]
struct TreeBuilder {
    root: Option<XmlElement>,
    stack: Vec<XmlElement>,
}

impl XmlSink for TreeBuilder {
    fn start(&mut self, name: &str, _: &str, attributes: Attrs, _: bool) -> Visit {
        self.stack.push(XmlElement {
            name: name.to_owned(),
            attributes,
            children: vec![],
            text: None,
        });
        Visit::All
    }

    fn text(&mut self, text: &str) {
        if let Some(el) = self.stack.last_mut() {
            el.text.get_or_insert_with(String::new).push_str(text);
        }
    }

    fn end(&mut self, _: &str) {
        let Some(el) = self.stack.pop() else { return };
        match self.stack.last_mut() {
            Some(parent) => parent.children.push(el),
            None => self.root = Some(el),
        }
    }
}

/// Decodes `&amp; &lt; &gt; &quot; &apos;` and numeric character references. Other `&...;`
/// sequences are left as written, as in TS.
pub fn decode_entities(s: &str) -> String {
    if !s.contains('&') {
        return s.to_owned();
    }
    let mut out = String::with_capacity(s.len());
    let mut rest = s;
    while let Some(i) = rest.find('&') {
        out.push_str(&rest[..i]);
        rest = &rest[i..];
        let decoded = rest.find(';').and_then(|end| {
            let ent = &rest[1..end];
            let ch = match ent {
                "amp" => Some('&'),
                "lt" => Some('<'),
                "gt" => Some('>'),
                "quot" => Some('"'),
                "apos" => Some('\''),
                _ => {
                    let code = if let Some(hex) = ent.strip_prefix("#x") {
                        (!hex.is_empty() && hex.bytes().all(|b| b.is_ascii_hexdigit()))
                            .then(|| u32::from_str_radix(hex, 16).ok())
                            .flatten()
                    } else if let Some(dec) = ent.strip_prefix('#') {
                        (!dec.is_empty() && dec.bytes().all(|b| b.is_ascii_digit()))
                            .then(|| dec.parse::<u32>().ok())
                            .flatten()
                    } else {
                        None
                    };
                    code.map(|c| char::from_u32(c).unwrap_or('\u{FFFD}'))
                }
            };
            ch.map(|c| (c, end))
        });
        match decoded {
            Some((c, end)) => {
                out.push(c);
                rest = &rest[end + 1..];
            }
            None => {
                out.push('&');
                rest = &rest[1..];
            }
        }
    }
    out.push_str(rest);
    out
}

/// Escapes a value for use between double quotes, including the whitespace an XML parser would
/// normalise.
pub fn escape_attr(value: &str, out: &mut String) {
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '"' => out.push_str("&quot;"),
            '\n' => out.push_str("&#10;"),
            '\r' => out.push_str("&#13;"),
            '\t' => out.push_str("&#9;"),
            c => out.push(c),
        }
    }
}

/// Escapes a value for use as character data.
pub fn escape_text(value: &str, out: &mut String) {
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            c => out.push(c),
        }
    }
}

/// Writes `element` as a document with an XML declaration, two-space indentation and a
/// trailing newline, byte-identical to TS's `serializeXml`.
pub fn serialize_xml(element: &XmlElement) -> String {
    let mut out = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    write_element(element, 0, &mut out);
    out.push('\n');
    out
}

/// Writes one element at `depth`, ending with a newline.
pub fn write_element(el: &XmlElement, depth: usize, out: &mut String) {
    for _ in 0..depth {
        out.push_str("  ");
    }
    out.push('<');
    out.push_str(&el.name);
    for (k, v) in &el.attributes {
        out.push(' ');
        out.push_str(k);
        out.push_str("=\"");
        escape_attr(v, out);
        out.push('"');
    }
    if el.children.is_empty() && el.text.is_none() {
        out.push_str("/>\n");
        return;
    }
    out.push('>');
    if let Some(t) = &el.text {
        escape_text(t, out);
    }
    if !el.children.is_empty() {
        out.push('\n');
        for c in &el.children {
            write_element(c, depth + 1, out);
        }
        for _ in 0..depth {
            out.push_str("  ");
        }
    }
    out.push_str("</");
    out.push_str(&el.name);
    out.push_str(">\n");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decodes_known_entities_only() {
        assert_eq!(decode_entities("a &amp; b &lt;&#65;&#x42;"), "a & b <AB");
        assert_eq!(decode_entities("&nbsp; & &;"), "&nbsp; & &;");
    }

    #[test]
    fn keeps_prefixes_order_and_text() {
        let x = r#"<?xml version="1.0"?><!-- c --><a:root z="1" b:y="&quot;" x='2'>
  t<![CDATA[<raw>]]><b:child/><c>x &amp; y</c></a:root><after/>"#;
        let el = parse_xml(x).unwrap();
        assert_eq!(el.name, "a:root");
        let keys: Vec<_> = el.attributes.keys().cloned().collect();
        assert_eq!(keys, ["z", "b:y", "x"]);
        assert_eq!(el.attr("b:y"), Some("\""));
        assert_eq!(el.text.as_deref(), Some("\n  t<raw>"));
        assert_eq!(el.children[1].text.as_deref(), Some("x & y"));
    }

    #[test]
    fn writes_like_ts() {
        let el = parse_xml(r#"<r a="x&#10;"><c>1 &lt; 2</c><e/></r>"#).unwrap();
        assert_eq!(
            serialize_xml(&el),
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<r a=\"x&#10;\">\n  <c>1 &lt; 2</c>\n  <e/>\n</r>\n\n"
        );
    }

    #[test]
    fn errors() {
        assert!(parse_xml("<a><b></a>").is_err());
        assert!(parse_xml("<a>").is_err());
        assert!(parse_xml("  ").is_err());
    }

    struct SkipB(Vec<String>);
    impl XmlSink for SkipB {
        fn start(&mut self, n: &str, l: &str, _: Attrs, _: bool) -> Visit {
            self.0.push(format!("<{n}"));
            if l == "b" {
                Visit::Skip
            } else {
                Visit::ElementsOnly
            }
        }
        fn text(&mut self, t: &str) {
            self.0.push(t.to_owned());
        }
        fn end(&mut self, n: &str) {
            self.0.push(format!("</{n}"));
        }
    }

    #[test]
    fn skip_and_elements_only() {
        let mut s = SkipB(vec![]);
        assert!(scan_xml("<r>t<x:b><c/>u</x:b><d/></r>", &mut s).unwrap());
        assert_eq!(s.0, ["<r", "<x:b", "<d", "</d", "</r"]);
    }
}
