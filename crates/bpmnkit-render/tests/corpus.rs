//! Every BPMN input of the shared corpus renders to one well-formed `<svg>` document whose
//! drawn elements all lie inside the viewBox. Byte parity with TS is `bpmnkit-conformance`'s job.

use bpmnkit_render::{bpmn_to_svg, Geometry, RenderOptions, Theme};
use std::path::Path;

fn inputs() -> Vec<std::path::PathBuf> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance");
    let mut out = vec![];
    for kind in ["bpmn", "layout"] {
        for e in std::fs::read_dir(root.join(kind))
            .into_iter()
            .flatten()
            .flatten()
        {
            let f = e.path().join("input.bpmn");
            if f.exists() {
                out.push(f);
            }
        }
    }
    out.sort();
    out
}

#[test]
fn corpus_renders() {
    let files = inputs();
    assert!(files.len() > 20, "corpus not found");
    let mut drawn = 0;
    for f in files {
        let Ok(defs) = bpmnkit_bpmn::parse_bpmn(&std::fs::read_to_string(&f).unwrap()) else {
            continue;
        };
        for theme in [Theme::Light, Theme::Dark] {
            let opts = RenderOptions::default().theme(theme).auto_layout(true);
            let svg = match bpmn_to_svg(&defs, &opts) {
                Ok(svg) => svg,
                Err(bpmnkit_render::RenderError::NoDiagram) => continue,
                Err(e) => panic!("{}: {e}", f.display()),
            };
            assert!(svg.markup.starts_with("<svg xmlns="), "{}", f.display());
            assert!(svg.markup.ends_with("</svg>"), "{}", f.display());
            assert_eq!(svg.markup.matches("<svg").count(), 1);
            let vb = svg.view_box;
            for el in &svg.elements {
                if let Geometry::Shape(b) = &el.geometry {
                    assert!(
                        b.x >= vb.x
                            && b.y >= vb.y
                            && b.x + b.width <= vb.x + vb.w
                            && b.y + b.height <= vb.y + vb.h,
                        "{}: {} outside the viewBox",
                        f.display(),
                        el.id
                    );
                }
            }
            drawn += svg.elements.len();
        }
    }
    assert!(drawn > 500);
}

#[test]
#[cfg(feature = "auto-layout")]
fn options_change_only_what_they_name() {
    let xml = std::fs::read_to_string(
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../conformance/bpmn/collaboration/input.bpmn"),
    )
    .unwrap();
    let defs = bpmnkit_bpmn::parse_bpmn(&xml).unwrap();
    let base = bpmn_to_svg(&defs, &RenderOptions::default().auto_layout(true)).unwrap();
    let scaled = bpmn_to_svg(
        &defs,
        &RenderOptions::default().auto_layout(true).scale(2.0),
    )
    .unwrap();
    assert_eq!(scaled.view_box, base.view_box);
    assert_eq!(scaled.width, base.width * 2.0);

    let ids = bpmn_to_svg(
        &defs,
        &RenderOptions::default().auto_layout(true).element_ids(true),
    )
    .unwrap();
    assert!(ids.markup.contains(" data-element-id=\""));
    assert!(!base.markup.contains("data-element-id"));

    let clear = bpmn_to_svg(
        &defs,
        &RenderOptions::default().auto_layout(true).background(false),
    )
    .unwrap();
    assert_eq!(
        clear.markup.lines().count() + 1,
        base.markup.lines().count()
    );
}

#[test]
fn errors() {
    use bpmnkit_render::{bpmn_xml_to_svg, PlaneSelect, RenderError};
    assert!(matches!(
        bpmn_xml_to_svg("<nope", &RenderOptions::default()),
        Err(RenderError::Parse(_))
    ));
    let empty = r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="x"/>"#;
    assert_eq!(
        bpmn_xml_to_svg(empty, &RenderOptions::default()),
        Err(RenderError::NoDiagram)
    );
    assert_eq!(
        bpmn_xml_to_svg(
            empty,
            &RenderOptions::default().plane(PlaneSelect::ById("x".into()))
        ),
        Err(RenderError::PlaneNotFound("x".into()))
    );
}

#[test]
#[cfg(feature = "dmn")]
fn dmn_corpus_renders() {
    use bpmnkit_render::{decision_table_to_svg, drd_to_svg};
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance");
    let (mut drds, mut tables) = (0, 0);
    for kind in ["dmn", "layout"] {
        for e in std::fs::read_dir(root.join(kind))
            .into_iter()
            .flatten()
            .flatten()
        {
            let f = e.path().join("input.dmn");
            let Ok(xml) = std::fs::read_to_string(&f) else {
                continue;
            };
            let Ok(defs) = bpmnkit_dmn::parse_dmn(&xml) else {
                continue;
            };
            let svg = drd_to_svg(&defs, &RenderOptions::default());
            assert!(svg.markup.starts_with("<svg ") && svg.markup.ends_with("</svg>"));
            drds += 1;
            for d in &defs.decisions {
                if let Some(table) = &d.decision_table {
                    let svg =
                        decision_table_to_svg(table, d.name.as_deref(), &RenderOptions::default());
                    assert_eq!(
                        svg.elements.len(),
                        table.rules.len(),
                        "{}: one element per rule",
                        f.display()
                    );
                    tables += 1;
                }
            }
        }
    }
    assert!(drds > 5 && tables > 5, "{drds} DRDs, {tables} tables");
}
