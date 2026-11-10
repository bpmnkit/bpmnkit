//! Sniff what a string holds, and parse it without knowing in advance.

use crate::Error;

/// What [`detect`] found.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[non_exhaustive]
pub enum DocKind {
    /// BPMN 2.0 XML.
    Bpmn,
    /// DMN XML.
    Dmn,
    /// A Camunda form (JSON with `components`).
    Form,
    /// The line-based process text (`start[start Order] > ...`).
    ProcessText,
    /// A `CompactDiagram` (`processes`) or `CompactDmn` (`decisions`) as JSON.
    CompactJson,
    Unknown,
}

/// Looks at `input` and says which format it is. Cheap: no full parse, so a `Bpmn` answer
/// does not promise the XML is valid.
pub fn detect(input: &str) -> DocKind {
    let s = input.trim_start_matches('\u{feff}').trim_start();
    match s.as_bytes().first() {
        Some(b'<') => detect_xml(s),
        Some(b'{') => detect_json(s),
        Some(_) if looks_like_process_text(s) => DocKind::ProcessText,
        _ => DocKind::Unknown,
    }
}

/// The root start tag decides, by its namespace URI (the prefix is the author's choice).
fn detect_xml(s: &str) -> DocKind {
    let mut rest = s;
    // Skip the XML declaration, comments, processing instructions and a doctype.
    loop {
        rest = rest.trim_start();
        let skip = if rest.starts_with("<?") {
            "?>"
        } else if rest.starts_with("<!--") {
            "-->"
        } else if rest.starts_with("<!") {
            ">"
        } else {
            break;
        };
        match rest.find(skip) {
            Some(i) => rest = &rest[i + skip.len()..],
            None => return DocKind::Unknown,
        }
    }
    let Some(end) = rest.find('>') else {
        return DocKind::Unknown;
    };
    let tag = &rest[..end];
    if tag.contains("/BPMN/") && tag.contains("/MODEL") {
        DocKind::Bpmn
    } else if tag.contains("/DMN/") {
        DocKind::Dmn
    } else if root_name(tag) == "definitions" {
        // No namespace on the root (hand-written or minimal files): the children decide.
        if rest.contains("<decision") || rest.contains(":decision") {
            DocKind::Dmn
        } else if rest.contains("<process") || rest.contains(":process") {
            DocKind::Bpmn
        } else {
            DocKind::Unknown
        }
    } else {
        DocKind::Unknown
    }
}

/// The root element's local name (prefix stripped).
fn root_name(tag: &str) -> &str {
    let name = tag[1..]
        .split(|c: char| c.is_whitespace() || c == '/')
        .next()
        .unwrap_or("");
    name.rsplit(':').next().unwrap_or(name)
}

fn detect_json(s: &str) -> DocKind {
    let Ok(serde_json::Value::Object(o)) = serde_json::from_str::<serde_json::Value>(s) else {
        return DocKind::Unknown;
    };
    if o.get("components").is_some_and(|c| c.is_array()) {
        DocKind::Form
    } else if o.get("processes").is_some_and(|c| c.is_array())
        || o.get("decisions").is_some_and(|c| c.is_array())
    {
        DocKind::CompactJson
    } else {
        DocKind::Unknown
    }
}

/// `id[kind label]` on some line; `#` heading and `//` comment lines do not count.
fn looks_like_process_text(s: &str) -> bool {
    s.lines().map(str::trim).any(|line| {
        if line.starts_with('#') || line.starts_with("//") {
            return false;
        }
        match (line.find('['), line.rfind(']')) {
            (Some(open), Some(close)) if open > 0 && open < close => {
                let id = &line[..open];
                let id = id.rsplit(['>', ' ']).next().unwrap_or(id);
                !id.is_empty()
                    && id
                        .chars()
                        .all(|c| c.is_alphanumeric() || matches!(c, '_' | '-' | '.'))
            }
            _ => false,
        }
    })
}

/// A parsed document of any supported kind.
#[derive(Debug)]
#[non_exhaustive]
pub enum Document {
    #[cfg(feature = "bpmn")]
    Bpmn(bpmnkit_bpmn::model::BpmnDefinitions),
    #[cfg(feature = "dmn")]
    Dmn(bpmnkit_dmn::DmnDefinitions),
    #[cfg(feature = "form")]
    Form(bpmnkit_form::FormDefinition),
}

/// [`detect`] + parse. Process text and compact JSON are expanded (and laid out) into a
/// BPMN or DMN document. Expansion does not apply the Camunda 8 deploy gate, so a draft
/// still loads; run the lint crate to find what Zeebe would refuse.
pub fn load(input: &str) -> Result<Document, Error> {
    let kind = detect(input);
    match kind {
        #[cfg(feature = "bpmn")]
        DocKind::Bpmn => Ok(Document::Bpmn(bpmnkit_bpmn::parse_bpmn(input)?)),
        #[cfg(not(feature = "bpmn"))]
        DocKind::Bpmn => Err(Error::FeatureDisabled {
            kind,
            feature: "bpmn",
        }),
        #[cfg(feature = "dmn")]
        DocKind::Dmn => Ok(Document::Dmn(bpmnkit_dmn::parse_dmn(input)?)),
        #[cfg(not(feature = "dmn"))]
        DocKind::Dmn => Err(Error::FeatureDisabled {
            kind,
            feature: "dmn",
        }),
        #[cfg(feature = "form")]
        DocKind::Form => Ok(Document::Form(bpmnkit_form::parse_form(input)?)),
        #[cfg(not(feature = "form"))]
        DocKind::Form => Err(Error::FeatureDisabled {
            kind,
            feature: "form",
        }),
        #[cfg(feature = "text")]
        DocKind::ProcessText => {
            let parsed = bpmnkit_text::process_text::parse_process_text(input);
            Ok(Document::Bpmn(bpmnkit_text::compact::expand(
                &parsed.diagram,
                &lenient(),
            )?))
        }
        #[cfg(feature = "text")]
        DocKind::CompactJson => load_compact(input),
        #[cfg(not(feature = "text"))]
        DocKind::ProcessText | DocKind::CompactJson => Err(Error::FeatureDisabled {
            kind,
            feature: "text",
        }),
        _ => Err(Error::Unrecognized),
    }
}

#[cfg(feature = "text")]
fn lenient() -> bpmnkit_text::compact::ExpandOptions {
    bpmnkit_text::compact::ExpandOptions {
        validate: false,
        ..Default::default()
    }
}

#[cfg(feature = "text")]
fn load_compact(input: &str) -> Result<Document, Error> {
    let value: serde_json::Value = serde_json::from_str(input)
        .map_err(|e| bpmnkit_text::TextError::new(format!("compact JSON: {e}")))?;
    if value.get("decisions").is_some() {
        #[cfg(feature = "dmn")]
        {
            let compact: bpmnkit_text::dmn_compact::CompactDmn = serde_json::from_value(value)
                .map_err(|e| bpmnkit_text::TextError::new(format!("compact DMN: {e}")))?;
            return Ok(Document::Dmn(bpmnkit_text::dmn_compact::expand_dmn(
                &compact,
            )?));
        }
        #[cfg(not(feature = "dmn"))]
        return Err(Error::FeatureDisabled {
            kind: DocKind::Dmn,
            feature: "dmn",
        });
    }
    Ok(Document::Bpmn(bpmnkit_text::compact::expand_json(
        input,
        &lenient(),
    )?))
}
