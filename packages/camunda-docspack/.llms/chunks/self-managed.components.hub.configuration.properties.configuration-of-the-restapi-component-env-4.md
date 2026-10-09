# Property reference — Configuration of the `restapi` component — env

Use `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS` to set up components in the cluster:

| Environment variable                                 | Description                                                                                                  |
| :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_NAME`           | The component's name.                                                                                        |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_TYPE`           | The component's type.                                                                                        |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_VERSION`        | The component's version.                                                                                     |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_WEBAPP`    | The API base URL for all components with a web app: Admin, Management Identity, Optimize, Tasklist, Operate. |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_REST`      | The REST API base URL for Connectors and the Orchestration Cluster.                                          |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_GRPC`      | The [address](#notes-on-host-names-and-port-numbers) of the [Zeebe gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc). |
| `CAMUNDA_HUB_CLUSTERS_0_COMPONENTS_0_URLS_READINESS` | The address of the health check endpoint.                                                                    |

Available component types and requirements:

| Configuration value | Component             | Requirements                                   |
| :------------------ | :-------------------- | :--------------------------------------------- |
| `connectors`        | Connectors            | REST URL                                       |
| `identity`          | Management Identity   | -                                              |
| `hub`               | Camunda Hub           | -                                              |
| `operate`           | Operate               | -                                              |
| `optimize`          | Optimize              | -                                              |
| `orchestration`     | Orchestration Cluster | Cluster version >= 8.8, gRPC URL, and REST URL |
| `admin`             | Admin                 | -                                              |
| `tasklist`          | Tasklist              | -                                              |

**Note: Backward compatibility**
The old values `webModelerWebApp` (replaced by `hub`) and `orchestrationIdentity` (replaced by `admin`) are still accepted for backward compatibility.

Example configuration:

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
