# Install Camunda 8 on an AKS cluster — Export environment variables

To streamline execution of the following commands, we recommend exporting multiple environment variables.

### Export the Helm chart version

The following are the required environment variables with some example values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/chart-env.sh
```

### Export database values

When using standard authentication (username and password), specific environment variables must be set with valid values. Follow the guide for [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup#set-up-azure-authentication) to set them correctly.

Verify the configuration of your environment variables by running the following loop:

### elasticsearch

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/check-env-variables.sh
```

### rdbms

The RDBMS variant requires additional orchestration database variables (`DB_ORCHESTRATION_NAME`, `DB_ORCHESTRATION_USERNAME`, `DB_ORCHESTRATION_PASSWORD`) on top of the base configuration:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/procedure/check-env-variables.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
