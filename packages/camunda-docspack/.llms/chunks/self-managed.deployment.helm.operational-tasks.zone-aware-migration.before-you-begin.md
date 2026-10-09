# Migrate to zone-aware brokers — Before you begin

- [Back up the Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) before you start this procedure.
- Confirm that the existing Helm releases and their numbered brokers are healthy. See [Check broker health](#check-broker-health).
- Confirm that each Kubernetes cluster has enough capacity (nodes) for both broker generations and their persistent volume claims (PVCs).
- Back up the values used by each Helm release.
- Suspend planned node drains, autoscaler scale-down, and other maintenance that could evict broker pods until the migration is complete.

The examples in this procedure use these variables. Set them separately for each release.

```bash
export RELEASE="camunda-platform"
export NAMESPACE="camunda"
export CHART="camunda/camunda-platform"
export CHART_VERSION="<chart-version>"
export VALUES="values.yaml"
export LOCAL_ZONE="zone-a"
export MANAGEMENT_URL="http://127.0.0.1:9600"
```

Replace the example values with values from your installation. Set `CHART_VERSION` to the Camunda 8.10 chart version that supports zone-aware migration.

### Access the management API

Use the [Orchestration management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api) to change the cluster topology. To reach it, and for its port, security, and TLS options, see [About this API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#about-this-api). Set `MANAGEMENT_URL` to the resulting address. To check broker health, you also need access to the brokers of every release.

For example, forward the management port of the release's gateway Service to your machine:

```bash
kubectl port-forward "svc/$RELEASE-zeebe-gateway" 9600:9600 --namespace "$NAMESPACE"
```

During the migration, this Service selects both the numbered and the zone-aware brokers. You can send the requests through any of them, because each broker forwards cluster configuration requests to the broker that coordinates the change.

Several requests in this procedure start an asynchronous configuration change and return a `changeId`. Track each change as described in [Monitor a configuration change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change), and continue only after it reaches the `COMPLETED` status.

### Check broker health

Check broker health with the [health check endpoint](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/health#health-check) of each broker pod. A finished rollout and an `ACTIVE` state in `GET /actuator/cluster` don't prove that the brokers can process: a broker passes its readiness probe and stays `ACTIVE` in the topology even if its partitions fail to start.

Query each broker pod directly, not through a Service, for example after `kubectl port-forward pod/<broker-pod> 9600:9600 --namespace "$NAMESPACE"`:

```bash
curl --fail "$MANAGEMENT_URL/actuator/health/status"
```

A healthy broker returns HTTP `200`. If a broker returns `503`, check its logs and resolve the problem before you continue.

Only brokers that belong to the logical cluster report healthy. During the migration, these brokers are expected to report unhealthy:

- Zone-aware brokers of a zone that you haven't migrated yet.
- Numbered brokers of a zone that you have migrated but not yet removed from the release.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
