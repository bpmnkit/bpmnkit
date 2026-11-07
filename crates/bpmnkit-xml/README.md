# bpmnkit-xml

A lossless XML reader and writer. Qualified names keep their prefixes, attributes keep their source order and unknown content is written back as it was read.

This is the Rust twin of `@bpmnkit/core` XML reader/writer. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-xml
```

## Example

```rust
use bpmnkit_xml::{parse_xml, serialize_xml};

let root = parse_xml(r#"<a:root xmlns:a="urn:x" b="1"><a:child>t</a:child></a:root>"#).unwrap();
assert_eq!(root.name, "a:root"); // prefixes are kept, not resolved
assert_eq!(root.local_name(), "root");
assert_eq!(root.attr("b"), Some("1"));
assert!(serialize_xml(&root).contains("<a:child>t</a:child>"));
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-xml>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
