//! The pages are byte-identical to the JS `toHtml` of `@bpmnkit/viewer-lite`. The golden
//! files are written by `node scripts/viewer-assets.mjs` (`--check` in CI keeps them and
//! the vendored assets in step with the JS build).

use std::fs;
use std::path::Path;

use bpmnkit_viewer::{to_html, HtmlOptions};

#[test]
fn pages_match_js_to_html() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/golden");
    let cases: Vec<serde_json::Value> =
        serde_json::from_str(&fs::read_to_string(dir.join("cases.json")).unwrap()).unwrap();
    assert!(cases.len() >= 6);
    for case in cases {
        let name = case["name"].as_str().unwrap();
        let xml = fs::read_to_string(dir.join(format!("{name}.bpmn"))).unwrap();
        let expected = fs::read_to_string(dir.join(format!("{name}.html"))).unwrap();
        let mut options = HtmlOptions::default();
        if let Some(title) = case["title"].as_str() {
            options = options.title(title);
        }
        let actual = to_html(&xml, &options).unwrap();
        assert!(
            actual == expected,
            "{name}: Rust page differs from JS toHtml"
        );
    }
}
