---
"@bpmnkit/feel": patch
---

A `{` in a regex that does not start a counted repetition (`{}`, `{,2}`, `a{a}`) makes `matches`, `replace` and `extract` return null, as in Java and the Rust twin; whitespace inside `{ 2 , 3 }` is ignored. Days-time duration seconds are now split, added and subtracted exactly: `string(76.542 * @"PT36H")` is `P114DT19H30M43.2S`, and time/date-time differences and time shifts keep fractional seconds exact.
