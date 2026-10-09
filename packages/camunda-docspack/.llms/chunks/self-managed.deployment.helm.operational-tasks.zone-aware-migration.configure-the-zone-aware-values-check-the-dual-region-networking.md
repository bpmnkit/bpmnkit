# Migrate to zone-aware brokers — Configure the zone-aware values — Check the dual-region networking

A dual-region cluster already has cross-cluster networking in place, as described in [dual-region setup](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region). The zone-aware brokers reuse the existing `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS` value and DNS setup, so you don't need to configure new networking. Single-region clusters can skip this section.

Before you start the migration, check how the existing values address the brokers:

- **Initial contact points:** Addresses of the shared headless Service, such as `camunda-zeebe.camunda-london.svc.cluster.local:26502`, keep working during and after the migration, because the Service selects both the numbered and the zone-aware brokers. Addresses of individual numbered pods, such as `camunda-zeebe-0.camunda-zeebe.camunda-london.svc.cluster.local:26502`, stop resolving when you remove the numbered brokers. Replace them with the shared Service address.
- **Advertised host:** The chart applies `orchestration.env` to every broker pod in the release, including both the numbered and the zone-aware StatefulSet. If the values set `CAMUNDA_CLUSTER_NETWORK_ADVERTISEDHOST` to a fixed value, several brokers advertise the same address. Derive the advertised host from each pod instead.

For example, if brokers use host networking, advertise the node IP of each pod, and configure pod anti-affinity so that no two broker pods, numbered or zone-aware, run on the same node:

```yaml
orchestration:
  hostNetwork: true
  env:
    - name: CAMUNDA_CLUSTER_NETWORK_ADVERTISEDHOST
      valueFrom:
        fieldRef:
          fieldPath: status.hostIP
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
