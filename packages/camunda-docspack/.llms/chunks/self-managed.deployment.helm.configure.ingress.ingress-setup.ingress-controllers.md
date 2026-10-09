# Configure the Helm chart with Ingress — Ingress controllers

Ingress resources require the cluster to have a running [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/). There are many options for configuring your Ingress Controller. If you use a cloud provider such as AWS or GCP, follow their Ingress setup guides if an Ingress Controller is not already pre-installed. For AWS EKS Ingress configuration, see [Install Camunda 8 on an EKS cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

### Local setup example

An Ingress controller is also required for local Camunda 8 installation. The following example shows an Ingress controller configuration using the [ingress-nginx controller](https://kubernetes.github.io/ingress-nginx/deploy/#bare-metal-clusters/):

```yaml
# ingress_nginx_values.yml
controller:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  service:
    type: NodePort

  publishService:
    enabled: false
```

Install the [ingress-nginx controller](https://github.com/kubernetes/ingress-nginx) to your local cluster:

```shell
helm install -f ingress_nginx_values.yml \
    ingress-nginx ingress-nginx \
    --repo https://kubernetes.github.io/ingress-nginx \
    --version "4.9.0" \
    --namespace ingress-nginx \
    --create-namespace
```

If your local cluster exposes the Ingress controller on ports other than `80` and `443`, set the ports as described in [configure custom public ports](#configure-custom-public-ports).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
