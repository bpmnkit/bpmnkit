# Configure pod scheduling — Spread Camunda Hub pods across availability zones

Use a stable Pod label you control to spread Camunda Hub replicas without depending on labels managed by the Helm chart.

Set the same label key and value in `podLabels` and `affinity`:

```yaml
camundaHub:
  enabled: true
  restapi:
    replicas: 2
    podLabels:
      scheduling.example.com/affinity-group: camunda-hub-restapi
    affinity:
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchLabels:
                  scheduling.example.com/affinity-group: camunda-hub-restapi
              topologyKey: topology.kubernetes.io/zone
```

Apply the same pattern to `camundaHub.websockets`. If you're upgrading from 8.9, [move existing `webModeler.*` overrides to `camundaHub.*`](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#consolidate-console-and-web-modeler-into-camunda-hub).

The same `podLabels` and `affinity` pairing applies to every component listed in [Configure scheduling values](#configure-scheduling-values). Prefer a label you own over chart-managed labels such as `app.kubernetes.io/component`, because their values can change between chart versions.

For the Orchestration Cluster, overriding `orchestration.affinity` replaces the default hard `podAntiAffinity` rule. To spread broker pods across zones, use [`orchestration.topologySpreadConstraints`](#spread-orchestration-cluster-pods-across-availability-zones) instead.

Consider the following when you configure Pod anti-affinity:

- Use a label key with a DNS prefix you control. If multiple Helm releases share a namespace, choose a label value unique to each component and release because Pod affinity selectors use the current namespace by default.
- Ensure every eligible node has the label named by `topologyKey`. Managed cloud clusters normally set `topology.kubernetes.io/zone`.
- A preferred rule is best effort and can colocate Pods when no better placement is available. A required rule can leave Pods `Pending` or stall rolling updates when the cluster lacks capacity in enough topology domains.
- Avoid inter-Pod affinity and anti-affinity for clusters larger than several hundred nodes because they add substantial scheduler processing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-scheduling
