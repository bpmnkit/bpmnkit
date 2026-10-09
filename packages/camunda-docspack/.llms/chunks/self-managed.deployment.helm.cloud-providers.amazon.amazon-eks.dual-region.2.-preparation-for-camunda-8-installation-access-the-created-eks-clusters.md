# Dual-region setup (EKS) — 2. Preparation for Camunda 8 installation — Access the created EKS clusters

To ease working with two clusters, create or update your local `kubeconfig` to contain those new contexts. Using an alias for those new clusters allows you to directly use kubectl and Helm with a particular cluster.

Update or create your kubeconfig via the [AWS CLI](https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html):

```bash
# the alias allows for easier context switching in kubectl
aws eks --region $REGION_0 update-kubeconfig --name $CLUSTER_0 --alias $CLUSTER_0
aws eks --region $REGION_1 update-kubeconfig --name $CLUSTER_1 --alias $CLUSTER_1
```

The region and name must align with the values you have defined in Terraform.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
