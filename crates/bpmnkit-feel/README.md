# bpmnkit-feel

FEEL (DMN 1.5 plus Camunda extensions): lexer, parser and evaluator with exact decimal numbers.

This is the Rust twin of `@bpmnkit/feel`. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-feel
```

## Example

```rust
use bpmnkit_feel::{evaluate, Context, Value};
let mut ctx = Context::new();
ctx.insert("x", Value::from(2));
assert_eq!(evaluate("x * 3 + 1", &ctx).unwrap(), Value::from(7));
```

## Features

- `tz` (default): IANA zone names in temporal values.
- `full-regex` (default): the regex crate's speed-ups and every Unicode class for `matches()`.

Turn both off with `default-features = false` for a size-bound build (for example WebAssembly).

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-feel>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
