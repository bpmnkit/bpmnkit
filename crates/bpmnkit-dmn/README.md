# bpmnkit-dmn

DMN 1.3 model, parser, lossless serializer and decision-table / decision-graph evaluator.

This is the Rust twin of `@bpmnkit/core` DMN I/O and `@bpmnkit/engine` DMN evaluation. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-dmn
```

## Example

```rust
use bpmnkit_dmn::{evaluate_decision_table, parse_dmn};
use bpmnkit_feel::{Context, Value};

let xml = r#"<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="D" namespace="urn:x">
  <decision id="grade" name="Grade">
    <decisionTable id="t" hitPolicy="FIRST">
      <input id="i"><inputExpression id="ie" typeRef="number"><text>score</text></inputExpression></input>
      <output id="o" name="grade" typeRef="string"/>
      <rule id="r1"><inputEntry id="e1"><text>&gt;= 50</text></inputEntry><outputEntry id="o1"><text>"pass"</text></outputEntry></rule>
      <rule id="r2"><inputEntry id="e2"><text>-</text></inputEntry><outputEntry id="o2"><text>"fail"</text></outputEntry></rule>
    </decisionTable>
  </decision>
</definitions>"#;
let definitions = parse_dmn(xml).unwrap();
let mut vars = Context::new();
vars.insert("score", Value::from(70));
let outcome = evaluate_decision_table(&definitions.decisions[0], &vars).unwrap();
assert_eq!(outcome.result, Value::from("pass"));
```

## Features

- `tz` (default): IANA zone names in temporal values.
- `full-regex` (default): the regex crate's speed-ups and every Unicode class for `matches()`.

Turn both off with `default-features = false` for a size-bound build (for example WebAssembly).

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-dmn>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
