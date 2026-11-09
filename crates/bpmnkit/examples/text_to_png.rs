//! Process text in, PNG out, for a chat message:
//! `cargo run -p bpmnkit --features render-png,text --example text_to_png > order.png`.

use bpmnkit::prelude::*;
use std::io::Write;

fn main() -> Result<(), Error> {
    let text = "# Expense approval\n\
        start[start Expense submitted] > check[xor Amount over 1000?]\n\
        check >(Yes: amount > 1000) review[user Review expense] > done[end Paid]\n\
        check >(No: default) auto[service Approve automatically] > done\n";
    let opts = RenderOptions::default().max_size(800.0, 600.0);
    let png = bpmnkit::quick::render_png(text, &opts, &PngOptions::default())?;
    eprintln!("{} bytes", png.len());
    std::io::stdout().write_all(&png).expect("stdout");
    Ok(())
}
