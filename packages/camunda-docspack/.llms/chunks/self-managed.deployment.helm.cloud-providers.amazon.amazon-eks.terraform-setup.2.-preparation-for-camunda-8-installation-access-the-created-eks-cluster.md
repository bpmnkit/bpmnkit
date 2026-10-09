# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Access the created EKS cluster

You can gain access to the Amazon EKS cluster via the `AWS CLI` using the following command:

```bash
export CLUSTER_NAME="$(terraform console <<<local.eks_cluster_name | jq -r)"

aws eks --region "$AWS_REGION" update-kubeconfig --name "$CLUSTER_NAME" --alias "$CLUSTER_NAME"
```

After updating the kubeconfig, you can verify your connection to the cluster with `kubectl`:

```bash
kubectl get nodes
```

Create a namespace for Camunda:

```shell
export CAMUNDA_NAMESPACE="camunda"
kubectl create namespace "$CAMUNDA_NAMESPACE"
```

In the remainder of the guide, we reference the `CAMUNDA_NAMESPACE` variable as the namespace to create some required resources in the Kubernetes cluster, such as secrets or one-time setup jobs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
