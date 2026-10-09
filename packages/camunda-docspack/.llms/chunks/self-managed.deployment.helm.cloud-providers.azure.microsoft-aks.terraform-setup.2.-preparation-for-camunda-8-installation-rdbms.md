# Deploy an AKS cluster with Terraform (advanced) — 2. Preparation for Camunda 8 installation — rdbms

The RDBMS variant exports additional environment variables for the orchestration database:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/procedure/vars-create-db.sh
```

A **Kubernetes job** will connect to the database and create the necessary users with the required privileges. The script installs the necessary dependencies and runs SQL commands to create the users and assign them the correct roles and privileges.

2. Create a secret that references the environment variables:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
