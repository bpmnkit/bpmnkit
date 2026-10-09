# Configuration — Monitoring and health probes

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/monitoring).


## Logging

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging).


## Allow non-self assignment

**Danger**
The `allow-non-self-assignment` flag applied only to the removed Tasklist V1 API.

In Camunda 8.10 and later, Tasklist uses only the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview), so this flag is not part of the current configuration model. Use [authorization-based access control](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) to manage who can assign or update user tasks.


## Tasklist API mode configuration

Starting with Camunda 8.10, Tasklist no longer supports switching between V1 and V2 modes.

Tasklist always uses the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview), and the legacy `CAMUNDA_TASKLIST_V2_MODE_ENABLED` / `camunda.tasklist.V2ModeEnabled` settings are no longer part of the current configuration model.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration
