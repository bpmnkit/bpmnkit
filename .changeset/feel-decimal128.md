---
"@bpmnkit/feel": major
---

FEEL numbers are DMN Decimal128 (34 significant digits, rounded half to even, Java `BigDecimal` semantics as in Camunda 8), not float64 (#320). `0.1 + 0.2 = 0.3` is now `true`, `100 * 1.1` is `110.0`, `1 / 3` has 34 digits and integers past 2^53 stay exact.

Breaking changes:

- A number in a FEEL value is a `FeelNumber`, never a JS `number`: `evaluate` returns one, list and context results hold them, and the `number` AST node's `value` is one. Use `toJs(value)` for plain JS data (every `FeelNumber` becomes the nearest JS number, deeply), or `FeelNumber#toNumber()` / `toString()`.
- `FeelValue` no longer includes `number`. Code that builds FEEL values by hand (functions passed in `vars`, custom `FeelFunction`s) must return `FeelNumber`s; `fromJs(value)` converts plain JS data.
- `string()` keeps a number's scale (`string(1.50)` is `"1.50"`, `string(decimal(1, 2))` is `"1.00"`), and the rounding functions round with Java's `setScale`.
- `10 ** 400` and rounding at scales past float64's range now give exact numbers instead of `null`.

`evaluate` and `evaluateUnaryTests` still accept plain JS numbers (and bigints) in `vars` and as the input, deeply inside arrays and objects. New exports: `FeelNumber`, `isFeelNumber`, `RoundingMode`, `toJs`, `fromJs`.
