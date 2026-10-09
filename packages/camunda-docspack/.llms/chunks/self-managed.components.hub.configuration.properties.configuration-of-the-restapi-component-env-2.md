# Property reference — Configuration of the `restapi` component — env

| Environment variable                            | Description                                                                                                              | Example value                                |
| :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| `CAMUNDA_HUB_CLUSTERS_0_ID`                     | An identifier for the cluster.                                                                                           | `camunda-platform`                           |
| `CAMUNDA_HUB_CLUSTERS_0_NAME`                   | A readable name for the cluster.                                                                                         | `Camunda Platform`                           |
| `CAMUNDA_HUB_CLUSTERS_0_VERSION`                | The cluster version.                                                                                                     | `8.10.0`                                     |
| `CAMUNDA_HUB_CLUSTERS_0_TAGS`                   | A list of tags. The tags appear on every [environment](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/environments) of the cluster. Use `prod` to mark production. | `['dev', 'test']`                            |
| `CAMUNDA_HUB_CLUSTERS_0_AUTHENTICATION`         | The [authentication method](#available-authentication-methods).                                                          | `BEARER_TOKEN`                               |
| `CAMUNDA_HUB_CLUSTERS_0_AUTHORIZATIONS_ENABLED` | Enables or disables authorizations for the cluster. If enabled, users see a hint when they deploy from Camunda Hub.      | `true`                                       |
| `CAMUNDA_HUB_CLUSTERS_0_CUSTOMPROPERTIES`       | A list of custom properties.                                                                                             | See [custom properties](#custom-properties). |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS`             | A list of components for the cluster.                                                                                    | See [components](#components).               |

#### Available authentication methods

Clusters must be configured using the following options to access the cluster from within Camunda Hub:

| Method         | Description                                                                                                                             | When to use?                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BEARER_TOKEN` | Camunda Hub sends the authenticated user's token in the `Authorization` header with every request to the cluster.                       | **Cluster version >= 8.8**The cluster uses [OIDC authentication](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider) with the same identity provider as Camunda Hub._Note_: You need to ensure that the cluster [accepts Camunda Hub's token audience](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details). |
| `BASIC`        | Camunda Hub sends a username and password with every request to the cluster. The credentials have to be provided by the user in the UI. | **Cluster version >= 8.8**The cluster uses Basic authentication.**Console limitation**Console pages in Camunda Hub don't support clusters configured with Basic authentication. Console requests to the Orchestration Cluster are made automatically in the background, so there is no UI to collect credentials. Clusters using Basic authentication _will not work correctly_ with Camunda Hub's Console functionality. |
| `NONE`         | Camunda Hub does not send any authentication information.                                                                               | **Cluster version >= 8.8**The cluster API is [configured as unprotected](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview#enable-api-authentication-and-authorizations) and can be used without authentication.                                                                                                                                                                                                               |

#### Custom properties

Use custom properties to include helpful links in the **Clusters** user interface:

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
