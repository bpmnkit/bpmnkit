//! Writes a BPMN file as one self-contained HTML page:
//! `cargo run -p bpmnkit-viewer --example viewer_html -- order.bpmn out.html`.
//! Without arguments it writes an empty viewer (open or drop a file) to `out.html`.

use std::{env, fs};

use bpmnkit_viewer::{to_html, HtmlOptions};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().skip(1).collect();
    let xml = match args.first() {
        Some(path) => fs::read_to_string(path)?,
        None => String::new(),
    };
    let out = args.get(1).map_or("out.html", String::as_str);
    let title = args.first().map_or("BPMN diagram", String::as_str);
    fs::write(out, to_html(&xml, &HtmlOptions::default().title(title))?)?;
    println!("wrote {out}");
    Ok(())
}
