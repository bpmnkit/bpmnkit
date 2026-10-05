# Connectors in AI Generation — Connector cards

The 133 Camunda connector templates are bundled in
[`@bpmnkit/core/connectors`](/docs/packages/connectors). A template with several operations
becomes one **card** per operation, with only the inputs that operation uses:

```
slack chat.postMessage — Slack Outbound Connector: Post message | token*(secret) data.text* data.channel* | optional: data.thread resultVariable resultExpression(=FEEL)
```

`*` marks a required input. `(secret)` takes a `{{secrets.NAME}}` placeholder.

- **Picking cards.** `selectConnectors({ text, tasks })` picks the cards for each task, in
  code. A card fits when the task's name names the system ("Post summary to **Slack**"), or
  when the request names it and no other task does.
- **Searching.** `findConnectorCards(query)` searches all cards.
- **From a terminal.** `casen connector cards "post a message to slack"` prints them.

---
Source: https://bpmnkit.com/docs/guides/ai-connectors
