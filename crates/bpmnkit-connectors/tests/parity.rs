//! Parity with the TypeScript implementation. Everything under `tests/fixtures/` is recorded by
//! `scripts/record-connector-fixtures.mjs` from `@bpmnkit/connector-gen` and `@bpmnkit/core`;
//! these tests compare byte for byte. No normalization is applied, except:
//! - generate errors from the JSON/YAML parsers (`Failed to parse ...`) are only required to be
//!   errors with that prefix: the underlying parser wording differs;
//! - bind results for catalog templates without a stored XML are compared by SHA-256 and byte
//!   length (the XML is stored only for a representative subset to keep the repository small);
//! - problems are compared as JSON values (key order is irrelevant).

use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
use bpmnkit_connectors::{
    apply_template_to_element, generate, get_template, to_json_string, write_templates,
    ApplyToModelOptions, AuthHint, ElementTemplate, Format, GeneratorOptions,
};
use indexmap::IndexMap;
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

fn fixtures() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures")
}

fn read(path: impl AsRef<Path>) -> String {
    let path = path.as_ref();
    fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}

fn json(path: impl AsRef<Path>) -> Value {
    serde_json::from_str(&read(path)).expect("fixture is JSON")
}

fn options_of(v: &Value) -> GeneratorOptions {
    GeneratorOptions {
        id_prefix: v["idPrefix"].as_str().unwrap_or_default().to_owned(),
        base_url: v["baseUrl"].as_str().map(str::to_owned),
        expand_body: v["expandBody"].as_bool().unwrap_or(false),
        filter: v["filter"].as_str().map(str::to_owned),
        default_auth_type: v["defaultAuthType"].as_str().and_then(AuthHint::parse),
        icon: v["icon"].as_str().map(str::to_owned),
    }
}

fn files_in(dir: &Path) -> Vec<String> {
    let mut names: Vec<String> = fs::read_dir(dir)
        .unwrap_or_else(|e| panic!("{}: {e}", dir.display()))
        .map(|e| e.unwrap().file_name().to_string_lossy().into_owned())
        .collect();
    names.sort();
    names
}

