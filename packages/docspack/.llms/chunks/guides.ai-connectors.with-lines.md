# Connectors in AI Generation — `with` lines

A `with` line configures one node:

```
with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId + " failed"
with fetch: http GET https://api.example.com/orders | result=order: response.body
```

`applyConnectorLines` resolves the line against the catalog and applies the template. A
plain task becomes the connector's service task. The resolver repairs what models get nearly
right:

- a misspelt alias;
- a short key (`channel` for `data.channel`);
- a credential written as a value, which becomes a secret placeholder.

A required input the line left out becomes a **question**, with a line for the reader to
finish. The [`with` lines reference](/docs/packages/connectors#with-lines) has the details.

---
Source: https://bpmnkit.com/docs/guides/ai-connectors
