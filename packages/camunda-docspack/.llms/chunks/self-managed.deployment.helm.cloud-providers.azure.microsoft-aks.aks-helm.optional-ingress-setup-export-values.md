# Install Camunda 8 on an AKS cluster — (Optional) Ingress Setup — Export Values

Set the following values for your Ingress configuration:

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/export-ingress-setup-vars.sh
```

Additionally, before proceeding, export the following environment variables. These will be used throughout this guide for configuring DNS, certificates, and other Azure resources:

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/export-domain-setup-vars.sh
```

These variables will be referenced in later steps, so make sure they are set in your current shell session before continuing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
