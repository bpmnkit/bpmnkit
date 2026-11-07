# bpmnkit-spec

Single-source data tables shared with the TypeScript packages: FEEL built-ins, lint rules, Camunda compatibility rules, connector templates and element definitions. Generated from `spec/` by `pnpm spec:gen`.

This is the Rust twin of single-source data (`spec/`). The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-spec
```

## Example

```rust
use bpmnkit_spec::{feel::FEEL_BUILTINS, templates::CONNECTOR_TEMPLATES_JSON};

assert!(FEEL_BUILTINS.iter().any(|b| b.name == "abs"));
assert!(CONNECTOR_TEMPLATES_JSON.trim_start().starts_with('['));
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-spec>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
