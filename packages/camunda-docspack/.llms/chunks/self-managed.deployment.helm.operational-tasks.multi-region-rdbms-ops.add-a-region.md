# Multi-Region RDBMS operational procedure — Add a region

Adding a region to a running cluster is an online operation. The regions already running keep processing and are not restarted.

The new region's brokers start first. Then `activate-region.sh` adds its zone with `POST /actuator/cluster/zones/<zone>` and waits for the change to report `COMPLETED`. The engine places the zone's replicas and raises the replication factor in one change. It does not renumber any broker.

This section applies to a region slot that you provisioned but never ran. A zone that you removed during failover comes back through [Bring a region back](#bring-a-region-back) instead.

### 1. Provision the infrastructure

Raise `active_region_count` by one in `terraform-cluster.tfvars`, the variable file of the initial deployment, so the new region's cluster, Transit Gateway attachments, and security group rules exist. Then apply the file:

```bash
cd ../terraform/clusters
terraform apply -var-file=terraform-cluster.tfvars
```

Keep the new value in the file. A later `terraform apply` with a lower `active_region_count` destroys the region's infrastructure.

### 2. Update the environment

Re-source the environment so `CAMUNDA_ACTIVE_REGIONS`, the cluster size, and the replication factor reflect the new count, and register a kubectl context for the new cluster:

```bash
cd ../../procedure
unset CAMUNDA_ACTIVE_REGIONS CAMUNDA_CLUSTER_SIZE CAMUNDA_REPLICATION_FACTOR
. ./export-terraform-outputs.sh
. ./export_environment_prerequisites.sh
./register-kubecontexts.sh
```

### 3. Add the region

```bash
./activate-region.sh <slot>
```

The procedure does the following:

1. Joins the new cluster to the ClusterSet.
1. Prepares its storage class, namespace, and database secret.
1. Renders the Helm values with the longer contact point and zone lists.
1. Installs only the new region.
1. Exports its services.
1. Adds the zone to the cluster.
1. Waits for the change to complete.

The regions already running keep their shorter contact point list, and they don't restart. The contact point list matters at bootstrap. Once a cluster forms, a newcomer only has to reach one member, and the rest learn about it by gossip. The running regions pick up the longer list on their next upgrade.

**Warning**
`activate-region.sh` only adds the zone of a slot that was in `regions` when you bootstrapped the cluster. The reference implementation provisions its infrastructure from that slot list. List every region you may ever run in `regions` before the first deployment. The script rejects any slot outside the provisioned range, `0` to `CAMUNDA_REGION_SLOTS - 1`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
