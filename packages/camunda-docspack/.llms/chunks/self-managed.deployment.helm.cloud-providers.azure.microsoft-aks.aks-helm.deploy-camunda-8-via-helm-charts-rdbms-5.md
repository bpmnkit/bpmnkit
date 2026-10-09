# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — rdbms

The RDBMS variant does **not** require Elasticsearch or the ECK Operator. The Helm values already configure PostgreSQL as the secondary storage, and Elasticsearch is disabled.

Skip directly to [filling your deployment with actual values](#fill-your-deployment-with-actual-values).

#### Fill your deployment with actual values {#fill-your-deployment-with-actual-values}

Once you've prepared the `values.yml` file, run the following `envsubst` command to substitute the environment variables with their actual values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/assemble-envsubst-values.sh
```

**Note: Web Modeler SMTP secret**
If you plan to enable Web Modeler, create the SMTP secret required for email notifications ([see how it's used by Web Modeler](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#smtp--email)):

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/create-webmodeler-secret.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
