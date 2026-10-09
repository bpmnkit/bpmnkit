# Configure pod networking — Host network (orchestration cluster only)

Setting `orchestration.hostNetwork` to `true` makes orchestration cluster pods use the host node's network namespace instead of the default pod network. In this mode, pods share the node's IP address and port space rather than receiving their own cluster IP.

This option is available only for the orchestration cluster (a StatefulSet). It's useful in environments where:

- Pods must be reachable directly via the node IP (for example, bare-metal deployments without a CNI overlay network).
- A network plugin or firewall requires pods to appear as node-level processes.
- You're integrating with infrastructure that doesn't support pod-level IP routing.

```yaml
orchestration:
  hostNetwork: true
```

When `hostNetwork` is enabled and you haven't set `orchestration.dnsPolicy`, the chart automatically sets `dnsPolicy` to `ClusterFirstWithHostNet`. This ensures pods on the host network can still resolve in-cluster DNS names (for example, Kubernetes `Service` names). If you set `orchestration.dnsPolicy` explicitly, that value always takes precedence.

**Note**
Using `hostNetwork: true` means all ports opened by the orchestration cluster pods are bound directly on the node. Make sure the required ports are not already in use on the node, and review your network policies accordingly.

### Combining host network with custom DNS

To fully control DNS on a host-network pod:

```yaml
orchestration:
  hostNetwork: true
  dnsPolicy: None
  dnsConfig:
    nameservers:
      - 10.96.0.10
    searches:
      - cluster.local
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-networking
