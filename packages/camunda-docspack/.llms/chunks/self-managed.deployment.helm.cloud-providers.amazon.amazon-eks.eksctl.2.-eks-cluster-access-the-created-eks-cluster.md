# Deploy an EKS cluster with eksctl — 2. EKS cluster — Access the created EKS cluster

Access the Amazon EKS cluster via the `AWS CLI` using the following command:

```shell
aws eks --region "$REGION" update-kubeconfig --name "$CLUSTER_NAME" --alias "$CLUSTER_NAME"
```

After updating the kubeconfig, verify your connection to the cluster with `kubectl`:

```shell
kubectl get nodes
```

Create a namespace for Camunda:

```shell
export CAMUNDA_NAMESPACE="camunda"
kubectl create namespace "$CAMUNDA_NAMESPACE"
```

In the remainder of the guide, we reference the `CAMUNDA_NAMESPACE` variable as the namespace to create some required resources in the Kubernetes cluster, such as secrets or one-time setup jobs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
