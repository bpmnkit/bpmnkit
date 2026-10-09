# Inbound connector deduplication — Should I use automatic or manual deduplication?

Use automatic deduplication if:

- You don't need to group connectors in a specific way and don't have any special requirements for deduplication.
- Deduplication configuration is not important for your use case (you don't use multiple connectors in the same process that listen to the same event source).

Use manual deduplication if:

- You need to group connectors in a specific way that is not supported by automatic deduplication.
- You are unsure which properties of the connector are used for automatic deduplication.
- You want to have more control over the deduplication process.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication
