# Manage cluster settings — Secret filter mode

You can change the connector secret filter mode on a per-cluster basis to control which secrets outbound and inbound connectors are allowed to resolve.

**Note**
This setting applies to Camunda 8 SaaS. In Self-Managed, configure the mode using [configuration properties](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secret-filter).

- **STRICT** (default): a connector can only resolve secrets that are present for a given field in the actually deployed BPMN XML.
- **LAX**: for outbound connectors, falls back to `DISABLED` behavior (resolving all secrets) if the BPMN XML cannot be fetched. Inbound connectors behave the same as under `STRICT`, since their allow-list doesn't require a lookup.
- **DISABLED**: all secrets resolve freely, matching the behavior before this feature was introduced.

This setting is available for clusters running a version where `STRICT` is the shipped default: 8.6.28+, 8.7.25+, 8.8.19+, 8.9.10+, and 8.10.0-alpha5+. Only organization admins can change it.

For details on each mode, see [secret filter](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secret-filter).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/settings
