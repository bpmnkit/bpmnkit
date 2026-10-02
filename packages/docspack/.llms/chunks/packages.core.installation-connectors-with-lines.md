# @bpmnkit/core — Installation — Connectors: `with` lines

Both formats take `with` lines, which configure a node as a Camunda connector:

```
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId
with fetch: http GET https://api.example.com/orders | result=order: response.body
```

A line names a node by its id, then the connector's alias, its operation and its inputs as
`key=value` (`key==expr` for FEEL). Path lines are unchanged, so a diagram still streams and keeps
every structural rule.

- **Parsing.** `parseProcessText` returns the lines as `connectors`, each with the element it
  names. `parseProcessDelta` returns them as `connectors` too. Neither applies them.
- **Applying.** `applyConnectorLines` from
  [`@bpmnkit/core/connectors`](/docs/packages/connectors#with-lines) applies them, outside
  core's main entry, so the catalog is only bundled where it is used.
- **Writing.** `writeProcessText(defs, { connectorLine: connectorLineFor })` writes an
  element's connector back as a `with` line, so a model that changes the diagram keeps it.

---
Source: https://bpmnkit.com/docs/packages/core
