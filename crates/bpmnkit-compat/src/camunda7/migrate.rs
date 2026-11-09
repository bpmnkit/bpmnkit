//! Camunda 7 to Camunda 8 conversion (`migrate.ts`): converts what can be converted
//! mechanically and reports, element by element, what could not.
//!
//! What cannot be converted stays in the output verbatim (Camunda 8 ignores `camunda:`
//! content) and has a `manual` or `unsupported` finding saying why.

use super::juel::{
    contains_juel, feel_string, is_feel_name, is_js_space, js_trim, translate_juel_to_feel,
    JuelToFeelOptions, JuelToFeelResult,
};
use crate::zeebe::gate::{assert_deployable, AssertOptions, DeployabilityError, PlaceholderFill};
use bpmnkit_bpmn::zeebe::{bpmn_element_name, is_zeebe_placement_allowed};
use bpmnkit_bpmn::{
    Attrs, BpmnConditionExpression, BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement,
    BpmnMultiInstanceLoopCharacteristics, BpmnProcess, BpmnProcessContents, XmlElement,
};
use bpmnkit_feel::{parse_partial, ParseOptions};
use serde::Serialize;
use std::collections::HashSet;
use std::fmt;

pub const CAMUNDA7_NS: &str = "http://camunda.org/schema/1.0/bpmn";
pub const ZEEBE_NS: &str = "http://camunda.org/schema/zeebe/1.0";
pub const MODELER_NS: &str = "http://camunda.org/schema/modeler/1.0";
const DEFAULT_PLATFORM_VERSION: &str = "8.10.0";

/// How much work a Camunda 7 construct leaves after conversion.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Camunda7Severity {
    /// Rewritten mechanically; the Camunda 8 model behaves the same.
    Convertible,
    /// Camunda 8 has an equivalent, but a person has to supply or check it.
    Manual,
    /// Camunda 8 has no equivalent; the model or the surrounding system has to change.
    Unsupported,
}

/// One Camunda 7 construct and what migrating it takes.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Camunda7Finding {
    /// The element carrying the construct: a flow element, flow, process or the definitions.
    pub element_id: String,
    /// The BPMN type of that element, e.g. `serviceTask`, `sequenceFlow`, `process`.
    pub element_type: String,
    /// The process the element belongs to; empty for document-level findings.
    pub process_id: String,
    /// The Camunda 7 construct, e.g. `camunda:class` or `camunda:inputOutput`.
    pub construct: String,
    pub severity: Camunda7Severity,
    pub message: String,
    /// The Camunda 8 equivalent, or what to do instead.
    pub suggestion: String,
    /// Whether a Camunda 8 equivalent was written (and the original removed).
    pub applied: bool,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize)]
pub struct Camunda7Counts {
    pub convertible: usize,
    pub manual: usize,
    pub unsupported: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Camunda7Report {
    pub findings: Vec<Camunda7Finding>,
    pub counts: Camunda7Counts,
    pub total: usize,
}

impl Camunda7Report {
    pub fn new(findings: Vec<Camunda7Finding>) -> Self {
        let mut counts = Camunda7Counts::default();
        for f in &findings {
            match f.severity {
                Camunda7Severity::Convertible => counts.convertible += 1,
                Camunda7Severity::Manual => counts.manual += 1,
                Camunda7Severity::Unsupported => counts.unsupported += 1,
            }
        }
        let total = findings.len();
        Self {
            findings,
            counts,
            total,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Camunda7ConvertOptions {
    /// Written as `modeler:executionPlatformVersion`. Default `"8.10.0"`.
    pub execution_platform_version: Option<String>,
    /// Refuse a result Zeebe would reject on deploy (default `true`); `false` returns the
    /// conversion as it is.
    pub validate: bool,
    /// Fill the gate's documented placeholders instead of refusing; each fill is a
    /// `manual` finding in the report.
    pub placeholders: bool,
    /// The Camunda 8 version the gate checks. Default: `execution_platform_version`.
    pub camunda_version: Option<String>,
}

impl Default for Camunda7ConvertOptions {
    fn default() -> Self {
        Self {
            execution_platform_version: None,
            validate: true,
            placeholders: false,
            camunda_version: None,
        }
    }
}

impl Camunda7ConvertOptions {
    /// The conversion as it is, deployable or not (TS's `validate: false`).
    pub fn ungated() -> Self {
        Self {
            validate: false,
            ..Self::default()
        }
    }
}

#[derive(Debug, Clone)]
pub struct Camunda7Conversion {
    pub definitions: BpmnDefinitions,
    pub report: Camunda7Report,
    /// The placeholder values written; empty unless `placeholders` filled something.
    pub placeholders: Vec<PlaceholderFill>,
}

/// What `convert_camunda7` fails with: TS's `ValidationError` (the model already targets
/// Camunda 8), or the `DeployabilityError` the gate threw.
#[derive(Debug, Clone, PartialEq)]
pub struct Camunda7Error {
    pub message: String,
    /// Set when the deploy gate refused the result; `message` is its message.
    pub deployability: Option<Box<DeployabilityError>>,
}

impl Camunda7Error {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            deployability: None,
        }
    }
}

impl From<DeployabilityError> for Camunda7Error {
    fn from(error: DeployabilityError) -> Self {
        Self {
            message: error.to_string(),
            deployability: Some(Box::new(error)),
        }
    }
}

impl fmt::Display for Camunda7Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for Camunda7Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.deployability
            .as_deref()
            .map(|e| e as &(dyn std::error::Error + 'static))
    }
}

/// Whether `modeler:executionPlatform` names Camunda Cloud (TS's `detectExecutionPlatform`).
pub(crate) fn targets_camunda_cloud(d: &BpmnDefinitions) -> bool {
    d.unknown_attributes
        .get("modeler:executionPlatform")
        .is_some_and(|n| !n.is_empty() && n.to_lowercase().contains("cloud"))
}

/// Converts a Camunda 7 model to Camunda 8, as far as that can be done mechanically, and
/// reports what it could not do. The input is not modified.
pub fn convert_camunda7(
    definitions: &BpmnDefinitions,
    options: &Camunda7ConvertOptions,
) -> Result<Camunda7Conversion, Camunda7Error> {
    // A Camunda 8 model's job-worker user tasks would silently become Camunda user tasks.
    if targets_camunda_cloud(definitions) {
        return Err(Camunda7Error::new(
            "The model already targets Camunda 8 (modeler:executionPlatform names Camunda Cloud); there is nothing to migrate.",
        ));
    }
    let mut draft = definitions.clone();
    let mut converter = Converter::new(&draft, options);
    converter.run(&mut draft);
    if !options.validate {
        return Ok(Camunda7Conversion {
            definitions: draft,
            report: Camunda7Report::new(converter.findings),
            placeholders: vec![],
        });
    }
    // A refusal is the gate's error; `analyze_camunda7` still gives the report.
    let gated = assert_deployable(
        &draft,
        &AssertOptions {
            camunda_version: Some(
                options
                    .camunda_version
                    .clone()
                    .or_else(|| options.execution_platform_version.clone())
                    .unwrap_or_else(|| DEFAULT_PLATFORM_VERSION.to_string()),
            ),
            placeholders: options.placeholders,
            ..AssertOptions::default()
        },
    )?;
    let placeholders = gated.placeholders;
    let definitions = gated.definitions.into_owned();
    for fill in &placeholders {
        converter.add_placeholder(fill, &definitions);
    }
    Ok(Camunda7Conversion {
        definitions,
        report: Camunda7Report::new(converter.findings),
        placeholders,
    })
}

/// Reports what migrating a Camunda 7 model to Camunda 8 takes, without changing it.
pub fn analyze_camunda7(definitions: &BpmnDefinitions) -> Result<Camunda7Report, Camunda7Error> {
    // Analysis never gates: the report is what a refused conversion leaves to do.
    convert_camunda7(definitions, &Camunda7ConvertOptions::ungated()).map(|c| c.report)
}

/// The type and process of the element a placeholder went to (TS's `locateForReport`);
/// root elements belong to no process.
fn locate_for_report(definitions: &BpmnDefinitions, id: &str) -> (String, String) {
    fn visit(contents: &BpmnProcessContents, id: &str) -> Option<&'static str> {
        for el in &contents.flow_elements {
            if el.base().id == id {
                return Some(el.type_name());
            }
            if let Some(nested) = el.contents().and_then(|c| visit(c, id)) {
                return Some(nested);
            }
        }
        contents
            .sequence_flows
            .iter()
            .any(|f| f.id == id)
            .then_some("sequenceFlow")
    }
    for process in &definitions.processes {
        if let Some(ty) = visit(&process.contents, id) {
            return (ty.to_string(), process.id.clone());
        }
    }
    let root = if definitions.messages.iter().any(|m| m.id == id) {
        "message"
    } else if definitions.signals.iter().any(|m| m.id == id) {
        "signal"
    } else if definitions.errors.iter().any(|m| m.id == id) {
        "error"
    } else if definitions.escalations.iter().any(|m| m.id == id) {
        "escalation"
    } else {
        ""
    };
    (root.to_string(), String::new())
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn local_name(name: &str) -> &str {
    bpmnkit_xml::local_name(name)
}

/// `com.acme.ShipOrderDelegate` -> `shipOrderDelegate`, the Spring bean name the class gets by default.
fn bean_name(class_name: &str) -> String {
    let simple = class_name
        .rsplit_once('.')
        .map_or(class_name, |(_, s)| s)
        .replace('$', "");
    let mut chars = simple.chars();
    match chars.next() {
        Some(c) => c.to_lowercase().chain(chars).collect(),
        None => simple,
    }
}

/// `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/`
fn is_iso_date_time_with_zone(s: &str) -> bool {
    let b: Vec<char> = s.chars().collect();
    let digits = |from: usize, n: usize| {
        (from..from + n).all(|i| b.get(i).is_some_and(char::is_ascii_digit))
    };
    let at = |i: usize, c: char| b.get(i) == Some(&c);
    if !(digits(0, 4)
        && at(4, '-')
        && digits(5, 2)
        && at(7, '-')
        && digits(8, 2)
        && at(10, 'T')
        && digits(11, 2)
        && at(13, ':')
        && digits(14, 2))
    {
        return false;
    }
    let mut i = 16;
    if at(i, ':') && digits(i + 1, 2) {
        i += 3;
        if at(i, '.') && digits(i + 1, 1) {
            i += 1;
            while digits(i, 1) {
                i += 1;
            }
        }
    }
    if i == b.len() - 1 && at(i, 'Z') {
        return true;
    }
    (at(i, '+') || at(i, '-'))
        && digits(i + 1, 2)
        && at(i + 3, ':')
        && digits(i + 4, 2)
        && i + 6 == b.len()
}

/// The text between `${`/`#{` and `}` when `s` is exactly one braced expression.
fn braced_body(s: &str) -> Option<&str> {
    let t = js_trim(s);
    if !(t.starts_with("${") || t.starts_with("#{")) || !t.ends_with('}') || t.len() < 3 {
        return None;
    }
    Some(js_trim(&t[2..t.len() - 1]))
}

/// `/^[A-Za-z_][A-Za-z0-9_]*$/`
fn is_ident(s: &str) -> bool {
    let mut c = s.chars();
    c.next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_')
        && c.all(|c| c.is_ascii_alphanumeric() || c == '_')
}

/// `/^P\S+$/`
fn is_p_duration(s: &str) -> bool {
    s.len() > 1 && s.starts_with('P') && !s[1..].chars().any(is_js_space)
}

/// `/^R(\d+)\/(P\S+)$/`
fn parse_repeat(s: &str) -> Option<(&str, &str)> {
    let rest = s.strip_prefix('R')?;
    let digits = rest.chars().take_while(char::is_ascii_digit).count();
    let (n, rest) = rest.split_at(digits);
    let dur = rest.strip_prefix('/')?;
    (digits > 0 && is_p_duration(dur)).then_some((n, dur))
}

/// `/^P(T?0+[SMHD]|0+[DWMY])$/`: a zero interval retries at once.
fn is_zero_interval(s: &str) -> bool {
    let Some(rest) = s.strip_prefix('P') else {
        return false;
    };
    let zeros_then = |t: &str, units: &str| {
        let z = t.chars().take_while(|c| *c == '0').count();
        z > 0 && {
            let tail = &t[z..];
            tail.len() == 1 && units.contains(tail)
        }
    };
    zeros_then(rest.strip_prefix('T').unwrap_or(rest), "SMHD") || zeros_then(rest, "DWMY")
}

/// A Camunda 8 mapping target: a FEEL name, optionally a dotted path into a context.
fn is_feel_path(target: &str) -> bool {
    target.split('.').all(is_feel_name)
}

fn extension(name: &str, attrs: &[(&str, &str)]) -> XmlElement {
    let mut e = XmlElement::new(name);
    for (k, v) in attrs {
        e.attributes.insert((*k).to_string(), (*v).to_string());
    }
    e
}

fn has_feel_parse_errors(text: &str) -> bool {
    !parse_partial(text, &ParseOptions::default())
        .errors
        .is_empty()
}

type Translated = Result<String, String>;

/// An owner of Camunda 7 attributes and extension elements, with a stable key per extension
/// element (JS compares them by identity).
struct Owner<'a> {
    id: String,
    ty: String,
    ext: &'a mut Vec<XmlElement>,
    keys: Vec<u32>,
    next_key: u32,
    attrs: &'a mut Attrs,
    children: &'a mut Vec<XmlElement>,
}

impl<'a> Owner<'a> {
    fn new(
        id: &str,
        ty: &str,
        ext: &'a mut Vec<XmlElement>,
        attrs: &'a mut Attrs,
        children: &'a mut Vec<XmlElement>,
    ) -> Self {
        let n = ext.len() as u32;
        Self {
            id: id.to_string(),
            ty: ty.to_string(),
            ext,
            keys: (0..n).collect(),
            next_key: n,
            attrs,
            children,
        }
    }

