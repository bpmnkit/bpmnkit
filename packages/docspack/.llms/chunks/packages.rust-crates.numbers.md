# Rust crates — Numbers

FEEL numbers in Rust are DMN Decimal128, as Camunda 8 computes them (`java.math.BigDecimal`
with `MathContext.DECIMAL128`): 34 significant digits, every result rounded half-even, and the
scale kept as `BigDecimal` keeps it. `0.1 + 0.2 = 0.3` is `true`, `1 / 3` is
`0.3333333333333333333333333333333333`, `9007199254740993 + 1` is `9007199254740994`, and
`string(amount * 1.1)` with `amount = 100` is `"110.0"`. Equality and ordering go by value
(`1.0 = 1.00`). Integer powers are exact; `sqrt`, `exp`, `log` and powers with a fractional
exponent are irrational, so they are computed in float64 and converted as Camunda converts a
double (`sqrt(2)` and `2 ** 0.5` are `1.4142135623730951`, `sqrt(16)` is `4.0`).

TypeScript still computes in float64. Results agree when compared to float64's 15 significant
digits: `0.1 + 0.2` is `0.3` in Rust and `0.30000000000000004` in TS. Rust also holds numbers
past float64's range (`10 ** 400`) and below its smallest value, where TS has `null` or `0`.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
