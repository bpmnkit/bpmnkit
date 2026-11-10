//! Times `bpmn_to_svg` over the BPMN inputs of conformance/render/, and with feature `png`
//! (`cargo bench -p bpmnkit-render --features png`) `svg_to_png` of the largest one at
//! dpi 2. Plain loop, no harness.

use bpmnkit_render::{bpmn_to_svg, RenderOptions};
use std::hint::black_box;
use std::path::PathBuf;
use std::time::Instant;

fn time(label: &str, iterations: u32, mut run: impl FnMut()) {
    for _ in 0..iterations / 10 {
        run();
    }
    let start = Instant::now();
    for _ in 0..iterations {
        run();
    }
    let us = start.elapsed().as_secs_f64() * 1e6 / f64::from(iterations);
    println!("{label:<18} {us:>9.1} µs per pass");
}

fn main() {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance/render");
    let mut paths: Vec<PathBuf> = std::fs::read_dir(&dir)
        .into_iter()
        .flatten()
        .flatten()
        .map(|e| e.path().join("input.bpmn"))
        .filter(|p| p.exists())
        .collect();
    paths.sort();
    let models: Vec<_> = paths
        .iter()
        .filter_map(|p| bpmnkit_bpmn::parse_bpmn(&std::fs::read_to_string(p).ok()?).ok())
        .collect();
    let opts = RenderOptions::default();
    time("svg corpus", 50, || {
        for m in &models {
            black_box(bpmn_to_svg(black_box(m), &opts).ok());
        }
    });

    let largest = models
        .iter()
        .max_by_key(|m| m.diagrams.first().map_or(0, |d| d.plane.shapes.len()))
        .expect("render corpus");
    time("svg largest", 500, || {
        black_box(bpmn_to_svg(black_box(largest), &opts).ok());
    });

    #[cfg(feature = "png")]
    {
        use bpmnkit_render::{svg_to_png, PngOptions};
        let shapes = largest.diagrams[0].plane.shapes.len();
        let svg = bpmn_to_svg(largest, &opts).unwrap();
        let png = PngOptions::default();
        let start = Instant::now();
        black_box(svg_to_png(&svg, &png).unwrap());
        eprintln!(
            "png first call (font db) {:.1} ms",
            start.elapsed().as_secs_f64() * 1e3
        );
        eprintln!("largest: {shapes} shapes, {}x{} px", svg.width, svg.height);
        time("png largest dpi2", 10, || {
            black_box(svg_to_png(black_box(&svg), &png).unwrap());
        });
        // The plan's target: a ~50-node diagram at dpi 2 in under 50 ms.
        let mid = models
            .iter()
            .min_by_key(|m| {
                m.diagrams
                    .first()
                    .map_or(usize::MAX, |d| d.plane.shapes.len().abs_diff(50))
            })
            .expect("render corpus");
        let svg = bpmn_to_svg(mid, &opts).unwrap();
        eprintln!(
            "mid: {} shapes, {}x{} px",
            mid.diagrams[0].plane.shapes.len(),
            svg.width,
            svg.height
        );
        time("png ~50 dpi2", 20, || {
            black_box(svg_to_png(black_box(&svg), &png).unwrap());
        });
        let png1 = PngOptions::default().dpi_scale(1.0);
        time("png ~50 dpi1", 20, || {
            black_box(svg_to_png(black_box(&svg), &png1).unwrap());
        });
        let thumb = bpmn_to_svg(mid, &RenderOptions::default().max_size(800.0, 600.0)).unwrap();
        time("png ~50 thumb800", 20, || {
            black_box(svg_to_png(black_box(&thumb), &png1).unwrap());
        });
    }
}
