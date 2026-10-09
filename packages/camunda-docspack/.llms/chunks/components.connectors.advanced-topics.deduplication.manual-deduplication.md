# Inbound connector deduplication — Manual deduplication

You can manually assign a deduplication ID to each connector event. This allows you to group connectors in a more flexible way based on your requirements.

If needed, you can have multiple connectors with the same properties that have different deduplication IDs. This way, you can still have multiple instances of the same connector listening to the same event source, but each instance will have its own deduplication ID and will be treated as a separate entity by the connector runtime.

To assign a deduplication ID, take the following steps:

1. Enable the **Manual mode** checkbox in the **Deduplication** section of the connector properties.
2. In **Deduplication ID**, enter the deduplication ID.
3. Repeat the process for all connectors that should share the same deduplication ID.
4. Deploy the BPMN diagram for the changes to take effect.

![Deduplication input example](../img/deduplication-input-example.png)

**Note**
When manual deduplication is used, connectors that have the same deduplication ID must also have the same properties. Attempting to assign the same deduplication ID to connectors with different properties will result in a runtime error.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication
