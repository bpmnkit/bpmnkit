//! The Camunda connector templates (`spec/templates/connectors.json`), embedded as JSON text.
//! Too large to turn into Rust literals; callers parse it on demand.

/// A JSON array of element templates, each with at least `id`, `name` and `properties`.
pub const CONNECTOR_TEMPLATES_JSON: &str = include_str!("../../../spec/templates/connectors.json");

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    fn templates() -> Vec<serde_json::Value> {
        serde_json::from_str(CONNECTOR_TEMPLATES_JSON).expect("connectors.json is a JSON array")
    }

    #[test]
    fn has_templates_with_unique_ids() {
        let all = templates();
        assert!(!all.is_empty());
        let ids: HashSet<&str> = all.iter().map(|t| t["id"].as_str().unwrap()).collect();
        assert_eq!(ids.len(), all.len());
    }

    #[test]
    fn contains_http_json() {
        assert!(templates()
            .iter()
            .any(|t| t["id"] == "io.camunda.connectors.HttpJson.v2"));
    }
}
