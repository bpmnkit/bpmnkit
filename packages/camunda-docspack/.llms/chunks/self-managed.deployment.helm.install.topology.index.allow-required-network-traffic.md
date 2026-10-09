# Install the Camunda 8.10 deployment topology — Allow required network traffic

If you enforce NetworkPolicies, allow the following traffic in addition to your database and secondary-storage connections:

| Source                  | Destination                                               | Ports                   | Purpose                                                 |
| ----------------------- | --------------------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| All namespaces          | Cluster DNS                                               | `53/TCP`, `53/UDP`      | Resolve cross-namespace service names                   |
| Camunda Hub             | `camunda-zeebe-gateway.orchestration.svc.cluster.local`   | `26500/TCP`, `8080/TCP` | Deploy processes and call the Orchestration Cluster API |
| Camunda Hub             | `camunda-zeebe.orchestration.svc.cluster.local`           | `9600/TCP`              | Check Orchestration Cluster application readiness       |
| Camunda Hub             | `camunda-optimize.<optimize-namespace>.svc.cluster.local` | `80/TCP`                | Check Optimize readiness                                |
| Camunda Hub             | `camunda-connectors.orchestration.svc.cluster.local`      | `8080/TCP`              | Check Connectors readiness                              |
| Orchestration namespace | `camunda-identity.hub.svc.cluster.local`                  | `80/TCP`                | Use central Management Identity                         |
| Optimize namespace      | `camunda-identity.hub.svc.cluster.local`                  | `80/TCP`                | Use central Management Identity                         |
| All namespaces          | Your OIDC provider                                        | Provider HTTPS port     | Authenticate users and clients                          |

Restrict policies to the listed workloads and namespaces instead of allowing unrestricted cross-namespace traffic.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
