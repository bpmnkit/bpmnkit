//! [`JsRecord`]: a TS `Record<string, string>` that keeps JS's key order.

use bpmnkit_bpmn::js::object_entries;
use indexmap::IndexMap;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// A `Record<string, string>`. JS lists integer-like keys first (ascending), then the rest
/// in insertion order; [`JsRecord::entries`] and serialization follow that order, so code
/// that iterates it the way TS does (`Object.entries`, `for…in`, `JSON.stringify`) matches.
/// There is deliberately no insertion-order iterator.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct JsRecord(IndexMap<String, String>);

impl JsRecord {
    pub fn new() -> Self {
        Self::default()
    }

    /// `Object.entries(record)`.
    pub fn entries(&self) -> Vec<(&String, &String)> {
        object_entries(&self.0)
    }

    /// `Object.keys(record)`.
    pub fn keys(&self) -> Vec<&String> {
        self.entries().into_iter().map(|(k, _)| k).collect()
    }

    pub fn get(&self, key: &str) -> Option<&String> {
        self.0.get(key)
    }

    pub fn contains_key(&self, key: &str) -> bool {
        self.0.contains_key(key)
    }

    /// `record[key] = value`: a new key goes last, an existing one keeps its place.
    pub fn insert(&mut self, key: impl Into<String>, value: impl Into<String>) {
        self.0.insert(key.into(), value.into());
    }

    /// `record[key] ??= value`.
    pub fn insert_if_absent(&mut self, key: &str, value: impl Into<String>) {
        if !self.0.contains_key(key) {
            self.0.insert(key.to_owned(), value.into());
        }
    }

    /// `delete record[key]`.
    pub fn remove(&mut self, key: &str) -> Option<String> {
        self.0.shift_remove(key)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl FromIterator<(String, String)> for JsRecord {
    fn from_iter<I: IntoIterator<Item = (String, String)>>(iter: I) -> Self {
        Self(iter.into_iter().collect())
    }
}

impl Serialize for JsRecord {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.collect_map(self.entries())
    }
}

impl<'de> Deserialize<'de> for JsRecord {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        IndexMap::deserialize(deserializer).map(Self)
    }
}
