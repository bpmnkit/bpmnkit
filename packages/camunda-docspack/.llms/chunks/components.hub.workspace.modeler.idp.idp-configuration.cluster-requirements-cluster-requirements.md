# Configure IDP — Cluster requirements {#cluster-requirements}

When you create an IDP project, you select a deployment environment. Each environment maps to an underlying cluster, and the following requirements apply to that cluster:

| Requirement                                                           | Description                                                                                                                                                                                                                            |
| :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Connector secrets](#aws-secrets)                                     | You must configure the required IDP AWS connector secrets on any cluster used with IDP.                                                                                                                                                |
| [Document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started) | IDP requires a cluster that supports document handling. For example, a version 8.7 or higher cluster.                                                                                                                                  |
| Cluster health                                                        | IDP projects are only fully operational when linked to a healthy, active cluster. If needed, you can select an unstable or unhealthy cluster when first creating an IDP project, and change to a stable cluster when one is available. |

**Info**
To learn more about storing, tracking, and managing documents in Camunda 8, see [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

### Identity {#identity}

If you are using an identity-enabled cluster, the following authorizations are required for IDP operations:

| Resource type      | Permission              | Owner type | Owner          | Description                                                          |
| :----------------- | :---------------------- | :--------- | :------------- | :------------------------------------------------------------------- |
| DOCUMENT           | READ                    | Role       | Connectors     | Required for the idp connector to read the document from the cluster |
| DOCUMENT           | CREATE                  | User       | `user's email` | Required to upload documents to the cluster during IDP extraction    |
| RESOURCE           | CREATE                  | User       | `user's email` | Required to deploy process instances                                 |
| PROCESS_DEFINITION | CREATE_PROCESS_INSTANCE | User       | `user's email` | Required to start process instances                                  |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
