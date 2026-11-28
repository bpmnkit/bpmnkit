# @crates/bpmnkit-feel

## 0.9.1

### Patch Changes

- 8711af9: `sum([])` (and `sum()`) now returns null, as DMN 1.5 (Table 75) and Camunda 8 do, instead of 0. `sum([0])` is still 0.

## 0.9.0

### Minor Changes

- d9376af: Ranges and `for` / `some` / `every` stop at 1,000,000 items (`MAX_ITERATIONS`); past it the expression is null instead of running for minutes. Rust reports a new `WarningKind::IterationLimitExceeded` (`ITERATION_LIMIT_EXCEEDED`). Camunda has no such bound.

### Patch Changes

- 159cc21: Rounding looks at every dropped digit, as `BigDecimal` does: `decimal(850.01, -2)` is `900` (was `800`), `decimal(0.2501, 1)` is `0.3`, `round half down(8.5001, 0)` is `9`, and a 34-digit result just past a tie rounds up (`1 + 0.00000000000000000000000000000000050001`). `fastnum`'s `rescale` decided half-even/half-down from the first dropped digit alone; it now only truncates.

## 0.8.0

### Minor Changes

- 5639dcd: FEEL numbers are DMN Decimal128 (34 significant digits, rounded half to even, Java `BigDecimal` semantics as in Camunda 8) instead of `rust_decimal`'s 28 digits (#320). Breaking: `Value::Number` holds the crate's own `bpmnkit_feel::Decimal` (a `fastnum::D256` wrapper), not `rust_decimal::Decimal`. `string()` keeps a number's scale, and `10 ** 400` or `exp(-67)` are numbers instead of `null` or `0`. The workspace MSRV rises from 1.85 to 1.94 (`fastnum` needs it).

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
