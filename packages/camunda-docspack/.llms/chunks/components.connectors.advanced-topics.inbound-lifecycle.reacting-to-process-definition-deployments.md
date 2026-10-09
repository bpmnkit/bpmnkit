# Inbound connector lifecycle — Reacting to process definition deployments

![Inbound connector data sources](../img/inbound-data-source.png)

The connector runtime maintains an internal state that tracks:

- Latest versions of process definitions.
- Previous process-definition versions with active message subscriptions.

The following endpoints of the Orchestration Cluster API are used as data sources:

- [Search process definitions](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-process-definitions.api)
- [Search message subscriptions](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-message-subscriptions.api)

If a process definition matches at least one of these two criteria (i.e. it is either the latest version of that process definition, or it has active instances waiting on message subscriptions), the connector runtime will create an executable for every inbound connector element in that process and keep it active as long as these criteria are met.

If a process definition is deleted from the engine; or it is replaced with a newer version of the same process, and has no active message subscriptions, the connector runtime will deactivate the related executables.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle
