# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — 1. Create the `values.yml` file

Start by creating a `values.yml` file to store the configuration for your environment. This file will contain key-value pairs that will be substituted using `envsubst`. You can find a reference example of this file here:

**Note: Database initialization prerequisite**
If you're using an external Aurora PostgreSQL database, you must create the individual component databases (Identity and Web Modeler) before installing the Helm chart. This initialization step is covered in the infrastructure setup guides:

- **Terraform**: See [Configure the database and associated access](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#configure-the-database-and-associated-access) in the Terraform setup guide.
- **eksctl**: See [Create the databases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl#create-the-databases) in the eksctl guide.

Without this step, Management Identity and Web Modeler will fail to connect to their databases.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
