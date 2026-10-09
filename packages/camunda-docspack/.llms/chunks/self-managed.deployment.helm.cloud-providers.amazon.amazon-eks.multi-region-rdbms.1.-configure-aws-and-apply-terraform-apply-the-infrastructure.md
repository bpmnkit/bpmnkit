# Multi-region setup with RDBMS (EKS) — 1. Configure AWS and apply Terraform — Apply the infrastructure

The root module creates every EKS cluster, the Transit Gateway mesh, the security group rules, and the Aurora Global Database in a single state.

Keep your settings in a variable file. The reference architecture ships no variable file, so create one:

```hcl title="terraform-cluster.tfvars"
cluster_name            = "camunda"
active_region_count     = 2
np_desired_node_count   = 4
single_nat_gateway      = false
database_instance_class = "db.r6g.large"
default_tags = {
  environment = "evaluation"
}
```

**Note: Start with three regions instead**
This guide starts on two regions and then adds the third, because that path shows how the cluster grows. You can also start directly with all three regions: set `active_region_count = 3`. The cluster then forms with three zones at bootstrap. Skip [step 6](#6-add-the-third-region), and expect six brokers and a replication factor of five in [step 5](#5-verify-the-deployment).

Then apply it:

```bash
cd terraform/clusters
terraform init
terraform apply -var-file=terraform-cluster.tfvars
```

Expect roughly 25 minutes for the EKS clusters and 15 minutes for the Aurora Global Database. They are created in parallel.

With `active_region_count = 2`, the cluster runs two zones, `2-2` at replication factor four. Until you add the third region, it survives no zone loss: losing either zone leaves two replicas of four, which is not a majority.

**Note**
Set up remote Terraform state before deploying anything you intend to keep. The [single-region EKS guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#initialize-terraform) covers creating an S3 backend.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
