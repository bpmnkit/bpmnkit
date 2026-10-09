# Understand Helm and application configuration responsibilities — Where settings belong

_What_ you're configuring determines _where_ the setting belongs:

| Configuring                  | Examples                                                                                                                                          | Belongs in                       |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------- |
| Application behavior         | Feature flags, toggles, log levels, security and authorization behavior, Spring Boot properties, and anything else that changes application logic | `<component>.extraConfiguration` |
| Kubernetes infrastructure    | Resource requests and limits, affinity and scheduling, service accounts, volumes, replica counts, deployment strategy                             | `values.yaml`                    |
| Connectivity and credentials | External endpoints, database URLs, secondary storage hosts, TLS certificates, secret references, Ingress and Gateway wiring                       | `values.yaml`                    |
| Cross-component coordination | Release role (`global.topology.mode`), the Hub cluster inventory, shared authentication identifiers                                               | `values.yaml`                    |

Application property names are the same whichever deployment method you use, so what you learn about `camunda.security.*` or `camunda.physical-tenants.*` transfers from Helm to Docker, to a JAR, or to ECS. Chart values don't transfer, which is why they're limited to the deployment layer.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities
