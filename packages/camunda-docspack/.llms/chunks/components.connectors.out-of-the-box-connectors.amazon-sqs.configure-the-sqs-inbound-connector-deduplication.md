# Amazon Simple Queue Service connector — Configure the SQS inbound connector — Deduplication

The **Deduplication** section allows you to configure the connector deduplication parameters.

Not to be confused with **message deduplication**, **Connector deduplication** is a mechanism in the connector Runtime that determines how many SQS subscriptions are created if there are multiple occurrences of the **Amazon SQS Consumer connector** in the BPMN diagram.

By default, the connector runtime deduplicates connectors based on properties, so elements with the same subscription properties only result in one subscription. For details, see [Inbound connector deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication).

To customize the deduplication behavior, check the **Manual mode** checkbox and configure the custom deduplication ID.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
