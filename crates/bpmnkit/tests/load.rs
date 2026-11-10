//! `detect` and `load` over the shared conformance corpus, plus `Error` conversions.
#![cfg(feature = "full")]

use bpmnkit::{detect, load, DocKind, Document, Error};
use std::path::Path;

fn case(kind: &str, name: &str, file: &str) -> String {
    let path = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../conformance")
        .join(kind)
        .join(name)
        .join(file);
    std::fs::read_to_string(path).unwrap()
}

fn corpus(kind: &str, file: &str) -> Vec<(String, String)> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../conformance")
        .join(kind);
    let mut out = Vec::new();
    for entry in std::fs::read_dir(root).unwrap() {
        let path = entry.unwrap().path().join(file);
        if let Ok(text) = std::fs::read_to_string(&path) {
            out.push((path.display().to_string(), text));
        }
    }
    assert!(!out.is_empty(), "no {kind} inputs");
    out
}

#[test]
fn detects_every_conformance_input() {
    for (kind, file, want) in [
        ("bpmn", "input.bpmn", DocKind::Bpmn),
        ("dmn", "input.dmn", DocKind::Dmn),
        ("form", "input.form", DocKind::Form),
        ("text", "input.txt", DocKind::ProcessText),
    ] {
        for (path, text) in corpus(kind, file) {
            // Comments-only text and `error-*` inputs (no root element) are not recognisable.
            if (kind == "text" && !text.contains('[')) || path.contains("/error-") {
                continue;
            }
            assert_eq!(detect(&text), want, "{path}");
        }
    }
}

#[test]
fn loads_a_representative_of_each_kind() {
    let bpmn = load(&case("bpmn", "artifacts", "input.bpmn")).unwrap();
    assert!(matches!(bpmn, Document::Bpmn(_)), "{bpmn:?}");
    let dmn = load(&case("dmn", "drd-full", "input.dmn")).unwrap();
    assert!(matches!(dmn, Document::Dmn(_)), "{dmn:?}");
    let form = load(&case("form", "all-components", "input.form")).unwrap();
    assert!(matches!(form, Document::Form(_)), "{form:?}");
}

#[test]
fn process_text_loads_as_bpmn() {
    let doc = load(&case("text", "parse-000-expense-approval", "input.txt")).unwrap();
    assert!(matches!(doc, Document::Bpmn(_)), "{doc:?}");
}

#[test]
fn compact_json_loads() {
    let json = r#"{"id":"c","processes":[{"id":"p","name":"P","elements":[]}]}"#;
    assert_eq!(detect(json), DocKind::CompactJson);
    let _ = load(json); // shape errors are fine here; detection and routing are the point
}

#[test]
fn detect_edge_cases() {
    assert_eq!(detect(""), DocKind::Unknown);
    assert_eq!(
        detect("\u{feff}  <?xml version=\"1.0\"?><!-- c --><foo/>"),
        DocKind::Unknown
    );
    assert_eq!(detect("{\"a\":1}"), DocKind::Unknown);
    assert_eq!(detect("just some prose."), DocKind::Unknown);
    assert_eq!(detect("# only a title"), DocKind::Unknown);
    assert!(matches!(load("nope"), Err(Error::Unrecognized)));
}

#[test]
fn error_conversion_and_display() {
    let e =
        load("<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"><oops")
            .unwrap_err();
    assert!(matches!(e, Error::Bpmn(_)), "{e:?}");
    assert!(e.to_string().starts_with("BPMN: "));
    assert!(std::error::Error::source(&e).is_some());

    let e: Error = bpmnkit::form::parse_form("{").unwrap_err().into();
    assert!(e.to_string().starts_with("form: "));
    let e: Error = bpmnkit::text::TextError::new("boom").into();
    assert_eq!(e.to_string(), "text: boom");
    assert!(Error::Unrecognized.to_string().contains("unrecognized"));
}

#[test]
fn ascii_error_converts_with_question_mark() {
    fn run() -> Result<String, Error> {
        Ok(bpmnkit::ascii::bpmn_xml_to_ascii(
            "not xml",
            &bpmnkit::ascii::AsciiOptions::default(),
        )?)
    }
    let err = run().unwrap_err();
    assert!(matches!(err, Error::Ascii(_)));
    assert!(err.to_string().starts_with("ascii: "));
    assert!(std::error::Error::source(&err).is_some());
}