    fn push(&mut self, el: XmlElement) -> u32 {
        let key = self.next_key;
        self.next_key += 1;
        self.ext.push(el);
        self.keys.push(key);
        key
    }

    fn pos(&self, key: u32) -> Option<usize> {
        self.keys.iter().position(|k| *k == key)
    }

    fn find(&self, name: &str) -> Option<u32> {
        self.ext
            .iter()
            .position(|e| e.name == name)
            .map(|i| self.keys[i])
    }

    fn get_mut(&mut self, key: u32) -> &mut XmlElement {
        let i = self.pos(key).expect("extension element key is live");
        &mut self.ext[i]
    }

    fn remove(&mut self, key: u32) {
        if let Some(i) = self.pos(key) {
            self.ext.remove(i);
            self.keys.remove(i);
        }
    }
}

/// What `with_owner` captured before the rules ran.
struct Snapshot {
    attributes: Vec<(String, String)>,
    elements: Vec<(u32, String)>,
}

struct Converter {
    findings: Vec<Camunda7Finding>,
    prefix: Option<String>,
    process_id: String,
    handled_attributes: HashSet<String>,
    handled_elements: HashSet<u32>,
    /// `(id, name, has zeebe:subscription)` of every message.
    messages: Vec<(String, Option<String>, bool)>,
    options: Camunda7ConvertOptions,
}

use Camunda7Severity::{Convertible, Manual, Unsupported};

impl Converter {
    fn new(d: &BpmnDefinitions, options: &Camunda7ConvertOptions) -> Self {
        Self {
            findings: vec![],
            prefix: d
                .namespaces
                .iter()
                .find(|(_, uri)| uri.as_str() == CAMUNDA7_NS)
                .map(|(p, _)| p.clone()),
            process_id: String::new(),
            handled_attributes: HashSet::new(),
            handled_elements: HashSet::new(),
            messages: d
                .messages
                .iter()
                .map(|m| {
                    (
                        m.id.clone(),
                        m.name.clone(),
                        m.extension_elements
                            .as_ref()
                            .is_some_and(|e| e.iter().any(|e| e.name == "zeebe:subscription")),
                    )
                })
                .collect(),
            options: options.clone(),
        }
    }

    fn run(&mut self, d: &mut BpmnDefinitions) {
        for error in &d.errors {
            let mut ext = error.extension_elements.clone().unwrap_or_default();
            let mut attrs = error.unknown_attributes.clone();
            let mut children = vec![];
            let owner = Owner::new(&error.id, "error", &mut ext, &mut attrs, &mut children);
            let snap = self.begin(&owner, &[]);
            if self.attr(owner.attrs, "errorMessage").is_some() {
                self.add(
                    &owner,
                    "camunda:errorMessage",
                    Unsupported,
                    "Camunda 8 errors carry only an error code.".into(),
                    "Have the worker pass the message along when it throws the error.",
                    false,
                );
                self.keep_attr("errorMessage");
            }
            self.finish(&owner, snap);
        }
        for m in &d.messages {
            if let Some(name) = m.name.as_deref().filter(|n| contains_juel(n)) {
                self.findings.push(Camunda7Finding {
                    element_id: m.id.clone(),
                    element_type: "message".into(),
                    process_id: String::new(),
                    construct: "bpmn:message name expression".into(),
                    severity: Manual,
                    message: format!("Message name \"{name}\" is a JUEL expression."),
                    suggestion: "Rewrite it as a FEEL expression (=…), or use a static name."
                        .into(),
                    applied: false,
                });
            }
        }
        for process in &mut d.processes {
            self.convert_process(process);
        }
        self.set_execution_platform(d);
    }

    // -----------------------------------------------------------------------
    // Plumbing
    // -----------------------------------------------------------------------

    fn key(&self, local: &str) -> String {
        format!("{}:{local}", self.prefix.as_deref().unwrap_or("camunda"))
    }

    fn attr(&self, attrs: &Attrs, local: &str) -> Option<String> {
        self.prefix.as_ref()?;
        attrs.get(&self.key(local)).cloned()
    }

    /// Marks an attribute as accounted for and removes it: its Camunda 8 form was written.
    fn drop_attr(&mut self, attrs: &mut Attrs, local: &str) {
        let key = self.key(local);
        attrs.shift_remove(&key);
        self.handled_attributes.insert(key);
    }

    /// Marks an attribute as accounted for and leaves it in place.
    fn keep_attr(&mut self, local: &str) {
        let key = self.key(local);
        self.handled_attributes.insert(key);
    }

    /// The `camunda:<local>` extension elements of the owner, with their keys.
    fn exts(&self, owner: &Owner, local: &str) -> Vec<(u32, XmlElement)> {
        if self.prefix.is_none() {
            return vec![];
        }
        let name = self.key(local);
        owner
            .ext
            .iter()
            .zip(&owner.keys)
            .filter(|(e, _)| e.name == name)
            .map(|(e, k)| (*k, e.clone()))
            .collect()
    }

    fn drop_ext(&mut self, owner: &mut Owner, key: u32) {
        self.handled_elements.insert(key);
        owner.remove(key);
    }

    fn keep_ext(&mut self, key: u32) {
        self.handled_elements.insert(key);
    }

    /// Lists a gate placeholder as work left: the value has to be replaced before going live.
    fn add_placeholder(&mut self, fill: &PlaceholderFill, filled: &BpmnDefinitions) {
        // The filled copy: a placeholder can be a message the fill created.
        let (element_type, process_id) = locate_for_report(filled, &fill.element_id);
        let field = fill.field.as_str();
        self.findings.push(Camunda7Finding {
            element_id: fill.element_id.clone(),
            element_type,
            process_id,
            construct: format!("placeholder {field}"),
            severity: Manual,
            message: format!(
                "Placeholder {field} \"{}\" written so the model deploys ({}).",
                fill.value, fill.rule
            ),
            suggestion:
                "Replace it with the real value; the placeholder does nothing useful at runtime."
                    .into(),
            applied: true,
        });
    }

    fn add(
        &mut self,
        owner: &Owner,
        construct: &str,
        severity: Camunda7Severity,
        message: String,
        suggestion: &str,
        applied: bool,
    ) {
        self.findings.push(Camunda7Finding {
            element_id: owner.id.clone(),
            element_type: owner.ty.clone(),
            process_id: self.process_id.clone(),
            construct: construct.to_string(),
            severity,
            message,
            suggestion: suggestion.to_string(),
            applied,
        });
    }

    /// Finds or creates a `zeebe:` extension, or returns `None` where the schema forbids it.
    fn zeebe(&self, owner: &mut Owner, local: &str) -> Option<u32> {
        let name = format!("zeebe:{local}");
        if !is_zeebe_placement_allowed(&bpmn_element_name(&owner.ty), &name) {
            return None;
        }
        if let Some(k) = owner.find(&name) {
            return Some(k);
        }
        Some(owner.push(XmlElement::new(name)))
    }

    fn has_zeebe(owner: &Owner, local: &str) -> bool {
        owner.find(&format!("zeebe:{local}")).is_some()
    }

    /// Captures the Camunda 7 attributes (of the owner, then of `nested` holders) and extension
    /// elements the rules have to account for.
    fn begin(&mut self, owner: &Owner, nested: &[&Attrs]) -> Snapshot {
        self.handled_attributes.clear();
        self.handled_elements.clear();
        let mut attributes = vec![];
        if let Some(prefix) = &self.prefix {
            let want = format!("{prefix}:");
            for holder in std::iter::once(&*owner.attrs).chain(nested.iter().copied()) {
                attributes.extend(
                    holder
                        .iter()
                        .filter(|(k, _)| k.starts_with(&want))
                        .map(|(k, v)| (k.clone(), v.clone())),
                );
            }
        }
        let elements = match &self.prefix {
            Some(prefix) => {
                let want = format!("{prefix}:");
                owner
                    .ext
                    .iter()
                    .zip(&owner.keys)
                    .filter(|(e, _)| e.name.starts_with(&want))
                    .map(|(e, k)| (*k, e.name.clone()))
                    .collect()
            }
            None => vec![],
        };
        Snapshot {
            attributes,
            elements,
        }
    }

    /// Reports every Camunda 7 attribute or extension element no rule accounted for, so nothing
    /// passes unmentioned.
    fn finish(&mut self, owner: &Owner, snap: Snapshot) {
        for (key, value) in snap.attributes {
            if self.handled_attributes.contains(&key) {
                continue;
            }
            self.add(
                owner,
                &format!("camunda:{}", local_name(&key)),
                Manual,
                format!("Camunda 7 attribute {key}=\"{value}\" has no automatic conversion."),
                "Review it against the Camunda 8 documentation; it is kept in the file, where Camunda 8 ignores it.",
                false,
            );
        }
        for (key, name) in snap.elements {
            if self.handled_elements.contains(&key) {
                continue;
            }
            self.add(
                owner,
                &format!("camunda:{}", local_name(&name)),
                Manual,
                format!("Camunda 7 extension <{name}> has no automatic conversion."),
                "Review it against the Camunda 8 documentation; it is kept in the file, where Camunda 8 ignores it.",
                false,
            );
        }
    }

    /// A value that may be static or JUEL, as a Camunda 8 attribute value: static text stays
    /// static, a provable `${…}` becomes `=feel`.
    fn static_or_expression(&self, value: &str, multi_instance: bool) -> Translated {
        if !contains_juel(value) {
            return Ok(value.to_string());
        }
        match translate_juel_to_feel(value, JuelToFeelOptions { multi_instance }) {
            JuelToFeelResult::Ok { feel } => Ok(format!("={feel}")),
            JuelToFeelResult::Refused { reason } => Err(reason),
        }
    }

    /// A value that is always an expression in Camunda 8 (IO mapping source): literals become
    /// FEEL literals.
    fn feel_value(&self, text: Option<&str>) -> Translated {
        let trimmed = js_trim(text.unwrap_or(""));
        if trimmed.is_empty() {
            return Ok("null".into());
        }
        if !contains_juel(trimmed) {
            return Ok(feel_string(trimmed));
        }
        match translate_juel_to_feel(trimmed, JuelToFeelOptions::default()) {
            JuelToFeelResult::Ok { feel } => Ok(feel),
            JuelToFeelResult::Refused { reason } => Err(reason),
        }
    }

    // -----------------------------------------------------------------------
    // Process and containers
    // -----------------------------------------------------------------------

    fn convert_process(&mut self, process: &mut BpmnProcess) {
        self.process_id = process.id.clone();
        {
            let mut owner = Owner::new(
                &process.id,
                "process",
                &mut process.extension_elements,
                &mut process.unknown_attributes,
                &mut process.unknown_children,
            );
            let snap = self.begin(&owner, &[]);
            self.process_rules(&mut owner);
            self.finish(&owner, snap);
        }
        self.convert_container(&mut process.contents);
    }