fn scratch(name: &str) -> PathBuf {
    let dir =
        std::env::temp_dir().join(format!("bpmnkit-connectors-{}-{name}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    dir
}

#[test]
fn generate_matches_the_recorded_ts_output() {
    let root = fixtures();
    let cases = json(root.join("generate/cases.json"));
    let cases = cases.as_array().unwrap();
    assert!(cases.len() >= 30, "fixtures went missing");
    for case in cases {
        let name = case["name"].as_str().unwrap();
        let dir = root.join("generate").join(name);
        let spec = read(root.join(case["spec"].as_str().unwrap()));
        let result = generate(&spec, &options_of(&case["options"]));

        if let Some(error) = case.get("error") {
            let expected = read(dir.join("error.txt"));
            let got = result.expect_err(name).to_string();
            if error["exact"] == true {
                assert_eq!(got, expected, "{name}");
            } else {
                assert!(got.starts_with("Failed to parse"), "{name}: {got}");
            }
            continue;
        }

        let templates = result.unwrap_or_else(|e| panic!("{name}: {e}"));
        assert_eq!(
            templates.len() as u64,
            case["count"].as_u64().unwrap(),
            "{name}"
        );
        assert_eq!(
            to_json_string(&templates),
            read(dir.join("array/connector-templates.json")),
            "{name}: array format"
        );

        let out = scratch(name);
        let written = write_templates(&templates, &out, Format::Array).unwrap();
        assert_eq!(written, vec![out.join("connector-templates.json")]);
        assert_eq!(
            read(&written[0]),
            read(dir.join("array/connector-templates.json"))
        );

        let one_dir = dir.join("one-per-op");
        if one_dir.exists() {
            let written = write_templates(&templates, &out, Format::OnePerOp).unwrap();
            let expected = files_in(&one_dir);
            let mut got: Vec<String> = written
                .iter()
                .map(|p| p.file_name().unwrap().to_string_lossy().into_owned())
                .collect();
            got.sort();
            got.dedup();
            assert_eq!(got, expected, "{name}: file names");
            for file in &expected {
                assert_eq!(
                    read(out.join(file)),
                    read(one_dir.join(file)),
                    "{name}: {file}"
                );
            }
        }
        let _ = fs::remove_dir_all(&out);
    }
}

fn values_of(v: Option<&Value>) -> IndexMap<String, String> {
    v.and_then(Value::as_object)
        .map(|m| {
            m.iter()
                .map(|(k, v)| (k.clone(), v.as_str().unwrap().to_owned()))
                .collect()
        })
        .unwrap_or_default()
}

fn model_options(v: Option<&Value>) -> ApplyToModelOptions {
    let mut o = ApplyToModelOptions::default();
    if let Some(v) = v {
        o.omit_defaults = v["omitDefaults"].as_bool().unwrap_or(false);
        o.validate = v["validate"].as_bool().unwrap_or(true);
        o.camunda_version = v["camundaVersion"].as_str().map(str::to_owned);
    }
    o
}

#[test]
fn every_catalog_template_binds_like_ts() {
    let root = fixtures().join("bind");
    let base = parse_bpmn(&read(root.join("base.bpmn"))).unwrap();
    let records = json(root.join("catalog.json"));
    let records = records.as_array().unwrap();
    let bundled = bpmnkit_connectors::catalog_templates();
    assert_eq!(
        records.len(),
        bundled.len(),
        "catalog size drifted: re-record the fixtures"
    );

    let mut by_sha = 0;
    let mut by_xml = 0;
    for rec in records {
        let id = rec["id"].as_str().unwrap();
        let template = get_template(id).unwrap_or_else(|| panic!("{id} not bundled"));
        let result = apply_template_to_element(
            &base,
            rec["element"].as_str().unwrap(),
            template,
            &IndexMap::new(),
            &ApplyToModelOptions::default(),
        );
        let xml = serialize_bpmn(&result.definitions);
        let stored = root.join("xml").join(format!(
            "{}.xml",
            id.chars()
                .map(|c| if c.is_ascii_alphanumeric() {
                    c.to_ascii_lowercase()
                } else {
                    '-'
                })
                .collect::<String>()
        ));
        if stored.exists() {
            assert_eq!(xml, read(&stored), "{id}: xml");
            by_xml += 1;
        }
        assert_eq!(
            bpmnkit_diff::sha256::sha256_hex(xml.as_bytes()),
            rec["sha256"].as_str().unwrap(),
            "{id}: sha256 of the applied xml"
        );
        assert_eq!(
            xml.chars().count() as u64,
            rec["bytes"].as_u64().unwrap(),
            "{id}: length"
        );
        by_sha += 1;
        assert_eq!(
            serde_json::to_value(&result.problems).unwrap(),
            rec["problems"],
            "{id}: problems"
        );
    }
    assert_eq!(by_sha, 134);
    assert!(by_xml >= 15, "{by_xml} stored xml files");
}

fn template_of(root: &Path, r: &Value) -> ElementTemplate {
    match r["catalog"].as_str() {
        Some(id) => get_template(id).expect("bundled").clone(),
        None => ElementTemplate::from_json(&read(root.join(r["file"].as_str().unwrap()))).unwrap(),
    }
}

#[test]
fn hand_picked_cases_match_ts() {
    let root = fixtures().join("bind");
    let cases = json(root.join("cases.json"));
    let cases = cases.as_array().unwrap();
    assert!(cases.len() >= 35);
    for case in cases {
        let name = case["name"].as_str().unwrap();
        let mut defs = parse_bpmn(&read(root.join("base.bpmn"))).unwrap();
        let problems = json(root.join(format!("expected/{name}.json")));
        for (i, step) in case["steps"].as_array().unwrap().iter().enumerate() {
            let result = apply_template_to_element(
                &defs,
                step["element"].as_str().unwrap(),
                &template_of(&root, &step["template"]),
                &values_of(step.get("values")),
                &model_options(step.get("options")),
            );
            defs = result.definitions;
            assert_eq!(
                serialize_bpmn(&defs),
                read(root.join(format!("expected/{name}.{}.xml", i + 1))),
                "{name} step {}: xml",
                i + 1
            );
            assert_eq!(
                serde_json::to_value(&result.problems).unwrap(),
                problems[i],
                "{name} step {}: problems",
                i + 1
            );
        }
    }
}
