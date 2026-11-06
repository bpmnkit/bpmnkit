---
"@bpmnkit/engine": minor
---

`evaluateDecisionGraph(definitions, decisionId, vars)` evaluates a decision with the decisions it requires: each required decision runs once, before its readers, and is in scope under its name. Decisions with a literal expression evaluate it (`literalExpressionText` reads it). Variable names with spaces now resolve in decision tables.
