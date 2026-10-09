# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — rdbms

The RDBMS variant extends the Aurora PostgreSQL setup with an additional `camunda_orchestration` database and a dedicated `orchestration_db` user, used as the secondary storage for the Orchestration Cluster:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-rdbms/terraform/cluster/db.tf
   ```

   
   

1. Customize the Aurora cluster setup through various input options. Refer to the [Aurora module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/aurora/README.md) for more details on other customization options.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
