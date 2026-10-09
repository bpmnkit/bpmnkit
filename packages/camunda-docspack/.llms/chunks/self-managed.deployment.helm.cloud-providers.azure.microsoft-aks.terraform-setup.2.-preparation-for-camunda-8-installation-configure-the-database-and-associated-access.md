# Deploy an AKS cluster with Terraform (advanced) — 2. Preparation for Camunda 8 installation — Configure the database and associated access

As you now have a database, you need to create dedicated databases for each Camunda component and an associated user that has configured access. Follow these steps to create the database users and configure access.

Due to the tight NSG rules in this example, the only way to access the database is through the AKS cluster.

1. In your terminal, set the necessary environment variables that will be substituted in the setup manifest:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
