# bpmnkit-diff

Semantic diff of BPMN models: which elements were added, removed, changed (field by field) or only moved, plus a presentation-free semantic hash.

This is the Rust twin of `@bpmnkit/core` `diffBpmn`, `projectSemantics` and `semanticHash`. The TypeScript implementation is the oracle: both are held to the same conformance cases, hashes included, so results match.

## Install

```sh
cargo add bpmnkit-diff
```

## Example

```rust
use bpmnkit_diff::{diff_bpmn, diff_to_text, semantic_hash, DiffTextOptions};

let diff = diff_bpmn(&before, &after);        // before, after: bpmnkit_bpmn::model::BpmnDefinitions
println!("{}", diff_to_text(&diff, &DiffTextOptions::default()));
assert_eq!(diff.before_hash == diff.after_hash, semantic_hash(&before) == semantic_hash(&after));
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-diff>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
