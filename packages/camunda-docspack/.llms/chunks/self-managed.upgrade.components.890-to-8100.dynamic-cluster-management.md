# Upgrade Camunda components from 8.9 to 8.10 — Dynamic cluster management

In Camunda 8.8 and 8.9, you could use `CAMUNDA_CONSOLE_EXPERIMENTAL_DISCOVERY_MODE` to expose the discovery API, which allowed clusters to send license information and register themselves with Console. This experimental feature is now replaced by a new [feature flag](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#feature-flags) in the Camunda Hub configuration: `DYNAMIC_CLUSTER_MANAGEMENT_ENABLED`.

With dynamic cluster management, clusters can regularly [send license information](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camunda-hub-ping-configuration) to a [discovery endpoint](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/create-cluster-registration.api):

```
POST /api/v2/clusters
```

With that information, Camunda Hub registers the cluster with minimal data and no management functionality in the user interface. This behavior is similar to `CAMUNDA_CONSOLE_EXPERIMENTAL_DISCOVERY_MODE`.

However, unlike in Console, where cluster records were cleaned up on restart, Camunda Hub cluster registrations persist through restarts. So you'll need to remove them yourself using the [remove cluster registration](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/remove-cluster-registration.api) endpoint:

```
DELETE /api/v2/clusters/{clusterId}
```

Read more about dynamic cluster management in the [Camunda Hub properties reference](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#dynamic-cluster-management).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
