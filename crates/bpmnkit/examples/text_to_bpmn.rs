//! Process text in, BPMN XML out: `cargo run -p bpmnkit --example text_to_bpmn`.

use bpmnkit::prelude::*;

fn main() -> Result<(), Error> {
    let text = "# Expense approval\n\
        start[start Expense submitted] > check[xor Amount over 1000?]\n\
        check >(Yes: amount > 1000) review[user Review expense] > done[end Paid]\n\
        check >(No: default) auto[service Approve automatically] > done\n";
    let Document::Bpmn(definitions) = load(text)? else {
        unreachable!("process text always expands to BPMN");
    };
    println!("{}", serialize_bpmn(&definitions));
    Ok(())
}
