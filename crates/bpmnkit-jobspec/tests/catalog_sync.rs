//! `src/catalog.json` is derived from `spec/templates/connectors.json`; this fails on drift.
//! `BPMNKIT_UPDATE=1 cargo test -p bpmnkit-jobspec --test catalog_sync` rewrites it.

use std::path::Path;

use serde_json::{json, Value};

fn derive() -> String {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    let text = std::fs::read_to_string(root.join("spec/templates/connectors.json")).unwrap();
    let templates: Vec<Value> = serde_json::from_str(&text).unwrap();
    let mut entries: Vec<Value> = templates
        .iter()
        .filter_map(|t| {
            let task_type = t["properties"].as_array()?.iter().find_map(|p| {
                let b = &p["binding"];
                (b["type"] == "zeebe:taskDefinition"
                    && b.get("property").is_none_or(|v| v == "type"))
                .then(|| p["value"].as_str())
                .flatten()
            })?;
            // A FEEL job type is chosen at runtime; nothing to match against.
            (!task_type.trim_start().starts_with('=')).then(|| {
                json!({
                    "id": t["id"],
                    "name": t["name"],
                    "taskType": task_type,
                    "elementType": t["elementType"]["value"],
                })
            })
        })
        .collect();
    entries.sort_by(|a, b| a["id"].as_str().cmp(&b["id"].as_str()));
    entries.dedup_by(|a, b| a["id"] == b["id"]);
    // Biome's JSON layout (tabs, one key per line), so `biome check` leaves it alone.
    let mut out = String::from("[\n");
    for (i, e) in entries.iter().enumerate() {
        let sep = if i + 1 < entries.len() { "," } else { "" };
        out.push_str(&format!(
            "\t{{\n\t\t\"id\": {},\n\t\t\"name\": {},\n\t\t\"taskType\": {},\n\t\t\"elementType\": {}\n\t}}{sep}\n",
            e["id"], e["name"], e["taskType"], e["elementType"]
        ));
    }
    out.push_str("]\n");
    out
}

#[test]
fn catalog_json_matches_the_spec() {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/catalog.json");
    let want = derive();
    if std::env::var_os("BPMNKIT_UPDATE").is_some() {
        std::fs::write(&path, &want).unwrap();
    }
    let have = std::fs::read_to_string(&path).unwrap();
    assert!(
        have == want,
        "src/catalog.json is stale: rerun with BPMNKIT_UPDATE=1"
    );
    assert!(bpmnkit_jobspec::Catalog::builtin().entries().len() > 60);
}