    fn process_rules(&mut self, owner: &mut Owner) {
        if let Some(version_tag) = self.attr(owner.attrs, "versionTag") {
            if let Some(tag) = self.zeebe(owner, "versionTag") {
                owner
                    .get_mut(tag)
                    .attributes
                    .insert("value".into(), version_tag.clone());
                self.drop_attr(owner.attrs, "versionTag");
                self.add(
                    owner,
                    "camunda:versionTag",
                    Convertible,
                    format!("Version tag \"{version_tag}\" moved to zeebe:versionTag."),
                    "zeebe:versionTag",
                    true,
                );
            }
        }
        if let Some(ttl) = self.attr(owner.attrs, "historyTimeToLive") {
            self.keep_attr("historyTimeToLive");
            self.add(
                owner,
                "camunda:historyTimeToLive",
                Unsupported,
                format!("Camunda 8 has no per-process history time to live (was \"{ttl}\")."),
                "Configure data retention for the cluster (Operate, Tasklist and Optimize archiving).",
                false,
            );
        }
        for local in ["candidateStarterGroups", "candidateStarterUsers"] {
            if self.attr(owner.attrs, local).is_none() {
                continue;
            }
            self.keep_attr(local);
            self.add(
                owner,
                &format!("camunda:{local}"),
                Unsupported,
                "Camunda 8 does not restrict who may start a process in the model.".into(),
                "Grant CREATE_PROCESS_INSTANCE on the process definition through authorizations.",
                false,
            );
        }
        if self.attr(owner.attrs, "isStartableInTasklist").is_some() {
            self.keep_attr("isStartableInTasklist");
            self.add(
                owner,
                "camunda:isStartableInTasklist",
                Unsupported,
                "Camunda 8 decides Tasklist start visibility outside the model.".into(),
                "Use a start form and authorizations to control starting from Tasklist.",
                false,
            );
        }
        for local in ["jobPriority", "taskPriority"] {
            if self.attr(owner.attrs, local).is_none() {
                continue;
            }
            self.keep_attr(local);
            self.add(
                owner,
                &format!("camunda:{local}"),
                Manual,
                "Camunda 7 job/external-task priorities order its own job executor and fetch-and-lock; Camunda 8 prioritises worker jobs differently.".into(),
                "If priority matters, set zeebe:jobPriorityDefinition (job prioritization) and check its semantics.",
                false,
            );
        }
        self.convert_common(owner);
    }

    fn convert_container(&mut self, contents: &mut BpmnProcessContents) {
        for element in &mut contents.flow_elements {
            self.convert_flow_element(element);
            if let Some(nested) = nested_contents(element) {
                self.convert_container(nested);
            }
        }
        for flow in &mut contents.sequence_flows {
            let mut owner = Owner::new(
                &flow.id,
                "sequenceFlow",
                &mut flow.extension_elements,
                &mut flow.unknown_attributes,
                &mut flow.unknown_children,
            );
            let snap = self.begin(&owner, &[]);
            if let Some(condition) = &mut flow.condition_expression {
                self.convert_flow_condition(&owner, condition);
            }
            self.convert_common(&mut owner);
            self.finish(&owner, snap);
        }
    }

    fn convert_flow_element(&mut self, element: &mut BpmnFlowElement) {
        use BpmnFlowElement::*;
        let ty = element.type_name();
        let mut message_ref = None;
        let (base, defs, loop_): (_, Option<&mut Vec<BpmnEventDefinition>>, Option<&mut _>) =
            match element {
                StartEvent(e) => (&mut e.base, Some(&mut e.event_definitions), None),
                EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
                    (&mut e.base, Some(&mut e.event_definitions), None)
                }
                BoundaryEvent(e) => (&mut e.base, Some(&mut e.event_definitions), None),
                Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
                | ManualTask(a) | CallActivity(a) => {
                    (&mut a.base, None, Some(&mut a.loop_characteristics))
                }
                SendTask(t) | ReceiveTask(t) => {
                    message_ref = t.message_ref.clone();
                    (&mut t.base, None, Some(&mut t.loop_characteristics))
                }
                SubProcess(s) => (&mut s.base, None, Some(&mut s.loop_characteristics)),
                AdHocSubProcess(s) => (&mut s.base, None, Some(&mut s.loop_characteristics)),
                Transaction(s) => (&mut s.base, None, Some(&mut s.loop_characteristics)),
                EventSubProcess(s) => (&mut s.base, None, None),
                ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => {
                    (&mut g.base, None, None)
                }
                ParallelGateway(b) | EventBasedGateway(b) => (b, None, None),
                DataObject(d) => (&mut d.base, None, None),
                DataObjectReference(d) => (&mut d.base, None, None),
                DataStoreReference(d) => (&mut d.base, None, None),
            };
        let mut owner = Owner::new(
            &base.id,
            ty,
            &mut base.extension_elements,
            &mut base.unknown_attributes,
            &mut base.unknown_children,
        );
        let mut holders: Vec<&Attrs> = vec![];
        if let Some(defs) = &defs {
            holders.extend(defs.iter().filter_map(definition_attrs));
        }
        if let Some(Some(l)) = &loop_ {
            holders.extend(l.unknown_attributes.as_ref());
        }
        let snap = self.begin(&owner, &holders);
        drop(holders);
        self.convert_element(&mut owner, ty, message_ref, defs, loop_);
        self.finish(&owner, snap);
    }

    fn convert_element(
        &mut self,
        owner: &mut Owner,
        ty: &str,
        message_ref: Option<String>,
        defs: Option<&mut Vec<BpmnEventDefinition>>,
        loop_: Option<&mut Option<BpmnMultiInstanceLoopCharacteristics>>,
    ) {
        self.convert_async(owner);
        match ty {
            "serviceTask" | "sendTask" => self.convert_implementation(owner, None),
            "businessRuleTask" => {
                if self.attr(owner.attrs, "decisionRef").is_some() {
                    self.convert_decision(owner);
                } else {
                    self.convert_implementation(owner, None);
                }
            }
            "userTask" => self.convert_user_task(owner),
            "callActivity" => self.convert_call_activity(owner),
            "scriptTask" => self.convert_script_task(owner),
            "receiveTask" => self.check_correlation(owner, message_ref.as_deref()),
            "startEvent" => {
                self.convert_start_event(owner);
                if let Some(defs) = defs {
                    self.convert_event_definitions(owner, defs);
                }
            }
            "intermediateCatchEvent" | "boundaryEvent" => {
                if let Some(defs) = defs {
                    self.convert_event_definitions(owner, defs);
                    for d in defs.iter() {
                        if let BpmnEventDefinition::Message(m) = d {
                            self.check_correlation(owner, m.message_ref.as_deref());
                        }
                    }
                }
            }
            "intermediateThrowEvent" | "endEvent" => {
                if let Some(defs) = defs {
                    self.convert_event_definitions(owner, defs);
                    if defs
                        .iter()
                        .any(|d| matches!(d, BpmnEventDefinition::Message(_)))
                    {
                        self.convert_message_throw(owner, defs);
                    }
                }
            }
            _ => {}
        }
        if let Some(Some(l)) = loop_ {
            self.convert_loop(owner, l);
        }
        self.convert_standard_loop(owner);
        self.convert_common(owner);
        self.convert_retry_cycle(owner);
    }

    // -----------------------------------------------------------------------
    // Rules shared by every element
    // -----------------------------------------------------------------------

    fn convert_async(&mut self, owner: &mut Owner) {
        let present: Vec<&str> = [
            "asyncBefore",
            "asyncAfter",
            "async",
            "exclusive",
            "jobPriority",
        ]
        .into_iter()
        .filter(|l| self.attr(owner.attrs, l).is_some())
        .collect();
        if present.is_empty() {
            return;
        }
        for local in &present {
            self.drop_attr(owner.attrs, local);
        }
        let construct = present
            .iter()
            .map(|l| format!("camunda:{l}"))
            .collect::<Vec<_>>()
            .join(", ");
        self.add(
            owner,
            &construct,
            Convertible,
            "Dropped: Camunda 8 has no asynchronous continuations. The engine commits after every step and every job-based task is already a wait state, so there is no transaction boundary to place and no job executor job to prioritise.".into(),
            "Nothing to model. A failure no longer rolls back to the last async boundary: a job failure retries the job, and an expression failure raises an incident on the element.",
            true,
        );
    }

    fn convert_common(&mut self, owner: &mut Owner) {
        for (key, io) in self.exts(owner, "inputOutput") {
            self.convert_input_output(owner, key, &io);
        }
        for (key, properties) in self.exts(owner, "properties") {
            let Some(target) = self.zeebe(owner, "properties") else {
                continue;
            };
            for property in &properties.children {
                owner.get_mut(target).children.push(extension(
                    "zeebe:property",
                    &[
                        ("name", property.attr("name").unwrap_or("")),
                        ("value", property.attr("value").unwrap_or("")),
                    ],
                ));
            }
            self.drop_ext(owner, key);
            self.add(
                owner,
                "camunda:properties",
                Convertible,
                "Extension properties moved to zeebe:properties.".into(),
                "zeebe:properties",
                true,
            );
        }
        for (key, listener) in self.exts(owner, "executionListener") {
            self.keep_ext(key);
            let event = listener.attr("event").unwrap_or("start");
            if event == "take" {
                self.add(
                    owner,
                    "camunda:executionListener",
                    Unsupported,
                    "Camunda 8 has no listener on taking a sequence flow.".into(),
                    "Move the logic into a task or an end listener on the source element.",
                    false,
                );
                continue;
            }
            let described = describe_implementation(&listener, self.prefix.as_deref());
            self.add(
                owner,
                "camunda:executionListener",
                Manual,
                format!("Execution listener on \"{event}\" ({described}) runs Java or script code in the engine."),
                &format!("Implement it as a job worker and declare it with zeebe:executionListeners (eventType=\"{event}\", type=\"<job type>\")."),
                false,
            );
        }
        for local in ["formData", "formProperty"] {
            for (key, _) in self.exts(owner, local) {
                self.keep_ext(key);
                self.add(
                    owner,
                    &format!("camunda:{local}"),
                    Manual,
                    "Generated task forms have no Camunda 8 equivalent.".into(),
                    "Rebuild the form as a Camunda Form and link it with zeebe:formDefinition formId.",
                    false,
                );
            }
        }
        for (key, _) in self.exts(owner, "errorEventDefinition") {
            self.keep_ext(key);
            self.add(
                owner,
                "camunda:errorEventDefinition",
                Manual,
                "External-task error event definitions evaluate an expression on the worker's result in the engine.".into(),
                "Throw the BPMN error from the job worker (throw-error command) instead.",
                false,
            );
        }
    }

    fn convert_input_output(&mut self, owner: &mut Owner, io_key: u32, io: &XmlElement) {
        let Some(mapping) = self.zeebe(owner, "ioMapping") else {
            self.keep_ext(io_key);
            let message = format!(
                "Camunda 8 does not allow input/output mappings on {}.",
                owner.ty
            );
            self.add(
                owner,
                "camunda:inputOutput",
                Manual,
                message,
                "Move the mappings to a neighbouring activity.",
                false,
            );
            return;
        };
        let mut kept: Vec<XmlElement> = vec![];
        let mut converted = 0;
        for parameter in &io.children {
            let direction = if local_name(&parameter.name) == "inputParameter" {
                "input"
            } else {
                "output"
            };
            let target = parameter.attr("name").unwrap_or("");
            let value = self.parameter_value(parameter);
            let ok_value = match &value {
                Ok(v) if is_feel_path(target) => Some(v.clone()),
                _ => None,
            };
            let Some(value) = ok_value else {
                kept.push(parameter.clone());
                let reason = match &value {
                    Ok(_) => format!("\"{target}\" is not a valid Camunda 8 target name"),
                    Err(r) => r.clone(),
                };
                let label = if direction == "input" {
                    "Input"
                } else {
                    "Output"
                };
                self.add(
                    owner,
                    &format!("camunda:{direction}Parameter"),
                    Manual,
                    format!("{label} parameter \"{target}\" was not converted: {reason}."),
                    &format!("Write it as <zeebe:{direction} source=\"=…\" target=\"{target}\"/> by hand."),
                    false,
                );
                continue;
            };
            owner.get_mut(mapping).children.push(extension(
                &format!("zeebe:{direction}"),
                &[("source", &format!("={value}")), ("target", target)],
            ));
            converted += 1;
        }
        if owner.get_mut(mapping).children.is_empty() {
            owner.remove(mapping);
        }
        if kept.is_empty() {
            self.drop_ext(owner, io_key);
        } else {
            owner.get_mut(io_key).children = kept;
            self.keep_ext(io_key);
        }
        if converted > 0 {
            self.add(
                owner,
                "camunda:inputOutput",
                Convertible,
                format!(
                    "{converted} input/output parameter{} moved to zeebe:ioMapping, JUEL translated to FEEL.",
                    if converted == 1 { "" } else { "s" }
                ),
                "zeebe:ioMapping",
                true,
            );
        }
    }

