//! PNG smoke tests and one golden image (pixels are not a TS parity target, so the golden is
//! compared with a tolerance). `BLESS_PNG=1` rewrites the golden after a resvg or font change.
#![cfg(feature = "png")]

use bpmnkit_render::{
    bpmn_to_png, bpmn_to_svg, svg_to_png, PngOptions, RenderError, RenderOptions, Theme,
};
use resvg::tiny_skia::Pixmap;
use std::path::{Path, PathBuf};

fn root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).to_path_buf()
}

fn sample() -> bpmnkit_bpmn::BpmnDefinitions {
    let xml = std::fs::read_to_string(
        root().join("../../conformance/render/bpmn-sample-order-process/input.bpmn"),
    )
    .unwrap();
    bpmnkit_bpmn::parse_bpmn(&xml).unwrap()
}

/// Dark pixels: strokes, markers and (light theme) glyphs.
fn dark(p: &Pixmap) -> usize {
    p.pixels()
        .iter()
        .filter(|px| {
            px.alpha() > 0
                && u32::from(px.red()) + u32::from(px.green()) + u32::from(px.blue()) < 3 * 128
        })
        .count()
}

/// Pixels that differ from the top-left (background) pixel.
fn ink(p: &Pixmap) -> usize {
    let bg = p.pixels()[0];
    p.pixels().iter().filter(|&&px| px != bg).count()
}

#[test]
fn png_has_the_svg_size_times_dpi_and_draws_something() {
    let defs = sample();
    let svg = bpmn_to_svg(&defs, &RenderOptions::default()).unwrap();
    let bytes = svg_to_png(&svg, &PngOptions::default()).unwrap();
    let p = Pixmap::decode_png(&bytes).unwrap();
    assert_eq!(p.width(), (svg.width * 2.0).ceil() as u32);
    assert_eq!(p.height(), (svg.height * 2.0).ceil() as u32);
    let share = ink(&p) as f64 / (p.width() * p.height()) as f64;
    assert!(share > 0.02, "only {share} of the pixels are drawn");
}

#[test]
fn labels_draw_glyphs_with_the_embedded_font() {
    let mut defs = sample();
    let png = PngOptions::default().dpi_scale(1.0);
    let with =
        Pixmap::decode_png(&bpmn_to_png(&defs, &RenderOptions::default(), &png).unwrap()).unwrap();
    for p in &mut defs.processes {
        for el in &mut p.contents.flow_elements {
            el.base_mut().name = None;
        }
        for f in &mut p.contents.sequence_flows {
            f.name = None;
        }
    }
    let without =
        Pixmap::decode_png(&bpmn_to_png(&defs, &RenderOptions::default(), &png).unwrap()).unwrap();
    assert!(
        dark(&with) > dark(&without) + 500,
        "labels added {} dark pixels",
        dark(&with) as i64 - dark(&without) as i64
    );
}

#[test]
fn transparent_background_stays_transparent() {
    let opts = RenderOptions::default()
        .background(false)
        .theme(Theme::Dark);
    let bytes = bpmn_to_png(&sample(), &opts, &PngOptions::default()).unwrap();
    let p = Pixmap::decode_png(&bytes).unwrap();
    assert_eq!(p.pixels()[0].alpha(), 0);
}

#[test]
fn too_large_is_an_error_not_an_allocation() {
    let svg = bpmn_to_svg(&sample(), &RenderOptions::default().scale(100.0)).unwrap();
    assert!(matches!(
        svg_to_png(&svg, &PngOptions::default()),
        Err(RenderError::TooLarge { .. })
    ));
}

#[test]
fn golden_png_within_half_a_percent() {
    let bytes = bpmn_to_png(
        &sample(),
        &RenderOptions::default(),
        &PngOptions::default().dpi_scale(1.0),
    )
    .unwrap();
    let golden = root().join("tests/golden/sample-order-process.png");
    if std::env::var("BLESS_PNG").is_ok_and(|v| v == "1") {
        std::fs::write(&golden, &bytes).unwrap();
    }
    let want = Pixmap::decode_png(&std::fs::read(&golden).unwrap()).unwrap();
    let got = Pixmap::decode_png(&bytes).unwrap();
    assert_eq!((got.width(), got.height()), (want.width(), want.height()));
    let differ = got
        .pixels()
        .iter()
        .zip(want.pixels())
        .filter(|(a, b)| a != b)
        .count();
    let share = differ as f64 / (want.width() * want.height()) as f64;
    assert!(
        share <= 0.005,
        "{:.2} % of the pixels differ from the golden",
        share * 100.0
    );
}
