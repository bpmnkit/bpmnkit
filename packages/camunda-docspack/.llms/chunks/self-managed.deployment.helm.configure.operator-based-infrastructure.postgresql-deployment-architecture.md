# Deploy required dependencies with Kubernetes operators — PostgreSQL deployment — Architecture

Our setup provisions three separate PostgreSQL clusters for different Camunda components. Use the latest PostgreSQL version listed in our [supported environments matrix](https://docs.camunda.io/docs/next/reference/supported-environments) that is compatible across the required components:

- **pg-identity**: Database for Camunda Identity component
- **pg-keycloak**: Database for Keycloak identity service
- **pg-hub**: Database for Camunda Hub

**Note: Component flexibility**
If you don't plan to use certain components (for example, Camunda Hub), you can simply remove the corresponding cluster definition from the configuration before deployment. This allows you to deploy only the PostgreSQL clusters you actually need, reducing resource consumption.

#### High availability and node maintenance

Each PostgreSQL cluster runs two instances and stores its write-ahead log (WAL) on a dedicated volume. Both defaults exist for operational reasons, not for performance.

Two instances keep your Kubernetes nodes drainable. CloudNativePG protects a running database from a node drain: when the node hosting the primary is drained, the operator performs a switchover first and then lets the eviction proceed. A single-instance cluster has nowhere to switch over to, so the operator refuses the eviction and `kubectl drain` retries until it times out:

```text
error when evicting pods/"pg-identity-1" -n "camunda": Cannot evict pod as it would violate the pod's disruption budget.
```

A Kubernetes version upgrade drains one node at a time, so a single-instance cluster stalls that upgrade on the node holding the database. CloudNativePG describes this behavior in [Kubernetes upgrade and maintenance](https://cloudnative-pg.io/docs/1.30/kubernetes_upgrade/) and recommends always running more than one instance.

A dedicated WAL volume keeps replication from filling the data directory. A standby holds a replication slot on the primary, so a standby that is down or lagging makes the primary retain WAL segments. When `pg_wal` shares a volume with `PGDATA`, that retention grows into the same space as your data. A dedicated volume confines it to its own disk. The 5Gi default covers the 1 GB `max_wal_size` checkpoint target plus the 512 MB CloudNativePG keeps in `wal_keep_size`, with room for a standby that stays down for a while. See [Volume for WAL](https://cloudnative-pg.io/docs/1.30/storage/#volume-for-wal).

Both settings are one-way. The CloudNativePG validating webhook rejects removing `walStorage` from an existing cluster, and rejects lowering `storage.size`. Decide on the WAL volume and the data volume size before you deploy. Growing `storage.size` later is supported when your storage class sets `allowVolumeExpansion: true`.

**Note**
`kubectl get pdb` reports `ALLOWED DISRUPTIONS: 0` for the primary whether you run one instance or two, because that budget only ever covers the primary. A second instance does not change the budget. It gives the operator a switchover target, so the drain can proceed. Verify the behavior with a drain rather than with the budget.

If you already run the single-instance shape from an earlier release, follow [Migrate an existing single-instance deployment](#migrate-an-existing-single-instance-deployment).

#### Run a single instance on constrained environments

Two instances only help when your cluster has two schedulable nodes. The reference manifests set [`podAntiAffinityType: required`](https://cloudnative-pg.io/docs/1.30/scheduling/), so the two instances of a cluster never share a node. CloudNativePG defaults to `preferred`, which lets the scheduler put both instances on one node when resources are tight, and a drain then has no switchover target.

The trade-off is that a cluster with fewer schedulable nodes than instances leaves the extra pod `Pending` rather than dropping to a single node. On such a cluster, reduce the instance count rather than relaxing the affinity.

For local development (Kind, minikube) or any environment where a second instance is not affordable, pass `PG_INSTANCES=1` to `deploy.sh`:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
