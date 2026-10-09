# Configure registry and images

Configure registry and image settings for the Camunda Helm chart.

This section explains how to adjust registry and image sources for production setups, including working in air-gapped environments.


## Global and component image values

The `global.image` values apply to all components. The `image` values of a component apply to that component only.

In the following table, replace `<component>` with the values key of a component. See [image values of each component](#image-values-of-each-component).

| Value                           | Default                  | Description                                                                                                                                                            |
| ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.image.registry`         | `""`                     | Registry for the images of all components.                                                                                                                             |
| `<component>.image.registry`    | `""`                     | Registry for the image of one component. This value replaces `global.image.registry` for this component.                                                               |
| `<component>.image.repository`  | Depends on the component | Repository of the image of one component, without the registry.                                                                                                        |
| `<component>.image.tag`         | Depends on the component | Tag of the image of one component.                                                                                                                                     |
| `<component>.image.digest`      | `""`                     | Digest of the image of one component, for example `sha256:<digest>`. If you set a digest, the chart ignores `<component>.image.tag`.                                   |
| `global.image.pullSecrets`      | `[]`                     | List of Kubernetes Secrets that the pods of all components use to pull images.                                                                                         |
| `<component>.image.pullSecrets` | `[]`                     | List of Kubernetes Secrets that the pod of one component uses to pull images. This value replaces `global.image.pullSecrets` for this component.                       |
| `global.image.pullPolicy`       | `Always`                 | Image pull policy of the container of each component. Valid values are `Always`, `IfNotPresent`, and `Never`. You can't set a different pull policy for one component. |

A component value replaces the global value for that component. If a component value is empty, the chart uses the global value. The chart doesn't merge the two `pullSecrets` lists.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/index
