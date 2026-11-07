//! Port of `bpmn/process-text.ts` lines 115–457 and 890–997: the kind words, the line
//! patterns, and the helpers that read one path line. The constants and shared types are
//! complete; the functions are to port.
//!
//! Porter notes:
//! - Offsets here are byte offsets into `&str`. TS indexes UTF-16 units; that is only
//!   visible where TS cuts text for a message (`text.slice(i, i + 20)`: 20 UTF-16 units).
//! - JS regexes without the `u` flag: `\w`, `\d`, `\b` are ASCII; `\s` and `trim()` are the
//!   JS whitespace set (`bpmnkit_bpmn::js::is_js_space`), which is not Rust's; `.` stops
//!   at `\n`, `\r`, U+2028, U+2029; `/i` folds case. With the `regex` crate write
//!   `(?-u:\w)`, `(?-u:\b)`, an explicit JS-space class instead of `\s`, and keep patterns
//!   in `std::sync::LazyLock<Regex>`. Hand-written scanners are fine where clearer.
//! - JS object lookups go through the prototype: `KINDS["constructor"]` is a function,
//!   not `undefined`, so in TS a kind word or id `constructor` / `__proto__` (and in the
//!   case-sensitive `KINDS[id] !== undefined` of `tokenizePath`, also `toString`,
//!   `valueOf`, `hasOwnProperty`, …) reads as a kind. Port [`kind`]/[`alias`] as plain
//!   lookups, write an oracle case for `constructor[task X]`, and report what TS does as a
//!   suspected TS bug rather than imitating it.
//! - `typeFromId` and `nameFromId` are used by `assemble`; `nameFromId` lower-cases with
//!   JS `toLowerCase` (Unicode) and upper-cases the first UTF-16 unit with `toUpperCase`.

use bpmnkit_bpmn::BpmnElementType;
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

/// `NOTE_LINE` (`/^note\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i`): `(id, text)`.
pub fn match_note_line(text: &str) -> Option<(&str, &str)> {
    todo!()
}

/// `DOC_LINE` (`/^doc\s+([A-Za-z_][\w.-]*)\s*:\s*(.*)$/i`): `(id, text)`.
pub fn match_doc_line(text: &str) -> Option<(&str, &str)> {
    todo!()
}

/// `HEADER_SEGMENT.test(s)` (`/^[\s,]*(?:camunda=[^\s,|]*[\s,]*)+$/`).
pub(crate) fn is_header_segment(s: &str) -> bool {
    todo!()
}

/// `DANGLING.test(s)` (`/\s*-{0,2}>\s*(\([^()]*\))?\s*$/`): the line ends in an arrow.
pub(crate) fn dangles(s: &str) -> bool {
    todo!()
}

/// `s.replace(DANGLING, "")`.
pub(crate) fn strip_dangling(s: &str) -> String {
    todo!()
}

/// TS's `matching`: the byte index of the `close` matching the `open` at `start`, skipping
/// double-quoted text.
pub(crate) fn matching(text: &str, start: usize, open: char, close: char) -> Option<usize> {
    todo!()
}

/// What [`split_feel`] returns.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SplitFeel {
    pub plain: String,
    /// The expression with its leading `=` (`"= …"` added when written without).
    pub feel: Option<String>,
}

/// TS's `splitFeel`.
pub fn split_feel(attrs: &str) -> SplitFeel {
    todo!()
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

/// TS's `splitMappings`.
pub fn split_mappings(attrs: &str) -> SplitMappings {
    todo!()
}

/// TS's `handles`: whether the element reads as handling a failure (`HANDLING` on its
/// name, and on its id with `_ . -` runs as spaces).
pub(crate) fn handles(element: Option<&CompactElement>) -> bool {
    todo!()
}

/// TS's `typeFromId`.
pub(crate) fn type_from_id(id: &str) -> BpmnElementType {
    todo!()
}

/// TS's `nameFromId`: `send_email` / `sendEmail` → `Send email`.
pub(crate) fn name_from_id(id: &str) -> String {
    todo!()
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

/// TS's `tokenizePath`: `Err` is TS's `{ error }` message.
pub fn tokenize_path(text: &str) -> Result<PathTokens, String> {
    todo!()
}

/// TS's `conditionOrLabel`: keeps a condition only if it parses as FEEL
/// (`bpmnkit_feel::parse(.., &ParseOptions::default()).is_ok()` for TS's
/// `parseExpression(prose).errors.length === 0`; check the two agree on prose), else moves
/// it into the label and returns the problem message.
pub fn condition_or_label(edge: EdgeLabel) -> (EdgeLabel, Option<String>) {
    todo!()
}

/// TS's `itemOf`: `recipients` → `recipient`, else `item`.
pub(crate) fn item_of(collection: &str) -> String {
    todo!()
}

/// TS's `duration`: an ISO 8601 duration from `PT5M`, `5m`, `5 minutes`, …
pub fn duration(text: &str) -> Option<String> {
    todo!()
}

/// TS's `edgeLabel`: `Name: condition`, `default`, `Name: default`.
pub fn edge_label(label: Option<&str>) -> EdgeLabel {
    todo!()
}

/// `OTHERWISE.test(label)`: a branch label that reads as "otherwise".
pub(crate) fn is_otherwise(label: &str) -> bool {
    todo!()
}

/// TS's `listOf`: `"A", "B" and "C"`.
pub(crate) fn list_of(items: &[String]) -> String {
    todo!()
}

/// TS's `variableFrom`: `Status approved?` → `statusApproved`.
pub(crate) fn variable_from(text: &str) -> String {
    todo!()
}
