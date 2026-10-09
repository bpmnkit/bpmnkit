# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — 1. Create the `values.yml` file

Start by creating a `values.yml` file to store the configuration for your environment. This file will contain key-value pairs that will be substituted using `envsubst`. You can find a reference example of this file here:

**Note: Database initialization prerequisite**
If you're using an external Azure Database for PostgreSQL, you must create the individual component databases (Identity and Web Modeler) before installing the Helm chart. This initialization step is covered in the [Configure the database and associated access](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup#configure-the-database-and-associated-access) section of the Terraform setup guide.

Without this step, Management Identity and Web Modeler will fail to connect to their databases.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
