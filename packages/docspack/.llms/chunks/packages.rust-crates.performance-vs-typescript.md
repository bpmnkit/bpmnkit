# Rust crates — Performance vs TypeScript

The Rust crates are faster than the TypeScript packages in most areas, but not all. These
figures are approximate. They were measured on a shared machine, as the minimum of interleaved
runs over the conformance corpora, and they will vary with hardware and input. Treat them as an
order of magnitude. The details and the bench commands are in the repository's
`doc/progress.md`.

| Operation | Rust vs TypeScript |
|---|---|
| Layout, semantic (BPMN) | ≈2.5× faster (owned API, up to ≈2.9×) |
| Layout, grid (BPMN) | ≈2.2× faster |
| Layout, DMN | ≈1.4× faster (≈3.5× with the owned API) |
| Builder with layout | ≈2.2× faster |
| Process text, parse | ≈2.4× faster |
| Process text, write | ≈2.6× faster |
| Compact JSON, expand | ≈2.9× faster |
| Compact JSON, compactify | ≈2.1× faster |
| Lint, optimize, compat checks | ≈2× faster |
| DMN evaluate | ≈1.35× faster |
| BPMN serialize | ≈1.2× faster |
| BPMN parse | on par |

Not everything is faster: DMN parsing is currently slower than TypeScript.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
