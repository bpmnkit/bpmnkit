# Kafka connector — Kafka Producer connector response

The **Kafka Producer connector** returns metadata for a record that has been acknowledged by the Kafka instance.

The following fields are available in the `response` variable:

- `timestamp`: The timestamp of the message.
- `offset`: The message offset.
- `partition`: The message partition.
- `topic`: The topic name.

**Info**
For more information on these fields, refer to the [official Kafka documentation](https://kafka.apache.org/41/getting-started/introduction/).

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

   ```
   = {
     "messageAcknowledgedAt": response.timestamp
   }
   ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
