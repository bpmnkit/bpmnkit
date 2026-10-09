# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Deduplication

The **Deduplication** section allows you to configure connector deduplication parameters.

**Connector deduplication** is a mechanism in the connector runtime that determines how many email subscriptions are created if there are multiple occurrences of the **Microsoft 365 Email Inbound connector** in the BPMN diagram.

By default, the connector runtime deduplicates connectors based on properties, so elements with the same subscription properties only result in one subscription.

**Note**
To learn more about deduplication, see [deduplication](https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound#connector-deduplication).

To customize the deduplication behavior, select the **Manual mode** checkbox and configure a custom deduplication ID.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
