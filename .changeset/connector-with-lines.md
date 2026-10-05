---
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
"@bpmnkit/editor": minor
"@bpmnkit/plugins": patch
---

`with` lines: a language model configures Camunda connectors in the line format.

```
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId
with fetch: http GET https://api.example.com/orders | result=order: response.body
```

- **`@bpmnkit/core`** parses them, without the catalog. `parseProcessText` returns `connectors`, each with the element it names. `parseProcessDelta` returns `connectors` too. `parseConnectorLine` is exported. `writeProcessText(defs, { connectorLine })` writes an element's connector back as a `with` line.
- **`@bpmnkit/core/connectors`** resolves and applies them, re-exported by `@bpmnkit/connectors`:
  - `applyConnectorLines(definitions, lines)` applies each line through `applyTemplateToElement`. A plain task becomes the connector's service task, and inbound templates work on events.
  - `resolveConnectorLine` repairs a near-miss alias, an operation given by its last dotted part or by the input that selects it, a short key, and `http POST <url>` written without keys. It turns `result=name[: expr]` into the right result header, and a credential written as a value into a `{{secrets.…}}` placeholder.
  - A required input left out becomes a question with a line to finish.
  - `connectorLineFor(element)` writes an element back as a line, and `CONNECT_GUIDE` is the connect pass's system prompt.
- **`@bpmnkit/editor`'s `applyProcessDelta`** applies a script's `with` lines when given `applyConnectors: applyConnectorLines`, and returns `questions`.
- **Fix:** template conditions of the form `isEmpty` (Camunda 8.10 templates with a saved-credential picker) are evaluated. They used to count as always true, in the applier and in the editor's property panel, so the URL input of the HTTP connector was active twice.
