//! Text in, picture out: process text (or compact JSON) to SVG or PNG in one call.
//!
//! `load` expands the text (content-derived ids, so the same text always draws the same
//! picture), the renderer lays out whatever has no diagram interchange and draws it.
//! Pure and synchronous; in an async server call it from `spawn_blocking`.

use bpmnkit_render::RenderOptions;

use crate::{load, Document, Error};

fn bpmn_of(text: &str) -> Result<bpmnkit_bpmn::model::BpmnDefinitions, Error> {
    match load(text)? {
        Document::Bpmn(defs) => Ok(defs),
        // DMN and forms are not drawn by this helper.
        _ => Err(Error::Unrecognized),
    }
}

/// Process text or compact JSON to SVG. Auto-layout is always on, whatever `opts` says,
/// because expanded text carries no usable diagram of its own.
///
/// Anything that is not a BPMN process (DMN, forms) gives [`Error::Unrecognized`].
pub fn render_svg(text: &str, opts: &RenderOptions) -> Result<bpmnkit_render::Svg, Error> {
    let defs = bpmn_of(text)?;
    Ok(bpmnkit_render::bpmn_to_svg(
        &defs,
        &opts.clone().auto_layout(true),
    )?)
}

/// [`render_svg`] then rasterise (feature `render-png`).
#[cfg(feature = "render-png")]
pub fn render_png(
    text: &str,
    opts: &RenderOptions,
    png: &bpmnkit_render::PngOptions,
) -> Result<Vec<u8>, Error> {
    Ok(bpmnkit_render::svg_to_png(&render_svg(text, opts)?, png)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEXT: &str = "# Expense approval\n\
        start[start Expense submitted] > check[xor Amount over 1000?]\n\
        check >(Yes: amount > 1000) review[user Review expense] > done[end Paid]\n\
        check >(No: default) auto[service Approve automatically] > done\n";

    #[test]
    fn text_to_svg() {
        let svg = render_svg(TEXT, &RenderOptions::default()).unwrap();
        assert!(svg.markup.starts_with("<svg "));
        assert!(svg.markup.contains("Review"));
        assert!(svg.markup.contains("Expense submitted"));
    }

    #[test]
    fn same_text_same_svg() {
        let a = render_svg(TEXT, &RenderOptions::default()).unwrap();
        let b = render_svg(TEXT, &RenderOptions::default()).unwrap();
        assert_eq!(a.markup, b.markup);
    }

    #[test]
    fn conformance_text_inputs_render() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/text");
        let mut rendered = 0;
        for entry in std::fs::read_dir(root).unwrap() {
            let path = entry.unwrap().path();
            let name = path.file_name().unwrap().to_string_lossy().into_owned();
            let Ok(text) = std::fs::read_to_string(path.join("input.txt")) else {
                continue;
            };
            // `error-*` inputs are meant to fail; others may be rejected by `load` (leniently
            // parsed) but must never panic.
            if let Ok(svg) = render_svg(&text, &RenderOptions::default()) {
                assert!(svg.markup.starts_with("<svg "), "{name}");
                rendered += 1;
            }
        }
        assert!(rendered > 10, "only {rendered} fixtures rendered");
    }

    #[test]
    fn bad_input_is_an_error() {
        assert!(matches!(
            render_svg("not a model", &RenderOptions::default()),
            Err(Error::Unrecognized)
        ));
    }

    #[cfg(feature = "render-png")]
    #[test]
    fn text_to_png() {
        let png = render_png(
            TEXT,
            &RenderOptions::default(),
            &bpmnkit_render::PngOptions::default(),
        )
        .unwrap();
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
    }
}
