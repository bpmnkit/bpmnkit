# Property reference — Configuration of the `restapi` component — env

| Environment variable                         | Description                                                                                                                                                                                                                                                                            | Example value | Default value |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| `TEST_MODE_ENABLED`                          | [optional]Enables the [**Test** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) in the BPMN editor, allowing users to test processes in a playground environment.                                                                             | `true`        | `true`        |
| `ZEEBE_BPMN_DEPLOYMENT_ENABLED`              | [optional]Enables the [**Deploy** and **Run**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) actions in the BPMN editor.When disabled, it prevents users from deploying and starting instances of processes via the UI.                       | `false`       | `true`        |
| `ZEEBE_DMN_DEPLOYMENT_ENABLED`               | [optional]Enables the [**Deploy**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process) action in the DMN editor.When disabled, it prevents users from deploying decisions via the UI.                                                               | `false`       | `true`        |
| `DYNAMIC_CLUSTER_MANAGEMENT_ENABLED`         | [optional]Enables or disables [dynamic cluster management](#dynamic-cluster-management).                                                                                                                                                                                          | `true`        | `false`       |
| `CAMUNDA_HUB_FEATURE_UI_USER_INVITE_ENABLED` | [optional][Enables the button](#hide-add-members-button) for inviting members to a workspace.                                                                                                                                                                                     | `false`       | `true`        |
| `MARKETPLACE_ENABLED`                        | [optional]Enables the integration of the [Camunda Marketplace](https://marketplace.camunda.com). If enabled, users can browse the Marketplace and download [resources](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace) directly inside Camunda Hub. | `false`       | `true`        |

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

You can still define new clusters in your configuration, though it's not required. When you do, Camunda Hub automatically registers them with all [available settings](#clusters) and full management functionality in the interface.

**Note**
With dynamic cluster management enabled, don't call the create or update cluster registration endpoint manually—only let your cluster configuration do it. The endpoint doesn't yet support creating clusters with all configurable settings.

#### Hide add members button

Hide the **Add members** button on the workspace **Members** page (which is displayed by default):

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
