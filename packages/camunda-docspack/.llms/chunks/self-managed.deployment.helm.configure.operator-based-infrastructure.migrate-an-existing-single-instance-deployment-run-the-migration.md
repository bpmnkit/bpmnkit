# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment — Run the migration

1. Add the following settings to each cluster you already have, keeping their existing names, databases, owners, and secrets. Do not replace your manifests with the current reference ones to perform this migration: the 8.10 reference manifests also rename the Web Modeler cluster to `pg-hub`, and applying that rename creates a new empty cluster next to your existing `pg-webmodeler` rather than migrating it.

   ```yaml
   spec:
     instances: 2
     affinity:
       enablePodAntiAffinity: true
       topologyKey: kubernetes.io/hostname
       podAntiAffinityType: required
     walStorage:
       size: 5Gi
   ```

1. Apply the change. `deploy.sh` applies the standard clusters and waits for each cluster to be fully ready:

   ```bash
   ./deploy.sh
   ```

   If you deploy the orchestration database, run the script for `pg-camunda` as well:

   ```bash
   CLUSTER_FILTER=pg-camunda ./deploy.sh
   ```

   To apply the manifests directly instead, remember the orchestration cluster lives in its own file. Applying only the first manifest leaves `pg-camunda` on the single-instance shape:

   ```bash
   kubectl apply --server-side -f postgresql-clusters.yml -n "$CAMUNDA_NAMESPACE"
   # only if you deploy the orchestration database (RDBMS secondary storage)
   kubectl apply --server-side -f postgresql-orchestration-cluster.yml -n "$CAMUNDA_NAMESPACE"
   ```

1. Watch the operator converge. It clones the new instance, then restarts the primary to attach its WAL volume:

   ```bash
   kubectl get cluster -n "$CAMUNDA_NAMESPACE" -w
   ```

   The phase moves through `Creating a new replica`, `Waiting for the instances to become active`, and `Primary instance is being restarted without a switchover` before returning to `Cluster in healthy state`.

1. Confirm every cluster reports both instances ready:

   ```bash
   kubectl get cluster -n "$CAMUNDA_NAMESPACE"
   ```

   ```text
   NAME            AGE   INSTANCES   READY   STATUS                     PRIMARY
   pg-identity     10m   2           2       Cluster in healthy state   pg-identity-1
   pg-keycloak     10m   2           2       Cluster in healthy state   pg-keycloak-1
   pg-webmodeler   10m   2           2       Cluster in healthy state   pg-webmodeler-1
   ```

   A cluster stuck at `1` ready usually has its second pod `Pending`, because the required anti-affinity found no second schedulable node.

1. Confirm the instances of each cluster sit on different nodes:

   ```bash
   kubectl get pods -n "$CAMUNDA_NAMESPACE" -l cnpg.io/podRole=instance -o wide
   ```

1. Confirm `pg_wal` moved onto the dedicated volume on every instance of every cluster. It becomes a symbolic link, and the original directory content is moved for you:

   ```bash
   for pod in $(kubectl get pods -n "$CAMUNDA_NAMESPACE" -l cnpg.io/podRole=instance -o name); do
     echo "$pod"
     kubectl exec -n "$CAMUNDA_NAMESPACE" "${pod#pod/}" -c postgres -- ls -ld /var/lib/postgresql/data/pgdata/pg_wal
   done
   ```

   ```text
   lrwxrwxrwx 1 postgres tape 30 ... /var/lib/postgresql/data/pgdata/pg_wal -> /var/lib/postgresql/wal/pg_wal
   ```

1. Confirm the standby of each cluster is streaming before you rely on the new instance. The cluster reports a healthy state as soon as both pods are ready, which happens slightly before the standby re-establishes replication after the primary restart:

   ```bash
   for cluster in $(kubectl get cluster -n "$CAMUNDA_NAMESPACE" -o jsonpath='{.items[*].metadata.name}'); do
     primary=$(kubectl get pod -n "$CAMUNDA_NAMESPACE" -l "cnpg.io/cluster=$cluster,cnpg.io/instanceRole=primary" -o jsonpath='{.items[0].metadata.name}')
     echo -n "$cluster: "
     kubectl exec -n "$CAMUNDA_NAMESPACE" "$primary" -c postgres -- psql -U postgres -tAc "SELECT state FROM pg_stat_replication;"
   done
   ```

   ```text
   pg-identity: streaming
   pg-keycloak: streaming
   pg-webmodeler: streaming
   ```

   Until a cluster reports `streaming`, its standby is not a switchover candidate, and a drain started early stalls with `Current primary is running on unschedulable node, but there are no valid candidates` in the operator log.

1. Verify the result by draining the node that hosts the primary, which is the operation that failed before the migration:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
