# Property reference — Configuration of the `restapi` component — env

| Environment variable                                  | Description                                                                                                                                                                                                                                                                                  | Example value | Default value |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| `CAMUNDA_HUB_FEATURE_TESTMODEENABLED`                 | [optional]Enables the [**Test** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) in the BPMN editor, allowing users to test processes in a playground environment.                                                                                   | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_BPMNDEPLOYMENTENABLED`           | [optional]Enables the [**Deploy** and **Run**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) actions in the BPMN editor.When disabled, it prevents users from deploying and starting instances of processes via the UI.                             | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_DMNDEPLOYMENTENABLED`            | [optional]Enables the [**Deploy**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) action in the DMN editor.When disabled, it prevents users from deploying decisions via the UI.                                                                     | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_DYNAMICCLUSTERMANAGEMENTENABLED` | [optional]Enables [dynamic cluster management](#dynamic-cluster-management).                                                                                                                                                                                                            | `true`        | `false`       |
| `CAMUNDA_HUB_FEATURE_UIUSERINVITEENABLED`             | [optional][Enables the button](#hide-add-members-button) for inviting members to a workspace.                                                                                                                                                                                           | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_RUNTIMECONNECTIONENABLED`        | [optional]Enables the [runtime connection](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime) selector in the BPMN editor.When disabled, task testing uses its own cluster selection and connector credentials aren't offered in the properties panel. | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_CREDENTIALSENABLED`              | [optional]Enables [credentials](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index) in Camunda Hub.Offering connector credentials in the properties panel of the BPMN editor also requires `CAMUNDA_HUB_FEATURE_RUNTIMECONNECTIONENABLED`.                               | `false`       | `true`        |
| `CAMUNDA_HUB_FEATURE_MARKETPLACEENABLED`              | [optional]Enables the integration of the [Camunda Marketplace](https://marketplace.camunda.com). If enabled, users can browse the Marketplace and download [resources](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace) directly inside Camunda Hub.       | `false`       | `true`        |

#### Dynamic cluster management

Use dynamic cluster management to automatically register your clusters with Camunda Hub.

By default, clusters shown in Camunda Hub are strictly managed by your [configuration](#clusters). Cluster registrations are created, updated, and deleted when you change your cluster configuration values.

Dynamic cluster management changes this to a hybrid model. Camunda Hub uses your cluster configuration—if you provide one—alongside the following API endpoints, which are only exposed when dynamic cluster management is enabled:

| Name                                                                                                                       | Path                                  |
| :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| [**Create or update a cluster registration**](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/create-cluster-registration.api) | `POST /api/v2/clusters`               |
| [**Remove a cluster registration**](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/remove-cluster-registration.api)           | `DELETE /api/v2/clusters/{clusterId}` |

In this mode, you:

1. [Configure your Orchestration Clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#camunda-hub-ping-configuration) to send license information directly to the [create or update a cluster registration](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/create-cluster-registration.api) endpoint. If you didn't define the clusters in your configuration, this call registers them with minimal information and no management functionality in the Camunda Hub interface.
2. Remove stale cluster registrations from Camunda Hub using the [remove a cluster registration](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/remove-cluster-registration.api) endpoint.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