    fn parameter_value(&self, parameter: &XmlElement) -> Translated {
        match parameter.children.first() {
            None => self.feel_value(parameter.text.as_deref()),
            Some(child) => self.structured_value(child),
        }
    }

    fn nested_value(&self, item: &XmlElement) -> Translated {
        match item.children.first() {
            None => self.feel_value(item.text.as_deref()),
            Some(c) => self.structured_value(c),
        }
    }

    fn structured_value(&self, element: &XmlElement) -> Translated {
        match local_name(&element.name) {
            "list" => {
                let mut items = vec![];
                for item in &element.children {
                    items.push(self.nested_value(item)?);
                }
                Ok(format!("[{}]", items.join(", ")))
            }
            "map" => {
                let mut entries = vec![];
                for entry in &element.children {
                    let value = self.nested_value(entry)?;
                    entries.push(format!(
                        "{}: {value}",
                        feel_string(entry.attr("key").unwrap_or(""))
                    ));
                }
                Ok(format!("{{{}}}", entries.join(", ")))
            }
            "script" => {
                let format = element.attr("scriptFormat").unwrap_or("").to_lowercase();
                if format == "feel" && element.attr("resource").is_none() {
                    return self.checked_feel(element.text.as_deref().unwrap_or(""));
                }
                Err(format!(
                    "it is a {} script",
                    element.attr("scriptFormat").unwrap_or("script")
                ))
            }
            _ => Err(format!(
                "<{}> is not a value Camunda 8 can express",
                element.name
            )),
        }
    }

    fn checked_feel(&self, text: &str) -> Translated {
        let trimmed = js_trim(text);
        if trimmed.is_empty() {
            return Err("the FEEL script is empty".into());
        }
        if has_feel_parse_errors(trimmed) {
            Err("the FEEL script does not parse".into())
        } else {
            Ok(trimmed.to_string())
        }
    }

    fn convert_retry_cycle(&mut self, owner: &mut Owner) {
        for (key, cycle) in self.exts(owner, "failedJobRetryTimeCycle") {
            let text = js_trim(cycle.text.as_deref().unwrap_or("")).to_string();
            let Some(definition) = owner.find("zeebe:taskDefinition") else {
                self.keep_ext(key);
                self.add(
                    owner,
                    "camunda:failedJobRetryTimeCycle",
                    Unsupported,
                    format!("Retry cycle \"{text}\" retried an asynchronous continuation; in Camunda 8 only jobs have retries."),
                    "A failure on this element raises an incident; resolve it in Operate.",
                    false,
                );
                continue;
            };
            let repeat = parse_repeat(&text);
            let list: Vec<&str> = text.split(',').map(js_trim).collect();
            let retries = match repeat {
                Some((n, _)) => Some(n.to_string()),
                None if list.iter().all(|p| is_p_duration(p)) => Some(list.len().to_string()),
                None => None,
            };
            let Some(retries) = retries else {
                self.keep_ext(key);
                self.add(
                    owner,
                    "camunda:failedJobRetryTimeCycle",
                    Manual,
                    format!("Retry cycle \"{text}\" is not an R<n>/<duration> or a duration list."),
                    "Set zeebe:taskDefinition retries=\"<n>\" and the back-off in the worker.",
                    false,
                );
                continue;
            };
            owner
                .get_mut(definition)
                .attributes
                .entry("retries".into())
                .or_insert_with(|| retries.clone());
            self.drop_ext(owner, key);
            self.add(
                owner,
                "camunda:failedJobRetryTimeCycle",
                Convertible,
                format!("Retry count {retries} moved to zeebe:taskDefinition retries."),
                "zeebe:taskDefinition retries",
                true,
            );
            let intervals: Vec<&str> = match repeat {
                Some((_, d)) => vec![d],
                None => list.clone(),
            };
            // A zero interval retries at once, which is what Camunda 8 does without a back-off.
            if intervals.iter().all(|i| is_zero_interval(i)) {
                continue;
            }
            let shown = match repeat {
                Some((_, d)) => d.to_string(),
                None => list.join(", "),
            };
            self.add(
                owner,
                "camunda:failedJobRetryTimeCycle",
                Manual,
                format!("The retry interval ({shown}) is not part of the Camunda 8 model."),
                "Pass it as the retry back-off when the worker fails the job (fail-job retryBackOff).",
                false,
            );
        }
    }

    fn convert_standard_loop(&mut self, owner: &mut Owner) {
        let n = owner
            .children
            .iter()
            .filter(|c| local_name(&c.name) == "standardLoopCharacteristics")
            .count();
        for _ in 0..n {
            self.add(
                owner,
                "bpmn:standardLoopCharacteristics",
                Unsupported,
                "Camunda 8 does not support standard (while) loops.".into(),
                "Model the loop with a gateway and a sequence flow back, or as a multi-instance activity.",
                false,
            );
        }
    }

    // -----------------------------------------------------------------------
    // Implementations: service, send, business rule, message throw
    // -----------------------------------------------------------------------

    fn drop_in(&mut self, owner: &mut Owner, src: &mut Option<&mut Attrs>, local: &str) {
        match src {
            Some(a) => self.drop_attr(a, local),
            None => self.drop_attr(owner.attrs, local),
        }
    }

    /// `src` holds the implementation attributes: the element (`None`), or a message throw's
    /// event definition.
    fn convert_implementation(&mut self, owner: &mut Owner, mut src: Option<&mut Attrs>) {
        let read = |this: &Self, owner: &Owner, src: &Option<&mut Attrs>, local: &str| match src {
            Some(a) => this.attr(a, local),
            None => this.attr(owner.attrs, local),
        };
        let ty = read(self, owner, &src, "type");
        let topic = read(self, owner, &src, "topic");
        let class_name = read(self, owner, &src, "class");
        let delegate_expression = read(self, owner, &src, "delegateExpression");
        let expression = read(self, owner, &src, "expression");

        if let (Some("external"), Some(topic)) = (ty.as_deref(), topic.as_deref()) {
            let job_type = match self.static_or_expression(topic, false) {
                Ok(v) => v,
                Err(reason) => {
                    self.keep_attr("type");
                    self.keep_attr("topic");
                    self.add(
                        owner,
                        "camunda:topic",
                        Manual,
                        format!("Topic expression \"{topic}\" could not be translated: {reason}."),
                        "Set zeebe:taskDefinition type by hand.",
                        false,
                    );
                    return;
                }
            };
            let Some(definition) = self.zeebe(owner, "taskDefinition") else {
                return;
            };
            owner
                .get_mut(definition)
                .attributes
                .insert("type".into(), job_type.clone());
            self.drop_in(owner, &mut src, "type");
            self.drop_in(owner, &mut src, "topic");
            self.add(
                owner,
                "camunda:type=external",
                Convertible,
                format!("External task topic \"{topic}\" became job type \"{job_type}\"."),
                "zeebe:taskDefinition type — point the external task worker at the Camunda 8 job API with the same type.",
                true,
            );
            if let Some(priority) = read(self, owner, &src, "taskPriority") {
                self.keep_attr("taskPriority");
                self.add(
                    owner,
                    "camunda:taskPriority",
                    Manual,
                    format!("External task priority \"{priority}\" was not converted."),
                    "If priority matters, set zeebe:jobPriorityDefinition and check its range and semantics.",
                    false,
                );
            }
            for (key, _) in self.exts(owner, "errorEventDefinition") {
                self.keep_ext(key);
            }
            return;
        }

        // (attribute, value, job type)
        let delegate: Option<(&str, String, String)> = if let Some(c) = &class_name {
            Some(("class", c.clone(), bean_name(c)))
        } else if let Some(d) = &delegate_expression {
            let job_type = braced_body(d)
                .filter(|b| is_ident(b))
                .map_or_else(|| owner.id.clone(), str::to_string);
            Some(("delegateExpression", d.clone(), job_type))
        } else {
            expression
                .as_ref()
                .map(|e| ("expression", e.clone(), owner.id.clone()))
        };

        if let Some((attribute, value, job_type)) = delegate {
            let Some(definition) = self.zeebe(owner, "taskDefinition") else {
                return;
            };
            owner
                .get_mut(definition)
                .attributes
                .insert("type".into(), job_type.clone());
            let mut headers = vec![extension(
                "zeebe:header",
                &[("key", attribute), ("value", &value)],
            )];
            let result_variable = read(self, owner, &src, "resultVariable");
            if attribute == "expression" {
                if let Some(rv) = result_variable {
                    headers.push(extension(
                        "zeebe:header",
                        &[("key", "resultVariable"), ("value", &rv)],
                    ));
                    self.drop_in(owner, &mut src, "resultVariable");
                }
            }
            headers.extend(self.convert_fields(owner));
            if let Some(task_headers) = self.zeebe(owner, "taskHeaders") {
                owner.get_mut(task_headers).children.extend(headers);
            }
            self.drop_in(owner, &mut src, attribute);
            let label = match attribute {
                "class" => "Java delegate class",
                "delegateExpression" => "Delegate expression",
                _ => "Expression",
            };
            self.add(
                owner,
                &format!("camunda:{attribute}"),
                Manual,
                format!("{label} \"{value}\" runs inside the Camunda 7 engine; Camunda 8 runs no user code in the engine."),
                &format!("Implement a job worker for type \"{job_type}\" (written as zeebe:taskDefinition type; the original is kept as the \"{attribute}\" task header, which the Camunda 7 adapter pattern can dispatch on)."),
                true,
            );
            return;
        }

        for (key, connector) in self.exts(owner, "connector") {
            self.keep_ext(key);
            let id = connector
                .children
                .iter()
                .find(|c| local_name(&c.name) == "connectorId")
                .and_then(|c| c.text.as_deref())
                .unwrap_or("connector")
                .to_string();
            self.add(
                owner,
                "camunda:connector",
                Manual,
                format!("Camunda 7 connector \"{id}\" has no Camunda 8 equivalent with the same inputs."),
                if id.starts_with("http") {
                    "Use the Camunda 8 REST connector (io.camunda:http-json:1) and map its inputs."
                } else {
                    "Use a Camunda 8 connector or a job worker."
                },
                false,
            );
        }
    }

    /// Field injections with a static string become task headers; expression fields are left
    /// for a person.
    fn convert_fields(&mut self, owner: &mut Owner) -> Vec<XmlElement> {
        let mut headers = vec![];
        for (key, field) in self.exts(owner, "field") {
            let name = field.attr("name").unwrap_or("").to_string();
            let string_child = field
                .children
                .iter()
                .find(|c| local_name(&c.name) == "string");
            let value = field
                .attr("stringValue")
                .or_else(|| string_child.and_then(|c| c.text.as_deref()));
            if let (Some(value), None) = (value, field.attr("expression")) {
                headers.push(extension(
                    "zeebe:header",
                    &[("key", &name), ("value", value)],
                ));
                self.drop_ext(owner, key);
                self.add(
                    owner,
                    "camunda:field",
                    Convertible,
                    format!("Field injection \"{name}\" became a task header."),
                    "zeebe:taskHeaders — read it from the job's custom headers.",
                    true,
                );
                continue;
            }
            self.keep_ext(key);
            self.add(
                owner,
                "camunda:field",
                Manual,
                format!("Field injection \"{name}\" is an expression evaluated by the engine."),
                "Map the value with an input mapping and read it as a job variable.",
                false,
            );
        }
        headers
    }

    fn convert_message_throw(&mut self, owner: &mut Owner, defs: &mut [BpmnEventDefinition]) {
        // Camunda 7 puts the implementation on the message event definition; Modeler never
        // writes it on the event itself, but a hand-written file might.
        let implemented = |this: &Self, attrs: Option<&Attrs>| {
            attrs.is_some_and(|a| {
                ["class", "delegateExpression", "expression", "type"]
                    .iter()
                    .any(|l| this.attr(a, l).is_some())
            })
        };
        let from_def = defs.iter().position(|d| {
            matches!(d, BpmnEventDefinition::Message(_)) && implemented(self, definition_attrs(d))
        });
        if let Some(i) = from_def {
            if let BpmnEventDefinition::Message(m) = &mut defs[i] {
                self.convert_implementation(owner, m.unknown_attributes.as_mut());
            }
        } else if implemented(self, Some(&*owner.attrs)) {
            self.convert_implementation(owner, None);
        }
    }

    fn convert_decision(&mut self, owner: &mut Owner) {
        let decision_ref = self.attr(owner.attrs, "decisionRef").unwrap_or_default();
        let decision_id = match self.static_or_expression(&decision_ref, false) {
            Ok(v) => v,
            Err(reason) => {
                self.keep_attr("decisionRef");
                self.add(
                    owner,
                    "camunda:decisionRef",
                    Manual,
                    format!(
                        "Decision reference \"{decision_ref}\" could not be translated: {reason}."
                    ),
                    "Set zeebe:calledDecision decisionId by hand.",
                    false,
                );
                return;
            }
        };
        let Some(called) = self.zeebe(owner, "calledDecision") else {
            return;
        };
        owner
            .get_mut(called)
            .attributes
            .insert("decisionId".into(), decision_id);
        self.drop_attr(owner.attrs, "decisionRef");
        if let Some(result_variable) = self.attr(owner.attrs, "resultVariable") {
            owner
                .get_mut(called)
                .attributes
                .insert("resultVariable".into(), result_variable.clone());
            self.drop_attr(owner.attrs, "resultVariable");
            self.add(
                owner,
                "camunda:decisionRef",
                Convertible,
                format!("Decision \"{decision_ref}\" → zeebe:calledDecision, result in \"{result_variable}\"."),
                "zeebe:calledDecision",
                true,
            );
        } else {
            owner
                .get_mut(called)
                .attributes
                .insert("resultVariable".into(), "decisionResult".into());
            self.add(
                owner,
                "camunda:decisionRef",
                Manual,
                format!("Decision \"{decision_ref}\" → zeebe:calledDecision. Camunda 7 had no result variable; Camunda 8 requires one, so \"decisionResult\" was set."),
                "Rename resultVariable to what downstream elements expect.",
                true,
            );
        }
        self.convert_binding(owner, called, "decisionRef");
        let mapper = self.attr(owner.attrs, "mapDecisionResult");
        if mapper.as_deref() == Some("singleEntry") {
            self.drop_attr(owner.attrs, "mapDecisionResult");
            self.add(
                owner,
                "camunda:mapDecisionResult",
                Convertible,
                "Result mapper \"singleEntry\" matches Camunda 8, which stores a single output value as-is.".into(),
                "Nothing to model.",
                true,
            );
        } else {
            if mapper.is_some() {
                self.keep_attr("mapDecisionResult");
            }
            let shown = mapper.as_deref().unwrap_or("resultList");
            let default = if mapper.is_none() {
                " (the default)"
            } else {
                ""
            };
            self.add(
                owner,
                "camunda:mapDecisionResult",
                Manual,
                format!("Camunda 7 result mapper \"{shown}\"{default} shapes the result differently from Camunda 8, which stores the decision's own result: a value for one output, a context for several, a list for collect hit policies."),
                "Check what downstream elements read, and add an output mapping if they expect the Camunda 7 shape.",
                false,
            );
        }
        if self.attr(owner.attrs, "decisionRefTenantId").is_some() {
            self.keep_attr("decisionRefTenantId");
            self.add(
                owner,
                "camunda:decisionRefTenantId",
                Unsupported,
                "Camunda 8 resolves the decision in the process's own tenant.".into(),
                "Deploy the decision to the same tenant as the process.",
                false,
            );
        }
    }

    /// `camunda:<ref>Binding` / `<ref>Version` / `<ref>VersionTag` -> `bindingType` / `versionTag`.
    fn convert_binding(&mut self, owner: &mut Owner, target: u32, reference: &str) {
        let Some(binding) = self.attr(owner.attrs, &format!("{reference}Binding")) else {
            return;
        };
        if binding == "latest" || binding == "deployment" {
            owner
                .get_mut(target)
                .attributes
                .insert("bindingType".into(), binding);
            self.drop_attr(owner.attrs, &format!("{reference}Binding"));
            return;
        }
        if binding == "versionTag" {
            if let Some(tag) = self
                .attr(owner.attrs, &format!("{reference}VersionTag"))
                .filter(|t| !contains_juel(t))
            {
                let t = owner.get_mut(target);
                t.attributes
                    .insert("bindingType".into(), "versionTag".into());
                t.attributes.insert("versionTag".into(), tag);
                self.drop_attr(owner.attrs, &format!("{reference}Binding"));
                self.drop_attr(owner.attrs, &format!("{reference}VersionTag"));
                return;
            }
        }
        self.keep_attr(&format!("{reference}Binding"));
        self.keep_attr(&format!("{reference}Version"));
        self.keep_attr(&format!("{reference}VersionTag"));
        self.add(
            owner,
            &format!("camunda:{reference}Binding"),
            Manual,
            format!("Binding \"{binding}\" pins a version number; Camunda 8 binds by latest, deployment or version tag."),
            "Tag the target with a version tag and use bindingType=\"versionTag\", or use \"deployment\".",
            false,
        );
    }

    // -----------------------------------------------------------------------
    // User tasks and forms
    // -----------------------------------------------------------------------

    fn convert_user_task(&mut self, owner: &mut Owner) {
        if !Self::has_zeebe(owner, "userTask") {
            self.zeebe(owner, "userTask");
            self.add(
                owner,
                "bpmn:userTask",
                Convertible,
                "Implemented as a Camunda user task (zeebe:userTask).".into(),
                "zeebe:userTask",
                true,
            );
        }
        let mut assignment: Vec<(&str, String)> = vec![];
        for local in ["assignee", "candidateUsers", "candidateGroups"] {
            let Some(value) = self.attr(owner.attrs, local) else {
                continue;
            };
            let converted = match self.static_or_expression(&value, false) {
                Ok(c) => c,
                Err(reason) => {
                    self.keep_attr(local);
                    self.add(
                        owner,
                        &format!("camunda:{local}"),
                        Manual,
                        format!("{local} \"{value}\" could not be translated: {reason}."),
                        &format!("Set zeebe:assignmentDefinition {local} by hand."),
                        false,
                    );
                    continue;
                }
            };
            self.drop_attr(owner.attrs, local);
            let list_expression = local != "assignee" && converted.starts_with('=');
            let (severity, message, suggestion) = if list_expression {
                (
                    Manual,
                    format!("{local} expression became \"{converted}\". Camunda 7 accepted a comma-separated string or a collection here; Camunda 8 requires a list of strings."),
                    "Make sure the expression evaluates to a list of strings.",
                )
            } else {
                (
                    Convertible,
                    format!("{local} became zeebe:assignmentDefinition {local}=\"{converted}\"."),
                    "zeebe:assignmentDefinition",
                )
            };
            assignment.push((local, converted));
            self.add(
                owner,
                &format!("camunda:{local}"),
                severity,
                message,
                suggestion,
                true,
            );
        }
        if !assignment.is_empty() {
            if let Some(definition) = self.zeebe(owner, "assignmentDefinition") {
                for (k, v) in assignment {
                    owner.get_mut(definition).attributes.insert(k.into(), v);
                }
            }
        }

        let mut schedule: Vec<(&str, String)> = vec![];
        for local in ["dueDate", "followUpDate"] {
            let Some(value) = self.attr(owner.attrs, local) else {
                continue;
            };
            let converted = self.static_or_expression(&value, false);
            let valid = match &converted {
                Ok(c) => c.starts_with('=') || is_iso_date_time_with_zone(c),
                Err(_) => false,
            };
            let converted = match converted {
                Ok(c) if valid => c,
                other => {
                    self.keep_attr(local);
                    let what = match other {
                        Ok(_) => {
                            "not an ISO 8601 date-time with a zone offset, which Camunda 8 requires"
                                .to_string()
                        }
                        Err(reason) => format!("not translatable: {reason}"),
                    };
                    self.add(
                        owner,
                        &format!("camunda:{local}"),
                        Manual,
                        format!("{local} \"{value}\" is {what}."),
                        &format!("Set zeebe:taskSchedule {local} by hand."),
                        false,
                    );
                    continue;
                }
            };
            self.drop_attr(owner.attrs, local);
            self.add(
                owner,
                &format!("camunda:{local}"),
                Convertible,
                format!("{local} became zeebe:taskSchedule {local}=\"{converted}\"."),
                "zeebe:taskSchedule — the value must be an ISO 8601 date-time.",
                true,
            );
            schedule.push((local, converted));
        }
        if !schedule.is_empty() {
            if let Some(definition) = self.zeebe(owner, "taskSchedule") {
                for (k, v) in schedule {
                    owner.get_mut(definition).attributes.insert(k.into(), v);
                }
            }
        }

        if let Some(priority) = self.attr(owner.attrs, "priority") {
            let converted = self.static_or_expression(&priority, false);
            let in_range = !priority.is_empty()
                && priority.chars().all(|c| c.is_ascii_digit())
                && priority.parse::<f64>().is_ok_and(|n| n <= 100.0);
            match converted {
                Ok(value) if in_range || value.starts_with('=') => {
                    if let Some(definition) = self.zeebe(owner, "priorityDefinition") {
                        owner
                            .get_mut(definition)
                            .attributes
                            .insert("priority".into(), value.clone());
                    }
                    self.drop_attr(owner.attrs, "priority");
                    let (sev, msg, sug) = if in_range {
                        (
                            Convertible,
                            format!("Priority {priority} became zeebe:priorityDefinition."),
                            "zeebe:priorityDefinition",
                        )
                    } else {
                        (
                            Manual,
                            format!("Priority expression became \"{value}\"."),
                            "Camunda 8 priorities range from 0 to 100; make sure the expression stays in range.",
                        )
                    };
                    self.add(owner, "camunda:priority", sev, msg, sug, true);
                }
                _ => {
                    self.keep_attr("priority");
                    self.add(
                        owner,
                        "camunda:priority",
                        Manual,
                        format!("Priority \"{priority}\" is outside Camunda 8's 0–100 range or not translatable."),
                        "Rescale it to 0–100 and set zeebe:priorityDefinition.",
                        false,
                    );
                }
            }
        }

        self.convert_form(owner);

        for (key, listener) in self.exts(owner, "taskListener") {
            self.keep_ext(key);
            let event = listener.attr("event").unwrap_or("create");
            let c8_event = match event {
                "create" => Some("creating"),
                "assignment" => Some("assigning"),
                "update" => Some("updating"),
                "complete" => Some("completing"),
                "delete" => Some("canceling"),
                _ => None,
            };
            let Some(c8_event) = c8_event else {
                self.add(
                    owner,
                    "camunda:taskListener",
                    Unsupported,
                    format!("Camunda 8 has no task listener event like \"{event}\"."),
                    if event == "timeout" {
                        "Model the timeout with a timer boundary event."
                    } else {
                        "Move the logic elsewhere."
                    },
                    false,
                );
                continue;
            };
            let described = describe_implementation(&listener, self.prefix.as_deref());
            self.add(
                owner,
                "camunda:taskListener",
                Manual,
                format!("Task listener on \"{event}\" ({described}) runs code in the engine."),
                &format!("Implement it as a job worker and declare it with zeebe:taskListeners (eventType=\"{c8_event}\")."),
                false,
            );
        }
    }

    fn convert_start_event(&mut self, owner: &mut Owner) {
        if self.attr(owner.attrs, "initiator").is_some() {
            self.keep_attr("initiator");
            self.add(
                owner,
                "camunda:initiator",
                Unsupported,
                "Camunda 8 does not record the starting user in a variable.".into(),
                "Pass the user as a variable when creating the instance.",
                false,
            );
        }
        self.convert_form(owner);
    }

