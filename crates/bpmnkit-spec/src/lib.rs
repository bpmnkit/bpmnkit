//! BPMN Kit's single-source data. `spec/` at the repository root holds it as
//! JSON; `pnpm spec:gen` writes the `generated` modules here and the matching
//! TypeScript in the packages, so neither side copies a table by hand.

pub mod compat;
pub mod elements;
pub mod feel;
pub mod lint;
pub mod templates;

#[rustfmt::skip]
mod generated {
    pub mod bpmn_elements;
    pub mod compat_rules;
    pub mod dmn_elements;
    pub mod form_elements;
    pub mod feel_builtins;
    pub mod lint_rules;
    pub mod zeebe_elements;
}

#[cfg(test)]
pub(crate) mod test_support {
    use std::path::Path;

    /// A file under the repository's `spec/` folder, parsed.
    pub fn spec_json(name: &str) -> serde_json::Value {
        let path = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../spec")
            .join(name);
        let text = std::fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("read {}: {e}", path.display()));
        serde_json::from_str(&text).unwrap_or_else(|e| panic!("parse {}: {e}", path.display()))
    }
}
