# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — PostgreSQL module setup

**Info: Optional module**

If you don't want to use this module, you can skip this section. However, you may need to adjust the remaining instructions to remove references to this module.

If you choose not to use this module, you must either provide a managed PostgreSQL service or use the internal deployment by the Camunda Helm chart in Kubernetes.

Additionally, you must delete the `db.tf` file in the `terraform/cluster` directory of your chosen reference. Otherwise, it will create the resources.

In the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture), PostgreSQL database is required for Web Modeler and Management Identity. These components require persistent storage for user data, configuration, and authentication information. If you deploy Keycloak inside the cluster (for example, via the Keycloak Operator), it also needs a PostgreSQL database.

**Note: Management Identity and multi-tenancy**
Management Identity also requires PostgreSQL, but only when multi-tenancy is enabled, which is not used in this reference architecture. For more information, see [Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy).

We separated the cluster and PostgreSQL modules to offer you more customization options.

#### Set up the Aurora PostgreSQL module

1. Go to the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture).

   Verify the layout and switch into the cluster module. For simplicity, the PostgreSQL file is located in the cluster module:

   ```bash
      cd ./aws/kubernetes/eks-single-region(-irsa)/terraform/

      ls
      # Example output:
      # cluster  vpn

      cd cluster
   ```

1. The `db.tf` file references the local Terraform module and contains a basic Aurora PostgreSQL setup that you can adjust to your needs. The file is available here:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