    fn convert_form(&mut self, owner: &mut Owner) {
        if let Some(form_ref) = self.attr(owner.attrs, "formRef") {
            let form_id = self.static_or_expression(&form_ref, false);
            let definition = match &form_id {
                Ok(v) if !v.starts_with('=') => self.zeebe(owner, "formDefinition"),
                _ => None,
            };
            if let Some(definition) = definition {
                owner
                    .get_mut(definition)
                    .attributes
                    .insert("formId".into(), form_ref.clone());
                self.drop_attr(owner.attrs, "formRef");
                self.convert_binding(owner, definition, "formRef");
                self.add(
                    owner,
                    "camunda:formRef",
                    Convertible,
                    format!("Camunda Form \"{form_ref}\" linked with zeebe:formDefinition formId."),
                    "Deploy the .form file with the process; Camunda 7 and 8 share the form-js schema.",
                    true,
                );
            } else {
                self.keep_attr("formRef");
                self.add(
                    owner,
                    "camunda:formRef",
                    Manual,
                    format!("Form reference \"{form_ref}\" is an expression; a Camunda 8 form id is static."),
                    "Set zeebe:formDefinition formId by hand.",
                    false,
                );
            }
        }
        let Some(form_key) = self.attr(owner.attrs, "formKey") else {
            return;
        };
        if form_key.starts_with("camunda-forms:") {
            self.keep_attr("formKey");
            self.add(
                owner,
                "camunda:formKey",
                Manual,
                format!("Form key \"{form_key}\" points at a .form file by path; Camunda 8 links forms by the id inside the file."),
                "Open the .form file, and set zeebe:formDefinition formId to its id.",
                false,
            );
            return;
        }
        let definition = if owner.ty == "userTask" {
            self.zeebe(owner, "formDefinition")
        } else {
            None
        };
        let Some(definition) = definition else {
            self.keep_attr("formKey");
            let message = format!(
                "Form key \"{form_key}\" on a {} has no Camunda 8 counterpart.",
                owner.ty
            );
            self.add(
                owner,
                "camunda:formKey",
                Manual,
                message,
                "Link a Camunda Form with zeebe:formDefinition formId.",
                false,
            );
            return;
        };
        owner
            .get_mut(definition)
            .attributes
            .insert("externalReference".into(), form_key.clone());
        self.drop_attr(owner.attrs, "formKey");
        let embedded = form_key.starts_with("embedded:");
        self.add(
            owner,
            "camunda:formKey",
            if embedded { Manual } else { Convertible },
            format!("Form key \"{form_key}\" became a custom form reference (zeebe:formDefinition externalReference)."),
            if embedded {
                "Tasklist does not render embedded HTML forms: rebuild it as a Camunda Form, or serve it from a custom task application that reads externalReference."
            } else {
                "Your task application resolves externalReference; Tasklist does not show custom forms."
            },
            true,
        );
    }

    // -----------------------------------------------------------------------
    // Call activities
    // -----------------------------------------------------------------------

    fn convert_call_activity(&mut self, owner: &mut Owner) {
        if let Some(called_element) = owner.attrs.get("calledElement").cloned() {
            let process_id = self.static_or_expression(&called_element, false);
            let target = match &process_id {
                Ok(_) => self.zeebe(owner, "calledElement"),
                Err(_) => None,
            };
            match (process_id, target) {
                (Ok(process_id), Some(target)) => {
                    owner
                        .get_mut(target)
                        .attributes
                        .insert("processId".into(), process_id.clone());
                    self.convert_binding(owner, target, "calledElement");
                    self.add(
                        owner,
                        "calledElement",
                        Convertible,
                        format!("Calls \"{process_id}\" through zeebe:calledElement."),
                        "zeebe:calledElement",
                        true,
                    );
                    self.convert_variable_passing(owner, target);
                }
                (process_id, _) => {
                    let why = match process_id {
                        Ok(_) => String::new(),
                        Err(reason) => format!(": {reason}"),
                    };
                    self.add(
                        owner,
                        "calledElement",
                        Manual,
                        format!(
                            "Called element \"{called_element}\" could not be translated{why}."
                        ),
                        "Set zeebe:calledElement processId by hand.",
                        false,
                    );
                }
            }
        }
        if self.attr(owner.attrs, "calledElementTenantId").is_some() {
            self.keep_attr("calledElementTenantId");
            self.add(
                owner,
                "camunda:calledElementTenantId",
                Unsupported,
                "Camunda 8 calls the process in the caller's tenant.".into(),
                "Deploy the called process to the same tenant.",
                false,
            );
        }
        for local in ["variableMappingClass", "variableMappingDelegateExpression"] {
            if self.attr(owner.attrs, local).is_none() {
                continue;
            }
            self.keep_attr(local);
            self.add(
                owner,
                &format!("camunda:{local}"),
                Manual,
                "Delegated variable mapping runs Java in the engine.".into(),
                "Express the mapping as zeebe:ioMapping inputs and outputs.",
                false,
            );
        }
        if owner.attrs.contains_key("caseRef") || self.attr(owner.attrs, "caseRef").is_some() {
            self.keep_attr("caseRef");
            self.add(
                owner,
                "caseRef",
                Unsupported,
                "Camunda 8 has no CMMN.".into(),
                "Model the case as a BPMN process (ad-hoc sub-process).",
                false,
            );
        }
    }

    /// Camunda 7 passes nothing across a call activity unless `camunda:in` / `camunda:out` say
    /// so; Camunda 8 passes everything by default. Both directions are pinned so the converted
    /// model keeps Camunda 7's scope.
    fn convert_variable_passing(&mut self, owner: &mut Owner, called_element: u32) {
        let ins = self.exts(owner, "in");
        let outs = self.exts(owner, "out");
        let all_in = ins.iter().any(|(_, e)| e.attr("variables") == Some("all"));
        let all_out = outs.iter().any(|(_, e)| e.attr("variables") == Some("all"));
        let mut mapped = 0;
        let mut mapping =
            |this: &mut Self, owner: &mut Owner, direction: &str, element: &XmlElement| -> bool {
                let target = element.attr("target");
                let source: Translated = match element.attr("sourceExpression") {
                    Some(s) => this.feel_value(Some(s)),
                    None => match element.attr("source") {
                        Some(s) if is_feel_name(s) => Ok(s.to_string()),
                        other => Err(format!(
                            "\"{}\" is not a valid FEEL name",
                            other.unwrap_or("")
                        )),
                    },
                };
                let (Some(target), Ok(source)) = (target, source) else {
                    return false;
                };
                if !is_feel_path(target) || element.attr("local") == Some("true") {
                    return false;
                }
                if let Some(io) = this.zeebe(owner, "ioMapping") {
                    owner.get_mut(io).children.push(extension(
                        &format!("zeebe:{direction}"),
                        &[("source", &format!("={source}")), ("target", target)],
                    ));
                }
                mapped += 1;
                true
            };
        for (key, element) in &ins {
            if element.attr("variables") == Some("all") && element.attr("local") != Some("true") {
                self.drop_ext(owner, *key);
                continue;
            }
            if let Some(business_key) = element.attr("businessKey") {
                if braced_body(business_key) == Some("execution.processBusinessKey") {
                    self.drop_ext(owner, *key);
                    self.add(
                        owner,
                        "camunda:in businessKey",
                        Convertible,
                        "Passing the parent's business key is Camunda 8's default: a child instance inherits the parent's business ID (Camunda 8.9+).".into(),
                        "Nothing to model on 8.9+. On earlier versions pass the key as a variable.",
                        true,
                    );
                } else {
                    self.keep_ext(*key);
                    self.add(
                        owner,
                        "camunda:in businessKey",
                        Manual,
                        format!("Business key expression \"{business_key}\" was not converted."),
                        "Set zeebe:calledElement businessId=\"=…\" (Camunda 8.10+).",
                        false,
                    );
                }
                continue;
            }
            if mapping(self, owner, "input", element) {
                self.drop_ext(owner, *key);
            } else {
                self.keep_ext(*key);
                self.add(
                    owner,
                    "camunda:in",
                    Manual,
                    format!(
                        "Input variable mapping to \"{}\" was not converted.",
                        element.attr("target").unwrap_or("")
                    ),
                    "Write it as a zeebe:input mapping by hand.",
                    false,
                );
            }
        }
        for (key, element) in &outs {
            if element.attr("variables") == Some("all") && element.attr("local") != Some("true") {
                self.drop_ext(owner, *key);
                continue;
            }
            if mapping(self, owner, "output", element) {
                self.drop_ext(owner, *key);
            } else {
                self.keep_ext(*key);
                self.add(
                    owner,
                    "camunda:out",
                    Manual,
                    format!(
                        "Output variable mapping to \"{}\" was not converted.",
                        element.attr("target").unwrap_or("")
                    ),
                    "Write it as a zeebe:output mapping by hand.",
                    false,
                );
            }
        }
        if !all_in {
            owner
                .get_mut(called_element)
                .attributes
                .insert("propagateAllParentVariables".into(), "false".into());
        }
        let has_outputs = owner.ext.iter().any(|e| {
            e.name == "zeebe:ioMapping" && e.children.iter().any(|c| c.name == "zeebe:output")
        });
        if !all_out && !has_outputs {
            owner
                .get_mut(called_element)
                .attributes
                .insert("propagateAllChildVariables".into(), "false".into());
        }
        if ins.len() + outs.len() > 0 || !all_in {
            let parents = if all_in {
                "all parent variables".to_string()
            } else {
                format!(
                    "{} parent variables",
                    if mapped > 0 { "only mapped" } else { "no" }
                )
            };
            let children = if all_out {
                "all child variables"
            } else if has_outputs {
                "only mapped child variables"
            } else {
                "no child variables"
            };
            self.add(
                owner,
                "camunda:in / camunda:out",
                Convertible,
                format!("Variable passing kept as in Camunda 7: {parents} in, {children} out."),
                "zeebe:calledElement propagateAllParentVariables / propagateAllChildVariables and zeebe:ioMapping",
                true,
            );
        }
    }

    // -----------------------------------------------------------------------
    // Scripts
    // -----------------------------------------------------------------------

    fn convert_script_task(&mut self, owner: &mut Owner) {
        let format = owner.attrs.get("scriptFormat").cloned().unwrap_or_default();
        let script_index = owner
            .children
            .iter()
            .position(|c| local_name(&c.name) == "script");
        if let Some(resource) = self.attr(owner.attrs, "resource") {
            self.keep_attr("resource");
            self.add(
                owner,
                "camunda:resource",
                Manual,
                format!("External script resource \"{resource}\" is not part of the model."),
                "Inline it as a FEEL zeebe:script, or implement it as a job worker.",
                false,
            );
            return;
        }
        let text = js_trim(
            script_index
                .and_then(|i| owner.children[i].text.as_deref())
                .unwrap_or(""),
        )
        .to_string();
        let converted: Translated = match format.to_lowercase().as_str() {
            "feel" => self.checked_feel(&text),
            "juel" => match translate_juel_to_feel(&text, JuelToFeelOptions::default()) {
                JuelToFeelResult::Ok { feel } => Ok(feel),
                JuelToFeelResult::Refused { reason } => Err(reason),
            },
            _ => Err(format!(
                "{} scripts do not run in Camunda 8",
                if format.is_empty() {
                    "untyped"
                } else {
                    &format
                }
            )),
        };
        let result_variable = self.attr(owner.attrs, "resultVariable");
        let (Ok(converted), Some(result_variable)) = (&converted, &result_variable) else {
            if result_variable.is_some() {
                self.keep_attr("resultVariable");
            }
            let message = match &converted {
                Ok(_) => "A FEEL script without camunda:resultVariable: Camunda 8 requires a result variable.".to_string(),
                Err(reason) => format!("Script was not converted: {reason}."),
            };
            self.add(
                owner,
                &format!("scriptFormat=\"{format}\""),
                Manual,
                message,
                "Rewrite it as a FEEL expression in zeebe:script (expression, resultVariable), or implement it as a job worker with zeebe:taskDefinition.",
                false,
            );
            return;
        };
        let Some(target) = self.zeebe(owner, "script") else {
            return;
        };
        let t = owner.get_mut(target);
        t.attributes
            .insert("expression".into(), format!("={converted}"));
        t.attributes
            .insert("resultVariable".into(), result_variable.clone());
        self.drop_attr(owner.attrs, "resultVariable");
        owner.attrs.shift_remove("scriptFormat");
        if let Some(i) = script_index {
            owner.children.remove(i);
        }
        self.add(
            owner,
            &format!("scriptFormat=\"{format}\""),
            Convertible,
            format!(
                "{} script became zeebe:script, result in \"{result_variable}\".",
                format.to_uppercase()
            ),
            "zeebe:script",
            true,
        );
    }

    // -----------------------------------------------------------------------
    // Events, conditions, loops
    // -----------------------------------------------------------------------

    fn check_correlation(&mut self, owner: &mut Owner, message_ref: Option<&str>) {
        let Some(message_ref) = message_ref else {
            return;
        };
        if Self::has_zeebe(owner, "subscription") {
            return;
        }
        let message = self.messages.iter().find(|m| m.0 == message_ref).cloned();
        if message.as_ref().is_some_and(|m| m.2) {
            return;
        }
        let shown = message
            .as_ref()
            .and_then(|m| m.1.as_deref())
            .unwrap_or(message_ref);
        self.add(
            owner,
            "message correlation",
            Manual,
            format!("Camunda 7 correlates message \"{shown}\" by API call (business key, process variables or instance id); the model names no key, and Camunda 8 requires one."),
            &format!("Add <zeebe:subscription correlationKey=\"=…\"/> to message \"{message_ref}\", naming the variable publishers correlate on."),
            false,
        );
    }

    fn convert_event_definitions(
        &mut self,
        owner: &mut Owner,
        definitions: &mut [BpmnEventDefinition],
    ) {
        for definition in definitions.iter_mut() {
            match definition {
                BpmnEventDefinition::Timer(t) => {
                    for (part, value) in [
                        ("timeDuration", &mut t.time_duration),
                        ("timeDate", &mut t.time_date),
                        ("timeCycle", &mut t.time_cycle),
                    ] {
                        let Some(v) = value.as_deref() else {
                            continue;
                        };
                        let trimmed = js_trim(v).to_string();
                        if contains_juel(&trimmed) {
                            match self.static_or_expression(&trimmed, false) {
                                Ok(converted) => {
                                    self.add(
                                        owner,
                                        &format!("timer {part}"),
                                        Convertible,
                                        format!("Timer expression \"{trimmed}\" became \"{converted}\"."),
                                        "FEEL timer expression",
                                        true,
                                    );
                                    *value = Some(converted);
                                }
                                Err(reason) => self.add(
                                    owner,
                                    &format!("timer {part}"),
                                    Manual,
                                    format!("Timer expression \"{trimmed}\" was not translated: {reason}."),
                                    "Rewrite it as a FEEL expression returning an ISO 8601 duration, date-time or cycle.",
                                    false,
                                ),
                            }
                        } else if part == "timeCycle"
                            && !trimmed.starts_with('R')
                            && trimmed.chars().any(is_js_space)
                        {
                            self.add(
                                owner,
                                "timer timeCycle",
                                Manual,
                                format!("Cron cycle \"{trimmed}\" uses Camunda 7's Quartz-style syntax."),
                                "Check it against Camunda 8's cron syntax, or use an ISO 8601 repeating interval.",
                                false,
                            );
                        }
                    }
                }
                BpmnEventDefinition::Conditional(c) => {
                    if let Some(condition) = c.condition.clone() {
                        let empty = Attrs::new();
                        let attributes = c.condition_attributes.as_ref().unwrap_or(&empty);
                        match self.condition(&condition, attributes) {
                            Ok(converted) => {
                                self.add(
                                    owner,
                                    "conditional event condition",
                                    Convertible,
                                    format!("Condition became \"{converted}\"."),
                                    "FEEL condition (conditional events need Camunda 8.9+)",
                                    true,
                                );
                                c.condition = Some(converted);
                            }
                            Err(reason) => self.add(
                                owner,
                                "conditional event condition",
                                Manual,
                                format!("Condition \"{condition}\" was not translated: {reason}."),
                                "Rewrite it as a FEEL expression.",
                                false,
                            ),
                        }
                    }
                }
                _ => {}
            }
        }
        for definition in definitions.iter() {
            let attrs = definition_attrs(definition);
            for local in ["variableName", "variableEvents"] {
                let Some(value) = attrs.and_then(|a| self.attr(a, local)) else {
                    continue;
                };
                self.keep_attr(local);
                self.add(
                    owner,
                    &format!("camunda:{local}"),
                    Manual,
                    format!("Conditional event filter {local}=\"{value}\" is not converted."),
                    "Use zeebe:conditionalFilter (variableNames, variableEvents).",
                    false,
                );
            }
            for local in [
                "errorCodeVariable",
                "errorMessageVariable",
                "escalationCodeVariable",
            ] {
                let Some(value) = attrs.and_then(|a| self.attr(a, local)) else {
                    continue;
                };
                self.keep_attr(local);
                self.add(
                    owner,
                    &format!("camunda:{local}"),
                    Manual,
                    format!("Camunda 8 does not write the caught code or message into \"{value}\"."),
                    "Have the thrower pass the values as variables and map them with an output mapping on the catch event.",
                    false,
                );
            }
        }
    }

    /// A condition text as `=feel`, when its JUEL is provable.
    fn condition(&self, text: &str, attributes: &Attrs) -> Translated {
        if let Some(language) = attributes.get("language") {
            if language.to_lowercase() != "juel" {
                return Err(format!("it is a {language} script condition"));
            }
        }
        let trimmed = js_trim(text);
        if trimmed.starts_with('=') {
            return Ok(trimmed.to_string());
        }
        if !contains_juel(trimmed) {
            return Err("it is not a JUEL expression".into());
        }
        match translate_juel_to_feel(trimmed, JuelToFeelOptions::default()) {
            JuelToFeelResult::Ok { feel } => Ok(format!("={feel}")),
            JuelToFeelResult::Refused { reason } => Err(reason),
        }
    }

    fn convert_flow_condition(&mut self, owner: &Owner, condition: &mut BpmnConditionExpression) {
        let converted = self.condition(&condition.text, &condition.attributes);
        let trimmed = js_trim(&condition.text).to_string();
        match converted {
            Ok(value) if value != trimmed => {
                self.add(
                    owner,
                    "conditionExpression",
                    Convertible,
                    format!("Condition \"{trimmed}\" became \"{value}\"."),
                    "FEEL condition",
                    true,
                );
                condition.text = value;
                condition.attributes.shift_remove("language");
            }
            Ok(_) => {}
            Err(reason) => self.add(
                owner,
                "conditionExpression",
                Manual,
                format!("Condition \"{trimmed}\" was not translated: {reason}."),
                "Rewrite it as a FEEL expression (=…).",
                false,
            ),
        }
    }

    fn convert_loop(&mut self, owner: &mut Owner, l: &mut BpmnMultiInstanceLoopCharacteristics) {
        if !l
            .extension_elements
            .iter()
            .any(|e| e.name == "zeebe:loopCharacteristics")
        {
            let empty = Attrs::new();
            let attrs = l.unknown_attributes.as_ref().unwrap_or(&empty);
            let collection = self.attr(attrs, "collection");
            let element_variable = self.attr(attrs, "elementVariable");
            if let Some(collection) = collection {
                let source: Translated = if contains_juel(&collection) {
                    self.static_or_expression(&collection, false)
                } else if is_feel_name(&collection) {
                    Ok(format!("={collection}"))
                } else {
                    Err(format!("\"{collection}\" is not a valid FEEL name"))
                };
                match source {
                    Ok(source) => {
                        let mut attributes = Attrs::new();
                        attributes.insert("inputCollection".into(), source.clone());
                        if let Some(ev) = &element_variable {
                            attributes.insert("inputElement".into(), ev.clone());
                        }
                        if let Some(a) = l.unknown_attributes.as_mut() {
                            self.drop_attr(a, "collection");
                            self.drop_attr(a, "elementVariable");
                        }
                        let input_element = element_variable
                            .as_ref()
                            .map(|ev| format!(" inputElement=\"{ev}\""))
                            .unwrap_or_default();
                        l.extension_elements.push(XmlElement {
                            name: "zeebe:loopCharacteristics".into(),
                            attributes,
                            children: vec![],
                            text: None,
                        });
                        self.add(
                            owner,
                            "camunda:collection",
                            Convertible,
                            format!("Multi-instance over \"{collection}\" became zeebe:loopCharacteristics inputCollection=\"{source}\"{input_element}."),
                            "zeebe:loopCharacteristics",
                            true,
                        );
                    }
                    Err(reason) => {
                        self.keep_attr("collection");
                        self.keep_attr("elementVariable");
                        self.add(
                            owner,
                            "camunda:collection",
                            Manual,
                            format!("Multi-instance collection \"{collection}\" was not translated: {reason}."),
                            "Set zeebe:loopCharacteristics inputCollection by hand.",
                            false,
                        );
                    }
                }
            } else if let Some(cardinality) = &l.loop_cardinality {
                self.add(
                    owner,
                    "loopCardinality",
                    Manual,
                    format!("Camunda 8 has no loop cardinality (\"{}\"); a multi-instance activity iterates over a collection.", js_trim(&cardinality.text)),
                    "Set zeebe:loopCharacteristics inputCollection, e.g. \"=for i in 1..n return i\" when n ≥ 1.",
                    false,
                );
            } else {
                self.add(
                    owner,
                    "multiInstanceLoopCharacteristics",
                    Manual,
                    "The multi-instance activity names no collection.".into(),
                    "Set zeebe:loopCharacteristics inputCollection (and inputElement).",
                    false,
                );
            }
        }
        if let Some(cc) = &mut l.completion_condition {
            let text = js_trim(&cc.text).to_string();
            if contains_juel(&text) {
                match self.static_or_expression(&text, true) {
                    Ok(converted) => {
                        self.add(
                            owner,
                            "completionCondition",
                            Convertible,
                            format!("Completion condition became \"{converted}\" (nrOf… variables renamed to numberOf…)."),
                            "FEEL completion condition",
                            true,
                        );
                        cc.text = converted;
                    }
                    Err(reason) => self.add(
                        owner,
                        "completionCondition",
                        Manual,
                        format!("Completion condition \"{text}\" was not translated: {reason}."),
                        "Rewrite it as a FEEL expression.",
                        false,
                    ),
                }
            }
        }
    }

    fn set_execution_platform(&mut self, d: &mut BpmnDefinitions) {
        let version = self
            .options
            .execution_platform_version
            .clone()
            .unwrap_or_else(|| DEFAULT_PLATFORM_VERSION.into());
        let before = d
            .unknown_attributes
            .get("modeler:executionPlatform")
            .cloned();
        d.namespaces
            .entry("zeebe".into())
            .or_insert_with(|| ZEEBE_NS.into());
        d.namespaces
            .entry("modeler".into())
            .or_insert_with(|| MODELER_NS.into());
        d.unknown_attributes
            .insert("modeler:executionPlatform".into(), "Camunda Cloud".into());
        d.unknown_attributes
            .insert("modeler:executionPlatformVersion".into(), version.clone());
        self.process_id = String::new();
        let was = before.map(|b| format!(" (was {b})")).unwrap_or_default();
        self.findings.push(Camunda7Finding {
            element_id: d.id.clone(),
            element_type: "definitions".into(),
            process_id: String::new(),
            construct: "modeler:executionPlatform".into(),
            severity: Convertible,
            message: format!("Execution platform set to Camunda Cloud {version}{was}."),
            suggestion: "Camunda Modeler opens the file as a Camunda 8 diagram.".into(),
            applied: true,
        });
    }
}

fn nested_contents(element: &mut BpmnFlowElement) -> Option<&mut BpmnProcessContents> {
    use BpmnFlowElement::*;
    match element {
        SubProcess(s) => Some(&mut s.contents),
        AdHocSubProcess(s) => Some(&mut s.contents),
        EventSubProcess(s) => Some(&mut s.contents),
        Transaction(s) => Some(&mut s.contents),
        _ => None,
    }
}

/// The foreign attributes an event definition carries.
pub(crate) fn definition_attrs(d: &BpmnEventDefinition) -> Option<&Attrs> {
    use BpmnEventDefinition::*;
    match d {
        Timer(x) => x.unknown_attributes.as_ref(),
        Error(x) => x.unknown_attributes.as_ref(),
        Escalation(x) => x.unknown_attributes.as_ref(),
        Message(x) => x.unknown_attributes.as_ref(),
        Signal(x) => x.unknown_attributes.as_ref(),
        Conditional(x) => x.unknown_attributes.as_ref(),
        Link(x) => x.unknown_attributes.as_ref(),
        Cancel(x) | Terminate(x) => x.unknown_attributes.as_ref(),
        Compensate(x) => x.unknown_attributes.as_ref(),
    }
}

