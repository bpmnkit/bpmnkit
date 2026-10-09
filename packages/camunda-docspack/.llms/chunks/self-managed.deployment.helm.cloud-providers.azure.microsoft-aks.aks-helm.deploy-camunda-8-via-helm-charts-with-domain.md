# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — with-domain

The following makes use of the [combined Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup#configuration) by deploying a single Ingress for all HTTP components and a separate Ingress for the gRPC endpoint.

**Info: Cert-manager annotation for domain installation**
The annotation `kubernetes.io/tls-acme=true` will be [interpreted by cert-manager](https://cert-manager.io/docs/usage/ingress/) and automatically results in the creation of the required certificate request, easing the setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
