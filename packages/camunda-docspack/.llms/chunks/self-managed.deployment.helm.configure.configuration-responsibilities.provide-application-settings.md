# Understand Helm and application configuration responsibilities — Provide application settings

Three forms are supported, and they behave differently. For the full mechanics, including per-component merge behavior and a worked migration from environment variables, see [configure component configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs).

| Form                             | Behavior                                                                                                                  | Use when                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `<component>.extraConfiguration` | Each entry mounts as its own file and merges into the pod's Spring configuration alongside the chart's `application.yaml` | Almost always. This is the recommended path                          |
| `<component>.configuration`      | Replaces the entire default application configuration file                                                                | You intend to own the whole file, including the chart's defaults     |
| `<component>.env`                | Injects environment variables                                                                                             | A single value, or a value that must come from a secret at pod start |

**Warning**
Helm merges maps deeply but replaces arrays wholesale. `extraConfiguration` is a list, so an overlay that sets it replaces every entry from a lower layer rather than adding to them. Keep all entries for a component in one place.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities
