# AI agent tool definitions — Assisted tool configuration in Camunda Hub — Fix an invalid key

When a `fromAi()` key or an output key is invalid, the Camunda Hub modeler detects it locally by re-parsing the element's own fields and offers a **Fix** button. No modeling-guidance report is involved.

The Camunda Hub modeler offers **Fix** for:

- A `fromAi()` key with a missing `toolCall.` prefix, bracket notation, a quoted string, or an over-long path.
- A `fromAi` function name with incorrect casing, since only the exact name is recognized.
- A description that is not a string literal.
- An output key that is a near-miss of `toolCallResult`, such as `toolcallresult`.
- A `fromAi()` key that cannot be recovered as written, such as a missing or numeric key. The Camunda Hub modeler fills in a key derived from the field's own target.

In every case, **Fix** rewrites only the invalid key or the `fromAi(...)` span and leaves the rest of the field intact. A field such as `=concat("prefix-", fromAi(...), "-suffix")` keeps both surrounding literals, and correcting an invalid key preserves any description and type arguments you entered.

The button is always labeled **Fix**, so hover it to see the specific change it makes before you select it.

If a field's expression cannot be parsed at all, the Camunda Hub modeler cannot identify what to correct and offers no fix. Repair the expression yourself.

If a `fromAi()` call is on an element other than the tool's root node, the AI Agent connector cannot resolve it. The Camunda Hub modeler offers a move action, labeled with the root node's name, that declares the input on the root node and rewrites only the `fromAi(...)` span on the original field.

This assistance complements the agent [modeling-guidance rules](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-fromai-contract), which flag the same contract problems. The rules report what is wrong, assisted configuration offers to fix it.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
