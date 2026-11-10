//! `cargo run -p bpmnkit-render --example render --features png -- in.bpmn out.png`
//! Renders a BPMN file to SVG, or to PNG when the output ends in `.png`; lays out models
//! without diagram interchange first.

use bpmnkit_render::{bpmn_xml_to_svg, RenderOptions};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);
    let (Some(input), Some(output)) = (args.next(), args.next()) else {
        eprintln!("usage: render <in.bpmn> <out.svg|out.png>");
        std::process::exit(2);
    };
    let svg = bpmn_xml_to_svg(
        &std::fs::read_to_string(input)?,
        &RenderOptions::default().auto_layout(true),
    )?;
    if output.ends_with(".png") {
        #[cfg(feature = "png")]
        {
            let png = bpmnkit_render::svg_to_png(&svg, &bpmnkit_render::PngOptions::default())?;
            std::fs::write(&output, png)?;
        }
        #[cfg(not(feature = "png"))]
        return Err("PNG output needs feature `png`".into());
    } else {
        std::fs::write(&output, svg.markup)?;
    }
    println!("{output}: {} x {} px", svg.width, svg.height);
    Ok(())
}
