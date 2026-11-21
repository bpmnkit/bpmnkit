//! Writing generated templates to disk: port of `write-templates.ts`.

use crate::error::Error;
use bpmnkit_bpmn::js::utf16_len;
use serde_json::Value;
use std::path::{Path, PathBuf};

/// How [`write_templates`] lays the files out.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum Format {
    /// One `<name>.json` file per template.
    #[default]
    OnePerOp,
    /// All templates in `connector-templates.json`.
    Array,
}

/// The file stem for a template id: the id past its first dot, every character outside
/// `[a-zA-Z0-9-_]` (per UTF-16 code unit, as in JS) replaced by `-`, lowercased.
pub fn safe_name(id: &str) -> String {
    let base = id.split_once('.').map_or(id, |(_, rest)| rest);
    base.chars()
        .flat_map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                vec![c.to_ascii_lowercase()]
            } else {
                vec!['-'; utf16_len(c.encode_utf8(&mut [0; 4]))]
            }
        })
        .collect()
}

/// `JSON.stringify(value, null, 2)`: two-space indent, no trailing newline.
pub fn to_json_string(value: &impl serde::Serialize) -> String {
    serde_json::to_string_pretty(value).unwrap_or_default()
}

/// Writes the templates and returns the paths written, in order (a repeated file name appears
/// once per write, the last write winning, as in TS).
pub fn write_templates(
    templates: &[Value],
    output_dir: impl AsRef<Path>,
    format: Format,
) -> Result<Vec<PathBuf>, Error> {
    let dir = output_dir.as_ref();
    std::fs::create_dir_all(dir)?;
    let mut written = vec![];
    match format {
        Format::Array => {
            let path = dir.join("connector-templates.json");
            std::fs::write(&path, to_json_string(&templates))?;
            written.push(path);
        }
        Format::OnePerOp => {
            for tpl in templates {
                let id = tpl
                    .get("id")
                    .map(|v| crate::jsval::js_string(Some(v)))
                    .unwrap_or_default();
                let path = dir.join(format!("{}.json", safe_name(&id)));
                std::fs::write(&path, to_json_string(tpl))?;
                written.push(path);
            }
        }
    }
    Ok(written)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_name_strips_the_prefix_and_sanitises() {
        assert_eq!(safe_name("io.acme.List-Pets_v2"), "acme-list-pets_v2");
        assert_eq!(safe_name("NoDots Here"), "nodots-here");
        assert_eq!(safe_name("a.b\u{1F600}c"), "b--c");
    }
}
