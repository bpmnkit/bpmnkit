# @bpmnkit/connectors — Connector cards

A summary lists every input of a template. Many templates hold several operations, so GitHub's
lists `owner` five times, once per operation that uses it. A **card** is one operation with only
the inputs it uses. It is the shape to hand a language model:

```typescript
import { findConnectorCards, formatConnectorCard } from "@bpmnkit/connectors";

const [card] = findConnectorCards("create a github issue");
card.alias;      // "github"
card.operation;  // "createIssue"
card.values;     // { operationGroup: "issues", issueOperationType: "createIssue" }
card.required;   // owner, repo, issueTitle
formatConnectorCard(card);
// github createIssue — GitHub Outbound Connector: Issues / Create an issue | owner* repo* issueTitle* | optional: …
```

Pass `card.values` together with the inputs to `applyConnectorTemplate`. They select the
operation.

- **Modes.** Dropdowns that change what an operation needs without making it a different
  operation, such as an authentication type, are `card.modes`. Each choice lists the required
  inputs it adds.
- **Advanced inputs.** Inputs marked `advanced` (retries, timeouts, TLS, saved credentials) are
  left out of `formatConnectorCard` unless you pass `{ advanced: true }`.
- **Aliases.** Every bundled template has a short, fixed alias, such as `http`, `slack` or
  `sqs-message-start`, in `CONNECTOR_ALIASES`. That table also lists which dropdowns choose the
  operation. `connectorAlias(id)` and `templateIdForAlias(alias)` map between the two.

---
Source: https://bpmnkit.com/docs/packages/connectors
