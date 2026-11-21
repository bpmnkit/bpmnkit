//! Connector element templates for BPMN Kit, in Rust: the twin of `@bpmnkit/connector-gen`
//! (OpenAPI/Swagger to templates) and of `applyTemplateToElement` from `@bpmnkit/core` (templates
//! onto BPMN elements). TS is the oracle: `tests/fixtures/` holds outputs recorded from it by
//! `scripts/record-connector-fixtures.mjs`, and the tests compare byte for byte.
//!
//! ```
//! use bpmnkit_connectors::{generate, GeneratorOptions};
//!
//! let spec = r#"{"openapi":"3.0.0","info":{"title":"t","version":"1"},
//!   "servers":[{"url":"https://api.example.com/"}],
//!   "paths":{"/pets":{"get":{"operationId":"listPets"}}}}"#;
//! let templates = generate(spec, &GeneratorOptions::new("io.acme")).unwrap();
//! assert_eq!(templates[0]["id"], "io.acme.listpets");
//! ```
//!
//! # Generating
//! [`generate`] takes JSON or YAML text (Swagger 2.0 is upgraded first) and returns the
//! templates as `serde_json::Value`s in TS key order; [`write_templates`] writes them as
//! `JSON.stringify(x, null, 2)` would (no trailing newline).
//!
//! # Binding
//! [`apply_template_to_element`] writes a template onto one element of a parsed
//! `BpmnDefinitions`; [`bind_xml`] is the XML-in/XML-out convenience. [`catalog_templates`] /
//! [`get_template`] give the bundled Camunda templates
//! (`bpmnkit_spec::templates::CONNECTOR_TEMPLATES_JSON`).
//!
//! # Deviations from the TS twin
//! - **Catalog icons**: `getCatalogIconUri` (brand-coloured SVG data URIs) is not ported; pass
//!   `GeneratorOptions::icon` explicitly. `CATALOG` itself is complete.
//! - **YAML**: parsed by `yaml-rust2` (YAML 1.2-ish), TS uses `yaml` 2.x. They agree on ordinary
//!   specs; exotic scalars (merge keys, duplicate keys, timestamps) may differ. Integer-like keys
//!   (`200:`) become strings, and objects are re-ordered the way a JS engine lists keys.
//! - **Parse error text**: error messages carry the Rust parser's wording after the TS prefix.
//! - **`filter`** is a Rust `regex` (case-insensitive), not a JS `RegExp`: lookaround and
//!   backreferences are rejected, `\d`/`\w` are Unicode-aware.
//! - **Deployability** (`validate`) is checked with `bpmnkit_compat::zeebe`, the Rust twin of
//!   TS's `zeebe-validate`, so findings are the same set; `Problem::kind` is an enum.
//! - **Not ported** from `@bpmnkit/connectors`/core's connector module: `applyElementTemplate`
//!   (builder options), search/cards/lines, `validateElementTemplate`; only
//!   `applyTemplateToElement`, the bundled catalog and `getTemplate` are.

mod apply;
mod build;
mod catalog;
mod catalog_data;
mod element;
mod error;
mod jsval;
mod openapi;
mod swagger2;
mod template;
mod write;

pub use apply::{Problem, ProblemKind};
pub use build::{build_template, build_templates, CONNECTOR_SCHEMA};
pub use catalog::{get_catalog_entry, CatalogEntry, CATALOG};
pub use element::{
    apply_template_to_element, bind_xml, catalog_templates, get_template, ApplyToElementResult,
    ApplyToModelOptions, APPLIED_EVENT_DEFINITION,
};
pub use error::Error;
pub use openapi::{
    detect_default_auth, get_base_url, get_operations, get_servers, parse_openapi, resolve,
    resolve_ref, DetectedAuth, OperationWithMeta,
};
pub use swagger2::{is_swagger2, upgrade_swagger2};
pub use template::{
    property_key, Binding, Condition, ElementTemplate, ElementType, TemplateProperty,
};
pub use write::{safe_name, to_json_string, write_templates, Format};

/// A generated connector template: a JSON object in TS key order.
pub type ConnectorTemplate = serde_json::Value;

/// The `authentication.type` choices of generated templates (`AuthHint`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthHint {
    NoAuth,
    ApiKey,
    Basic,
    Bearer,
    OauthClientCredentials,
}

impl AuthHint {
    /// The value the template carries: `noAuth`, `apiKey`, `basic`, `bearer` or
    /// `oauth-client-credentials-flow`.
    pub fn as_str(self) -> &'static str {
        match self {
            AuthHint::NoAuth => "noAuth",
            AuthHint::ApiKey => "apiKey",
            AuthHint::Basic => "basic",
            AuthHint::Bearer => "bearer",
            AuthHint::OauthClientCredentials => "oauth-client-credentials-flow",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "noAuth" => AuthHint::NoAuth,
            "apiKey" => AuthHint::ApiKey,
            "basic" => AuthHint::Basic,
            "bearer" => AuthHint::Bearer,
            "oauth-client-credentials-flow" => AuthHint::OauthClientCredentials,
            _ => return None,
        })
    }
}

/// `GeneratorOptions`.
#[derive(Debug, Clone, Default)]
pub struct GeneratorOptions {
    /// Reverse-DNS prefix for template ids, e.g. `io.mycompany`.
    pub id_prefix: String,
    /// Overrides the spec's base URL (empty counts as unset, as in TS).
    pub base_url: Option<String>,
    /// Decompose top-level request body properties into individual fields.
    pub expand_body: bool,
    /// Keep operations whose `"<operationId> <summary> <path>"` matches this regex.
    pub filter: Option<String>,
    /// Pre-selects the auth type; detected from the spec's security schemes when `None`.
    pub default_auth_type: Option<AuthHint>,
    /// An icon data URI applied to every template.
    pub icon: Option<String>,
}

impl GeneratorOptions {
    pub fn new(id_prefix: impl Into<String>) -> Self {
        Self {
            id_prefix: id_prefix.into(),
            ..Self::default()
        }
    }
}

/// Parses an OpenAPI/Swagger spec (JSON or YAML text) and generates its connector templates.
pub fn generate(spec_text: &str, opts: &GeneratorOptions) -> Result<Vec<ConnectorTemplate>, Error> {
    let doc = parse_openapi(spec_text)?;
    let ops = get_operations(&doc, opts.filter.as_deref())?;
    let default_auth = opts
        .default_auth_type
        .unwrap_or_else(|| detect_default_auth(&doc));
    let opts = GeneratorOptions {
        default_auth_type: Some(default_auth),
        ..opts.clone()
    };
    Ok(build_templates(&ops, &opts))
}
