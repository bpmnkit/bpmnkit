# bpmnkit

BPMN Kit for Rust: one dependency for BPMN, DMN, FEEL and Camunda forms. Each `bpmnkit-*` crate is re-exported as a module behind a cargo feature of the same name.

The crates are the Rust twin of the `@bpmnkit/*` TypeScript packages. The TypeScript implementation is the oracle: both are held to the same conformance cases, so results match.

## Install

```sh
cargo add bpmnkit                      # feel, bpmn, dmn, form
cargo add bpmnkit --features full      # everything
cargo add bpmnkit --no-default-features --features feel
```

## Features

| Feature   | Module              | Crate             | Default | What it does |
|-----------|---------------------|-------------------|---------|--------------|
| `feel`    | `bpmnkit::feel`     | `bpmnkit-feel`    | yes     | FEEL lexer, parser and evaluator with exact decimals |
| `bpmn`    | `bpmnkit::bpmn`     | `bpmnkit-bpmn`    | yes     | BPMN 2.0 model, parser and lossless serializer (Zeebe extensions) |
| `dmn`     | `bpmnkit::dmn`      | `bpmnkit-dmn`     | yes     | DMN 1.3 model, parser, serializer and decision evaluation |
| `form`    | `bpmnkit::form`     | `bpmnkit-form`    | yes     | Camunda form JSON model, parser and serializer |
| `xml`     | `bpmnkit::xml`      | `bpmnkit-xml`     |         | Lossless XML reader and writer the BPMN and DMN parsers share |
| `spec`    | `bpmnkit::spec`     | `bpmnkit-spec`    |         | Shared data: element tables, FEEL built-ins, lint rules, connector templates |
| `compat`  | `bpmnkit::compat`   | `bpmnkit-compat`  |         | Camunda 8 version compatibility checks and Camunda 7 to 8 migration |
| `lint`    | `bpmnkit::lint`     | `bpmnkit-lint`    |         | BPMN lint and optimize passes, bpmnlint config, DMN and form lint |
| `layout`  | `bpmnkit::layout`   | `bpmnkit-layout`  |         | Auto layout of BPMN and DMN diagrams |
| `builder` | `bpmnkit::builder`  | `bpmnkit-builder` |         | Fluent BPMN process builders, DMN decision-table and DRD builders |
| `text`    | `bpmnkit::text`     | `bpmnkit-text`    |         | Compact JSON, the process line format and connector lines |
| `render`  | `bpmnkit::render`   | `bpmnkit-render`  |         | BPMN to SVG (same bytes as `exportSvg`), auto layout for models without DI |
| `render-png` | `bpmnkit::render` | `bpmnkit-render` |       | `svg_to_png` / `bpmn_to_png` with an embedded font (not in `full`) |
| `render-system-fonts` | `bpmnkit::render` | `bpmnkit-render` | | PNG text may also use the machine's fonts (not in `full`) |
| `diff`    | `bpmnkit::diff`     | `bpmnkit-diff`    |         | Semantic diff with field-level changes, layout-only moves and a semantic hash |
| `diff-html` | `bpmnkit::diff`   | `bpmnkit-diff`    |         | Self-contained HTML diff viewer and the diff-over-diagram SVG (implies `diff`, `render`) |
| `viewer`  | `bpmnkit::viewer`   | `bpmnkit-viewer`  |         | One self-contained HTML viewer page per diagram (same bytes as viewer-lite `toHtml`), or its head/body/scripts parts |
| `full`    |                     |                   |         | All of the above except the PNG features |

A feature turns on the crates it needs; for example `text` also builds `bpmn`, `dmn` and `layout`, but only the modules you name are re-exported.

For a size-bound build (such as WebAssembly), depend on `bpmnkit-feel` or `bpmnkit-dmn` directly with `default-features = false` to leave out the IANA time zone table and the full regex engine.

## Example

```rust
use bpmnkit::dmn::{evaluate_decision_table, parse_dmn};
use bpmnkit::feel::{evaluate, Context, Value};

// FEEL
let mut vars = Context::new();
vars.insert("score", Value::from(70));
assert_eq!(evaluate("score >= 50", &vars).unwrap(), Value::from(true));

// DMN: a decision table evaluated with the same FEEL context
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
let outcome = evaluate_decision_table(&definitions.decisions[0], &vars).unwrap();
assert_eq!(outcome.result, Value::from("pass"));

// BPMN: parse and write back losslessly
let process = bpmnkit::bpmn::parse_bpmn(r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"/>
  </bpmn:process>
</bpmn:definitions>"#).unwrap();
assert_eq!(process.processes[0].id, "p");
let _xml = bpmnkit::bpmn::serialize_bpmn(&process);
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit>
