//! The pages are byte-identical to the JS `toHtml` of `@bpmnkit/viewer-lite`. The golden
//! files are written by `node scripts/viewer-assets.mjs` (`--check` in CI keeps them and
//! the vendored assets in step with the JS build).

use std::fs;
use std::path::Path;

use bpmnkit_viewer::{to_html, Colors, HtmlOptions, Theme};

#[test]
fn pages_match_js_to_html() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/golden");
    let cases: Vec<serde_json::Value> =
        serde_json::from_str(&fs::read_to_string(dir.join("cases.json")).unwrap()).unwrap();
    assert!(cases.len() >= 10);
    for case in cases {
        let name = case["name"].as_str().unwrap();
        let xml = fs::read_to_string(dir.join(format!("{name}.bpmn"))).unwrap();
        let expected = fs::read_to_string(dir.join(format!("{name}.html"))).unwrap();
        let mut options = HtmlOptions::default();
        if let Some(title) = case["title"].as_str() {
            options = options.title(title);
        }
        match case["theme"].as_str() {
            Some("light") => options = options.theme(Theme::Light),
            Some("dark") => options = options.theme(Theme::Dark),
            Some("auto") => options = options.theme(Theme::Auto),
            _ => {}
        }
        if let Some(c) = case["colors"].as_object() {
            let get = |k: &str| c.get(k).and_then(|v| v.as_str()).map(str::to_owned);
            options = options.colors(Colors {
                bg: get("bg"),
                fill: get("fill"),
                stroke: get("stroke"),
                flow: get("flow"),
                text: get("text"),
                pool_header: get("pool-header"),
                halo: get("halo"),
            });
        }
        let actual = to_html(&xml, &options).unwrap();
        assert!(
            actual == expected,
            "{name}: Rust page differs from JS toHtml"
        );
    }
}
