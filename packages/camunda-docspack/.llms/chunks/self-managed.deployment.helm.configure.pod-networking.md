# Configure pod networking

Configure DNS policy, custom DNS resolution, and host network access for Camunda component pods in Self-Managed Helm deployments.

The Camunda Helm chart exposes values that control how component pods connect to the network. Use these settings when your infrastructure requires custom DNS resolution behavior, or when orchestration cluster pods need to share the host node's network namespace.


## DNS policy

Every Camunda component supports a `dnsPolicy` value that controls how DNS resolution works for its pods. It maps directly to the Kubernetes [`dnsPolicy` pod spec field](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-policy).

The following components support `dnsPolicy`:

| Component              | Value key                         |
| ---------------------- | --------------------------------- |
| Orchestration cluster  | `orchestration.dnsPolicy`         |
| Identity               | `identity.dnsPolicy`              |
| Connectors             | `connectors.dnsPolicy`            |
| Optimize               | `optimize.dnsPolicy`              |
| Console                | `console.dnsPolicy`               |
| Web Modeler REST API   | `webModeler.restapi.dnsPolicy`    |
| Web Modeler WebSockets | `webModeler.websockets.dnsPolicy` |

Example — setting a custom DNS policy for the orchestration cluster:

```yaml
orchestration:
  dnsPolicy: ClusterFirst
```

If you don't set `dnsPolicy` for a component, Kubernetes applies its default (`ClusterFirst`).

Common values:

| Value                     | Behavior                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ClusterFirst`            | In-cluster DNS takes priority; unresolved names fall back to the upstream nameserver. Default for most pods. |
| `ClusterFirstWithHostNet` | Same as `ClusterFirst`, but required when `hostNetwork: true` to preserve in-cluster DNS resolution.         |
| `Default`                 | Pods inherit the DNS configuration of the node they run on.                                                  |
| `None`                    | DNS is configured entirely via `dnsConfig`.                                                                  |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-networking
