//! The Camunda connector catalog (`spec/templates/connectors.json`, the 134 OOTB templates that
//! `packages/connectors` ships), reduced to what the classifier reads. `catalog.json` is derived
//! by `tests/catalog_sync.rs` (`BPMNKIT_UPDATE=1` rewrites it) and embedded.

use std::collections::BTreeSet;

use serde::Deserialize;

/// The generic REST connector's job type. A task of this type is a REST call, not a catalog
/// connector, unless a template is applied.
pub const HTTP_JSON: &str = "io.camunda:http-json:1";

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogEntry {
    pub id: String,
    pub name: String,
    pub task_type: String,
    /// `bpmn:ServiceTask`, `bpmn:SendTask`, `bpmn:IntermediateThrowEvent`, …
    pub element_type: String,
}

impl CatalogEntry {
    fn deprecated(&self) -> bool {
        let n = self.name.to_lowercase();
        ["deprecated", "alpha", "early access"]
            .iter()
            .any(|w| n.contains(w))
    }

    fn outbound_task(&self) -> bool {
        matches!(
            self.element_type.as_str(),
            "bpmn:ServiceTask" | "bpmn:SendTask"
        )
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Catalog {
    entries: Vec<CatalogEntry>,
}

/// A catalog match by name, with the tokens that matched.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NameMatch<'a> {
    pub entry: &'a CatalogEntry,
    pub tokens: Vec<String>,
}

/// Words that say nothing about which connector is meant.
const GENERIC: &[&str] = &[
    "a",
    "an",
    "and",
    "by",
    "connector",
    "connectors",
    "content",
    "document",
    "documents",
    "event",
    "execute",
    "extract",
    "for",
    "from",
    "generate",
    "handler",
    "in",
    "inbound",
    "invoke",
    "message",
    "messages",
    "of",
    "on",
    "outbound",
    "publish",
    "request",
    "retrieve",
    "run",
    "send",
    "task",
    "text",
    "the",
    "to",
    "via",
    "with",
];

/// Vendor prefixes: they rank a match but are not required (`Ask OpenAI` is not Azure OpenAI).
const VENDOR: &[&str] = &["amazon", "aws", "azure", "google", "microsoft"];

/// Lower-case alphanumeric words.
pub fn tokens(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(str::to_lowercase)
        .collect()
}

fn strip_version(task_type: &str) -> &str {
    match task_type.rsplit_once(':') {
        Some((head, v)) if !v.is_empty() && v.bytes().all(|b| b.is_ascii_digit()) => head,
        _ => task_type,
    }
}

impl Catalog {
    pub fn new(mut entries: Vec<CatalogEntry>) -> Self {
        entries.sort_by(|a, b| a.id.cmp(&b.id));
        Self { entries }
    }

    /// The embedded OOTB catalog.
    pub fn builtin() -> Self {
        let entries: Vec<CatalogEntry> =
            serde_json::from_str(include_str!("catalog.json")).expect("catalog.json is valid");
        Self::new(entries)
    }

    pub fn entries(&self) -> &[CatalogEntry] {
        &self.entries
    }

    /// A catalog connector type that is not the generic REST connector (rule R2).
    pub fn connector_type(&self, task_type: &str) -> Option<&CatalogEntry> {
        if task_type == HTTP_JSON {
            return None;
        }
        self.ranked()
            .find(|e| e.task_type == task_type && e.outbound_task())
            .or_else(|| self.ranked().find(|e| e.task_type == task_type))
    }

    /// Exact identifier match (rule R3): the type names a template id, or a catalog connector
    /// type of another version (`io.camunda:slack:2`).
    pub fn exact(&self, task_type: &str) -> Option<&CatalogEntry> {
        if let Some(e) = self.entries.iter().find(|e| e.id == task_type) {
            return Some(e);
        }
        let wanted = strip_version(task_type);
        if wanted == strip_version(HTTP_JSON) {
            return None;
        }
        self.ranked()
            .filter(|e| e.outbound_task() && e.task_type != HTTP_JSON)
            .find(|e| strip_version(&e.task_type) == wanted)
    }

    /// Name heuristic (rule R13): every distinctive word of a connector's name occurs in
    /// `name`. Ranked by missing vendor words, then matched words (more first), then id.
    pub fn by_name(&self, name: &str) -> Option<NameMatch<'_>> {
        let words: BTreeSet<String> = tokens(name).into_iter().collect();
        let mut best: Option<((usize, std::cmp::Reverse<usize>), NameMatch<'_>)> = None;
        for entry in self
            .entries
            .iter()
            .filter(|e| e.outbound_task() && !e.deprecated())
        {
            let all = tokens(&entry.name);
            let required: Vec<&String> = all
                .iter()
                .filter(|w| !GENERIC.contains(&w.as_str()) && !VENDOR.contains(&w.as_str()))
                .collect();
            if required.is_empty() || !required.iter().all(|w| words.contains(*w)) {
                continue;
            }
            let vendors: Vec<&String> = all
                .iter()
                .filter(|w| VENDOR.contains(&w.as_str()))
                .collect();
            let missing = vendors.iter().filter(|w| !words.contains(**w)).count();
            let mut matched: Vec<String> = required
                .iter()
                .chain(vendors.iter().filter(|w| words.contains(**w)))
                .map(|w| (*w).clone())
                .collect();
            matched.sort();
            matched.dedup();
            let rank = (missing, std::cmp::Reverse(matched.len()));
            // Entries are sorted by id, so `<` keeps the smallest id on a tie.
            if best.as_ref().is_none_or(|(r, _)| rank < *r) {
                best = Some((
                    rank,
                    NameMatch {
                        entry,
                        tokens: matched,
                    },
                ));
            }
        }
        best.map(|(_, m)| m)
    }

    /// Non-deprecated outbound entries first, each group by id.
    fn ranked(&self) -> impl Iterator<Item = &CatalogEntry> {
        let fresh = self.entries.iter().filter(|e| !e.deprecated());
        fresh.chain(self.entries.iter().filter(|e| e.deprecated()))
    }
}
