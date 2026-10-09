# Inbound connector deduplication — Automatic deduplication

By default, the connector runtime assigns the same deduplication ID to connector events with matching properties, and different IDs to events with different properties.

In this context, equal properties means the properties that define the business logic of the connector are exactly the same, including whitespace characters.

The automatic deduplication only takes into account the properties that are related to the business logic of the connector itself (for example, **Server URL** or **Authentication properties**).
It does not take into account the properties that define output mapping (**Result variable**, **Result expression**, **Response expression**), correlation (**Correlation key (process)**, **Correlation key (payload)**, **Activation condition**), or other properties that are handled by the connector runtime and not by the connector itself.

This way, two connectors of the same type that are identical in terms of business logic and are defined in the same process definition will be deduplicated automatically.

### Cross-version deduplication

In Camunda 8.9+, deduplication is performed across all versions of the same process definition.
This means that if you deploy version 1 and version 2 of a process with the same compatible inbound connector, there will only be one executable connector instance serving both versions.

This behavior is a natural extension of support for [inbound connectors across multiple process versions](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle). When connector properties are identical across versions, the connector runtime automatically consolidates them into a single subscription or endpoint.

To learn more about how inbound connectors behave across process versions, see [Inbound connector lifecycle](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle).

**Warning**
Webhook connectors and multiple versions
When using webhook connectors, you cannot reuse the same webhook endpoint for multiple process versions if you want to keep them both active simultaneously.

The default behavior is to keep the old version running when you deploy a new version that uses the same endpoint. The new version's connector will not become active until no process instances are running on the older version.

To keep both versions active:

- Complete all process instances on the older version before you deploy the new version.
- Or, use a different webhook endpoint path in the new version.

For more details, see [Inbound connector lifecycle](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle).

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication
