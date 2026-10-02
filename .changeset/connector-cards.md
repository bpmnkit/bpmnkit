---
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
"@bpmnkit/cli": minor
---

Connector cards: one connector operation with only the inputs it uses, for a model's prompt.

- **New functions.** `findConnectorCards(query)`, `connectorCards(id)`, `listConnectorCards()` and `formatConnectorCard(card)` are in `@bpmnkit/core/connectors`, re-exported by `@bpmnkit/connectors`. A card carries the operation's required and optional inputs (secrets and FEEL marked), the `values` that select it, and its modes (an authentication type, say), each with the inputs it adds. Plumbing such as retries, timeouts and TLS is marked `advanced`.
- **Aliases.** `CONNECTOR_ALIASES` gives every bundled template a short, fixed alias (`http`, `slack`, `sqs-message-start`, …) and lists the dropdowns that choose its operation. Use `connectorAlias(id)` and `templateIdForAlias(alias)` to map between them.
- **CLI.** `casen connector cards "<request>"` prints the best cards; `-o json` prints them as data.
- **Fix: a hidden dropdown's default no longer switches inputs on.** Applying a template used every property's default when evaluating conditions, including dropdowns hidden by their own condition. Applying GitHub's "create issue" therefore reported 11 missing required inputs belonging to other operations and wrote ten `url` and ten `method` inputs. Only active properties count now, as in the Modeler.
