//! Reads a component's top-level imports and exports and checks them against the manifest.
//! Builder and host both call this; the host does not trust the builder's verdict.

use std::fmt;

use wasmparser::{Parser, Payload};

use crate::manifest::{world_for, ValidManifest, World};

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ComponentInfo {
    pub imports: Vec<String>,
    pub exports: Vec<String>,
}

#[derive(Debug)]
pub struct InspectError(String);
impl fmt::Display for InspectError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "cannot read component: {}", self.0)
    }
}
impl std::error::Error for InspectError {}

pub fn inspect(component: &[u8]) -> Result<ComponentInfo, InspectError> {
    let mut info = ComponentInfo::default();
    let mut depth = 0usize;
    let mut saw_component = false;
    for p in Parser::new(0).parse_all(component) {
        match p.map_err(|e| InspectError(e.to_string()))? {
            Payload::Version { encoding, .. } => {
                if depth == 0 {
                    saw_component = encoding == wasmparser::Encoding::Component;
                    if !saw_component {
                        return Err(InspectError("not a component (core module)".into()));
                    }
                }
            }
            // Only the outermost component's own imports/exports matter; nested ones are internals.
            Payload::ComponentSection { .. } | Payload::ModuleSection { .. } => depth += 1,
            Payload::End(_) if depth > 0 => depth -= 1,
            Payload::ComponentImportSection(s) if depth == 0 => {
                for i in s {
                    info.imports.push(
                        i.map_err(|e| InspectError(e.to_string()))?
                            .name
                            .name
                            .to_owned(),
                    );
                }
            }
            Payload::ComponentExportSection(s) if depth == 0 => {
                for e in s {
                    info.exports.push(
                        e.map_err(|e| InspectError(e.to_string()))?
                            .name
                            .name
                            .to_owned(),
                    );
                }
            }
            _ => {}
        }
    }
    if !saw_component {
        return Err(InspectError("empty input".into()));
    }
    Ok(info)
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Violation {
    MissingExport(&'static str),
    /// `wasi:http` imported but the manifest has no network allow-list.
    HttpWithoutAllowList(String),
    UnknownImport(String),
}
impl fmt::Display for Violation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingExport(n) => write!(f, "component does not export `{n}`"),
            Self::HttpWithoutAllowList(i) => {
                write!(
                    f,
                    "imports `{i}` but the manifest has no [network] allow-list"
                )
            }
            Self::UnknownImport(i) => {
                write!(f, "imports `{i}`, which the platform does not provide")
            }
        }
    }
}

/// Imports a plain worker may use besides its own interfaces: what Rust's `std` on wasip2 pulls in.
/// The host links stubs (no files, no env, no sockets) for them.
const WASI_BASE: [&str; 5] = [
    "wasi:io/",
    "wasi:clocks/",
    "wasi:random/",
    "wasi:cli/",
    "wasi:filesystem/",
];

pub fn verify(info: &ComponentInfo, m: &ValidManifest) -> Result<(), Vec<Violation>> {
    let http_ok = world_for(m) == World::WorkerHttp;
    let mut v = Vec::new();
    if !info.exports.iter().any(|e| e == "handle") {
        v.push(Violation::MissingExport("handle"));
    }
    for i in &info.imports {
        let own = [
            "bpmnkit:worker/secrets@",
            "bpmnkit:worker/log@",
            "bpmnkit:worker/types@",
        ]
        .iter()
        .any(|p| i.strip_prefix(p).is_some_and(|v| v.starts_with("0.1.")));
        if own || WASI_BASE.iter().any(|p| i.starts_with(p)) {
            continue;
        }
        if i.starts_with("wasi:http/") {
            // types, outgoing-handler: both only with an allow-list.
            if !http_ok {
                v.push(Violation::HttpWithoutAllowList(i.clone()));
            }
            continue;
        }
        v.push(Violation::UnknownImport(i.clone()));
    }
    if v.is_empty() {
        Ok(())
    } else {
        Err(v)
    }
}
