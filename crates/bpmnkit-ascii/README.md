# bpmnkit-ascii

BPMN processes, DMN decision tables and Camunda forms as Unicode box-drawing text, for terminals and chat code blocks (Slack, GitHub, Discord).

This is the Rust twin of `@bpmnkit/ascii` (`renderBpmnAscii`, `renderDmnAscii`, `renderFormAscii`). The TypeScript implementation is the oracle: both are held to the same conformance cases (`conformance/ascii/`), so the text is byte-identical. Processes are laid out with the grid engine of `bpmnkit-layout`; diagram interchange in the input is not needed.

## Install

```sh
cargo add bpmnkit-ascii
```

## Example

```rust
use bpmnkit_ascii::{bpmn_xml_to_ascii, dmn_xml_to_ascii, form_json_to_ascii, AsciiOptions};

let text = bpmn_xml_to_ascii(&bpmn_xml, &AsciiOptions::default())?;      // header = process name
let table = dmn_xml_to_ascii(&dmn_xml, &AsciiOptions::default().no_title())?;
let form = form_json_to_ascii(&form_json, &AsciiOptions::default().title("Signup"))?;
println!("```\n{text}\n```");
```

```
Orders
──────

╭─────────╮           ┌──────────────────────┐          ╭─────────╮
│ ○ Start │──────────►│ [svc] Ship           │─────────►│ ●       │
╰─────────╯           └──────────────────────┘          ╰─────────╯
```

(Leading indentation and blank rows trimmed.) `bpmn_to_ascii`, `dmn_to_ascii` and `form_to_ascii` take already parsed models.

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-ascii>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
