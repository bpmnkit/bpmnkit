# Kafka connector — Configure your Kafka Consumer connector — Output mapping

The **Kafka Consumer connector** returns the consumed message.

The following fields are available in the `response` variable:

- `key`: The key of the message.
- `value`: The value of the message.
- `rawValue`: The value of the message as a JSON string.

You can use an output mapping to map the response:

1. Use **Result variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result expression** to map fields from the response into process variables. For example:

```
= {
  "itemId": value.itemId
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
