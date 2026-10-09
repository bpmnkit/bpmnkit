# Configure registry and images — Image values of each component

Each component has its own `image` values. Use the values key in the following table in place of `<component>`.

| Component             | Values key      | Default repository          |
| --------------------- | --------------- | --------------------------- |
| Orchestration Cluster | `orchestration` | `camunda/camunda`           |
| Connectors            | `connectors`    | `camunda/connectors-bundle` |
| Management Identity   | `identity`      | `camunda/identity`          |
| Optimize              | `optimize`      | `camunda/optimize`          |

### Camunda Hub image values

Camunda Hub runs two images, so its image values use a different layout. The REST API image and the WebSockets image share the registry, tag, and pull secrets. Each image has its own repository and digest.

| Value                                    | Description                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `camundaHub.image.registry`              | Registry for both Hub images. This value replaces `global.image.registry` for both images.                                      |
| `camundaHub.image.tag`                   | Tag of both Hub images.                                                                                                         |
| `camundaHub.image.pullSecrets`           | List of Kubernetes Secrets that both Hub pods use to pull images. This value replaces `global.image.pullSecrets` for both pods. |
| `camundaHub.restapi.image.repository`    | Repository of the REST API image. The default is `camunda/hub`.                                                                 |
| `camundaHub.restapi.image.digest`        | Digest of the REST API image. If you set a digest, the chart ignores `camundaHub.image.tag` for this image.                     |
| `camundaHub.websockets.image.repository` | Repository of the WebSockets image. The default is `camunda/hub-websockets`.                                                    |
| `camundaHub.websockets.image.digest`     | Digest of the WebSockets image. If you set a digest, the chart ignores `camundaHub.image.tag` for this image.                   |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/index
