# Property reference — Configuration of the `restapi` component — application.yaml

Use `components` to set up components in the cluster:

| Property                                               | Description                                                                                                  |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `camunda.hub.clusters[0].components[0].name`           | The component's name.                                                                                        |
| `camunda.hub.clusters[0].components[0].type`           | The component's type.                                                                                        |
| `camunda.hub.clusters[0].components[0].version`        | The component's version.                                                                                     |
| `camunda.hub.clusters[0].components[0].urls.webapp`    | The API base URL for all components with a web app: Admin, Management Identity, Optimize, Tasklist, Operate. |
| `camunda.hub.clusters[0].components[0].urls.rest`      | The REST API base URL for Connectors and the Orchestration Cluster.                                          |
| `camunda.hub.clusters[0].components[0].urls.grpc`      | The [address](#notes-on-host-names-and-port-numbers) of the [Zeebe gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc). |
| `camunda.hub.clusters[0].components[0].urls.readiness` | The address of the health check endpoint.                                                                    |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
