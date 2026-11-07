# bpmnkit-form

Camunda Form model, parser and serializer.

This is the Rust twin of `@bpmnkit/core` form parser and exporter. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-form
```

## Example

```rust
use bpmnkit_form::{export_form, parse_form};

let form = parse_form(r#"{"id":"f","type":"default","components":[]}"#).unwrap();
assert_eq!(form.id, "f");
let text = export_form(&form);
assert_eq!(parse_form(&text).unwrap(), form);
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-form>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
