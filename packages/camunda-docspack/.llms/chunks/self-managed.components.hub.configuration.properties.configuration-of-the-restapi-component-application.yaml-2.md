# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                         | Description                                                                                                         | Example value                                |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------------------------------- |
| `camunda.hub.clusters[0].id`                     | An identifier for the cluster.                                                                                      | `camunda-platform`                           |
| `camunda.hub.clusters[0].name`                   | A readable name for the cluster.                                                                                    | `Camunda Platform`                           |
| `camunda.hub.clusters[0].version`                | The cluster version.                                                                                                | `8.10.0`                                     |
| `camunda.hub.clusters[0].tags`                   | A list of tags.                                                                                                     | `['dev', 'test']`                            |
| `camunda.hub.clusters[0].authentication`         | The [authentication method](#available-authentication-methods).                                                     | `BEARER_TOKEN`                               |
| `camunda.hub.clusters[0].authorizations.enabled` | Enables or disables authorizations for the cluster. If enabled, users see a hint when they deploy from Camunda Hub. | `true`                                       |
| `camunda.hub.clusters[0].custom-properties`      | A list of custom properties.                                                                                        | See [custom properties](#custom-properties). |
| `camunda.hub.clusters[0].components`             | A list of components for the clusters.                                                                              | See [components](#components).               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
