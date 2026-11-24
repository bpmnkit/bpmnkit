# @crates/bpmnkit-feel

## 0.7.2

## 0.7.1

## 0.7.0

## 0.6.1

### Patch Changes

- e7cde10: FEEL: TS and Rust agree on context equality (key sets and kind), decimal modulo, huge-scale rounding, fractional `substring` start, `sublist`/time integer args, `index of` and list positions.

## 0.6.0

## 0.5.0

### Minor Changes

- 65901c8: `formatFeel` keeps the parentheses the printed text needs, so formatting a parsed expression no longer changes its value or breaks re-parsing (`(1 + 2) * 3`, `x in (1, 2)`, …). New Rust `bpmnkit_feel::format()` (and `Expression::format()`, `UnaryTests::format()`) gives the same output.

## 0.4.0

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