fn describe_implementation(listener: &XmlElement, prefix: Option<&str>) -> String {
    for key in ["class", "delegateExpression", "expression"] {
        if let Some(v) = listener.attr(key) {
            return format!("{key} \"{v}\"");
        }
    }
    let script_name = format!("{}:script", prefix.unwrap_or("camunda"));
    match listener.children.iter().find(|c| c.name == script_name) {
        None => "no implementation".into(),
        Some(s) => format!("{} script", s.attr("scriptFormat").unwrap_or("script")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};

    /// A Camunda 7 document around `body`, as Camunda Modeler writes one.
    fn c7(body: &str, process_attributes: &str) -> String {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_test" targetNamespace="http://bpmn.io/schema/bpmn" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.22.0">
  <bpmn:process id="p" isExecutable="true" {process_attributes}>{body}</bpmn:process>
</bpmn:definitions>"#
        )
    }

    struct Converted {
        xml: String,
        findings: Vec<Camunda7Finding>,
    }

    impl Converted {
        fn of(&self, id: &str) -> Vec<String> {
            self.findings
                .iter()
                .filter(|f| f.element_id == id)
                .map(|f| format!("{}:{:?}", f.construct, f.severity))
                .collect()
        }
    }

    fn convert(body: &str) -> Converted {
        let defs = parse_bpmn(&c7(body, "")).expect("parses");
        // Each case is a fragment that pins one rule; the gate has its own tests.
        let r = convert_camunda7(&defs, &Camunda7ConvertOptions::ungated()).expect("converts");
        Converted {
            xml: serialize_bpmn(&r.definitions),
            findings: r.report.findings,
        }
    }

    #[test]
    fn external_task_topic_becomes_a_job_type() {
        let c = convert(
            r#"<bpmn:serviceTask id="t" camunda:type="external" camunda:topic="charge-card"/>"#,
        );
        assert!(
            c.xml
                .contains(r#"<zeebe:taskDefinition type="charge-card"/>"#),
            "{}",
            c.xml
        );
        assert!(!c.xml.contains("camunda:topic"));
        assert_eq!(c.of("t"), ["camunda:type=external:Convertible"]);
    }

    #[test]
    fn untranslatable_topic_is_kept_with_a_manual_finding() {
        let c = convert(
            r#"<bpmn:serviceTask id="t" camunda:type="external" camunda:topic="${topics.pick()}"/>"#,
        );
        assert!(!c.xml.contains("zeebe:taskDefinition"));
        assert!(c.xml.contains(r#"camunda:topic="${topics.pick()}""#));
        assert_eq!(c.of("t"), ["camunda:topic:Manual"]);
    }

    #[test]
    fn delegate_class_names_the_job_type_after_its_bean() {
        let c = convert(r#"<bpmn:serviceTask id="t" camunda:class="com.acme.ShipOrderDelegate"/>"#);
        assert!(c.xml.contains(r#"type="shipOrderDelegate""#));
        assert!(c
            .xml
            .contains(r#"<zeebe:header key="class" value="com.acme.ShipOrderDelegate"/>"#));
        let f = &c.findings[0];
        assert_eq!(
            (f.construct.as_str(), f.severity, f.applied),
            ("camunda:class", Manual, true)
        );
    }

    #[test]
    fn delegate_expression_uses_a_simple_bean_else_the_element_id() {
        let c = convert(
            r#"<bpmn:serviceTask id="simple" camunda:delegateExpression="${mailer}"/><bpmn:serviceTask id="complex" camunda:delegateExpression="${beans.mailer}"/>"#,
        );
        assert!(c.xml.contains(r#"type="mailer""#));
        assert!(c.xml.contains(r#"type="complex""#));
    }

    #[test]
    fn io_parameters_become_zeebe_mappings_and_untranslatable_ones_stay() {
        let c = convert(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><camunda:inputOutput>
              <camunda:inputParameter name="amount">${order.total}</camunda:inputParameter>
              <camunda:inputParameter name="bad">${order.items[0]}</camunda:inputParameter>
              <camunda:outputParameter name="label">fixed</camunda:outputParameter>
            </camunda:inputOutput></bpmn:extensionElements></bpmn:serviceTask>"#,
        );
        assert!(
            c.xml
                .contains(r#"<zeebe:input source="=order.total" target="amount"/>"#),
            "{}",
            c.xml
        );
        assert!(
            c.xml
                .contains(r#"<zeebe:output source="=&quot;fixed&quot;" target="label"/>"#),
            "{}",
            c.xml
        );
        assert!(c.xml.contains(r#"<camunda:inputParameter name="bad">"#));
        assert_eq!(
            c.of("t"),
            [
                "camunda:inputParameter:Manual",
                "camunda:inputOutput:Convertible"
            ]
        );
    }

    #[test]
    fn retry_cycle_moves_to_the_task_definition() {
        let c = convert(
            r#"<bpmn:serviceTask id="t" camunda:type="external" camunda:topic="x"><bpmn:extensionElements><camunda:failedJobRetryTimeCycle>R3/PT10M</camunda:failedJobRetryTimeCycle></bpmn:extensionElements></bpmn:serviceTask>"#,
        );
        assert!(c.xml.contains(r#"retries="3""#));
        assert_eq!(
            c.of("t"),
            [
                "camunda:type=external:Convertible",
                "camunda:failedJobRetryTimeCycle:Convertible",
                "camunda:failedJobRetryTimeCycle:Manual"
            ]
        );
        let zero = convert(
            r#"<bpmn:serviceTask id="t" camunda:type="external" camunda:topic="x"><bpmn:extensionElements><camunda:failedJobRetryTimeCycle>R3/PT0S</camunda:failedJobRetryTimeCycle></bpmn:extensionElements></bpmn:serviceTask>"#,
        );
        assert_eq!(
            zero.of("t").len(),
            2,
            "a zero interval needs no back-off finding"
        );
    }

    #[test]
    fn user_task_assignment_priority_and_schedule() {
        let c = convert(
            r#"<bpmn:userTask id="u" camunda:assignee="${starter}" camunda:candidateGroups="ops" camunda:priority="50" camunda:dueDate="2030-01-01T10:00:00Z" camunda:followUpDate="soon"/>"#,
        );
        assert!(c.xml.contains("<zeebe:userTask/>"));
        assert!(c.xml.contains(r#"assignee="=starter""#));
        assert!(c.xml.contains(r#"candidateGroups="ops""#));
        assert!(c
            .xml
            .contains(r#"<zeebe:priorityDefinition priority="50"/>"#));
        assert!(c.xml.contains(r#"dueDate="2030-01-01T10:00:00Z""#));
        assert!(c.xml.contains(r#"camunda:followUpDate="soon""#));
    }

    #[test]
    fn task_listener_events_are_matched_by_own_name_only() {
        // Regression: TS looked the event up on a plain object, so `constructor` was a listener event.
        let c = convert(
            r#"<bpmn:userTask id="u"><bpmn:extensionElements><camunda:taskListener class="com.acme.Notify" event="constructor"/></bpmn:extensionElements></bpmn:userTask>"#,
        );
        let f = c
            .findings
            .iter()
            .find(|f| f.construct == "camunda:taskListener")
            .expect("finding");
        assert_eq!(f.severity, Unsupported);
        assert!(f
            .message
            .contains(r#"no task listener event like "constructor""#));
    }

    #[test]
    fn sequence_flow_conditions_translate_provable_juel() {
        let c = convert(
            r#"<bpmn:startEvent id="s"/><bpmn:endEvent id="e"/><bpmn:sequenceFlow id="f" sourceRef="s" targetRef="e"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${order.total > 100}</bpmn:conditionExpression></bpmn:sequenceFlow>"#,
        );
        assert!(c.xml.contains(">=order.total &gt; 100<"), "{}", c.xml);
        assert_eq!(c.of("f"), ["conditionExpression:Convertible"]);
    }

    #[test]
    fn call_activity_pins_camunda_7_variable_scope() {
        let c = convert(
            r#"<bpmn:callActivity id="c" calledElement="child"><bpmn:extensionElements><camunda:in source="orderId" target="id"/><camunda:out variables="all"/></bpmn:extensionElements></bpmn:callActivity>"#,
        );
        assert!(c.xml.contains(r#"processId="child""#));
        assert!(c.xml.contains(r#"propagateAllParentVariables="false""#));
        assert!(!c.xml.contains("propagateAllChildVariables"));
        assert!(c
            .xml
            .contains(r#"<zeebe:input source="=orderId" target="id"/>"#));
    }

    #[test]
    fn script_tasks_need_a_result_variable() {
        let ok = convert(
            r#"<bpmn:scriptTask id="s" scriptFormat="feel" camunda:resultVariable="r"><bpmn:script>1 + 2</bpmn:script></bpmn:scriptTask>"#,
        );
        assert!(
            ok.xml
                .contains(r#"<zeebe:script expression="=1 + 2" resultVariable="r"/>"#),
            "{}",
            ok.xml
        );
        let groovy = convert(
            r#"<bpmn:scriptTask id="s" scriptFormat="groovy"><bpmn:script>x</bpmn:script></bpmn:scriptTask>"#,
        );
        assert_eq!(groovy.of("s"), [r#"scriptFormat="groovy":Manual"#]);
    }

    #[test]
    fn multi_instance_collection_and_completion_condition() {
        let c = convert(
            r#"<bpmn:userTask id="u"><bpmn:multiInstanceLoopCharacteristics camunda:collection="items" camunda:elementVariable="item"><bpmn:completionCondition>${nrOfCompletedInstances &gt;= 2}</bpmn:completionCondition></bpmn:multiInstanceLoopCharacteristics></bpmn:userTask>"#,
        );
        assert!(c.xml.contains(r#"inputCollection="=items""#), "{}", c.xml);
        assert!(c.xml.contains(r#"inputElement="item""#));
        assert!(
            c.xml.contains("=numberOfCompletedInstances &gt;= 2"),
            "{}",
            c.xml
        );
    }

    #[test]
    fn everything_unaccounted_for_is_reported() {
        let c = convert(r#"<bpmn:task id="t" camunda:unknownThing="x"/>"#);
        assert_eq!(c.of("t"), ["camunda:unknownThing:Manual"]);
        assert!(c.xml.contains(r#"camunda:unknownThing="x""#));
    }

    #[test]
    fn execution_platform_is_set_and_counted() {
        let defs = parse_bpmn(&c7("", "")).expect("parses");
        let r = convert_camunda7(
            &defs,
            &Camunda7ConvertOptions {
                execution_platform_version: Some("8.6.0".into()),
                ..Camunda7ConvertOptions::ungated()
            },
        )
        .expect("converts");
        let xml = serialize_bpmn(&r.definitions);
        assert!(xml.contains(r#"modeler:executionPlatform="Camunda Cloud""#));
        assert!(xml.contains(r#"modeler:executionPlatformVersion="8.6.0""#));
        let f = r.report.findings.last().expect("platform finding");
        assert_eq!(f.element_type, "definitions");
        assert!(
            f.message.ends_with("(was Camunda Platform)."),
            "{}",
            f.message
        );
        assert_eq!(r.report.total, r.report.findings.len());
        assert_eq!(r.report.counts.convertible, 1);
    }

    #[test]
    fn a_camunda_8_model_is_refused_and_the_input_is_not_modified() {
        let c8 = c7("", "").replace("Camunda Platform", "Camunda Cloud");
        let defs = parse_bpmn(&c8).expect("parses");
        let err = convert_camunda7(&defs, &Camunda7ConvertOptions::default()).expect_err("refused");
        assert!(err.to_string().contains("already targets Camunda 8"));

        let defs = parse_bpmn(&c7(r#"<bpmn:serviceTask id="t" camunda:class="a.B"/>"#, ""))
            .expect("parses");
        let before = defs.clone();
        let report = analyze_camunda7(&defs).expect("analyzes");
        assert_eq!(defs, before);
        assert!(report.total > 0);
    }

    #[test]
    fn report_serializes_with_the_ts_field_names() {
        let defs = parse_bpmn(&c7(r#"<bpmn:serviceTask id="t" camunda:class="a.B"/>"#, ""))
            .expect("parses");
        let report =
            serde_json::to_value(analyze_camunda7(&defs).expect("analyzes")).expect("json");
        assert_eq!(
            report["counts"],
            serde_json::json!({"convertible": 1, "manual": 1, "unsupported": 0})
        );
        assert_eq!(report["total"], 2);
        let f = &report["findings"][0];
        for key in [
            "elementId",
            "elementType",
            "processId",
            "construct",
            "severity",
            "message",
            "suggestion",
            "applied",
        ] {
            assert!(f.get(key).is_some(), "{key}");
        }
        assert_eq!(f["severity"], "manual");
    }
}
