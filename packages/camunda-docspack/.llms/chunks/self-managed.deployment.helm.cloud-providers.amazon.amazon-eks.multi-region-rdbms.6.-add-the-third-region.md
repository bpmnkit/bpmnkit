# Multi-region setup with RDBMS (EKS) — 6. Add the third region

Add the third region slot to the running cluster. The two running regions keep processing and don't restart. When you finish, the cluster runs three zones in the `2-2-1` layout and survives the loss of any one region.

This is the same sequence that the reference implementation runs in its CI. The [Add a region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops#add-a-region) runbook explains each step in more detail.

### Prerequisites

- Steps 1 to 5 are complete, and the cluster runs on two regions.
- The third slot is in `regions` in `variables.tf`. The default topology already has it.

### Provision the third region

In `terraform-cluster.tfvars`, change the `active_region_count` line to `3`, then apply the file:

```hcl
active_region_count = 3
```

```bash
cd ../terraform/clusters
terraform apply -var-file=terraform-cluster.tfvars
```

Terraform creates the EKS cluster, the Transit Gateway attachments, and the security group rules of the third region. It doesn't change the two running regions.

### Refresh the environment

Clear the values derived from the old region count, then export the environment again and register the new kubectl context:

```bash
cd ../../procedure
unset CAMUNDA_ACTIVE_REGIONS CAMUNDA_CLUSTER_SIZE CAMUNDA_REPLICATION_FACTOR
. ./export-terraform-outputs.sh
. ./export_environment_prerequisites.sh
./register-kubecontexts.sh
```

The export prints the new topology. Check that it reports three running regions, a cluster size of six, and a replication factor of five.

### Add the region to the cluster

Run the procedure for slot `2`, the third slot:

```bash
./activate-region.sh 2
```

See the activate-region.sh script

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/activate-region.sh
```

The script joins the new cluster to the ClusterSet and installs Camunda in it. Then it adds the zone with `POST /actuator/cluster/zones/<zone>` and waits for the change to report `COMPLETED`.

### Check the three-zone cluster

The script ends with a topology check. To run it again:

```bash
./check-cluster-topology.sh
```

The check passes when the gateway reports six brokers, two in each zone. It also checks for a replication factor of five, the configured partition count, and no unhealthy partition. If it times out, see [Zeebe never reaches the expected broker count](#zeebe-never-reaches-the-expected-broker-count).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
