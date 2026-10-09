# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — EKS cluster module setup

This module provides the foundational configuration for AWS access and Terraform usage.

We use [Terraform modules](https://developer.hashicorp.com/terraform/language/modules) to abstract resources into reusable components and simplify infrastructure management.

The [Camunda AWS EKS cluster module](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/eks-cluster/) is publicly available and serves as a robust starting point for deploying an Amazon EKS cluster. Review the module before implementation to understand its structure and capabilities.

The module is locally sourced in your clone. Any changes you make to the module in your repository take effect immediately in your setup.

#### Set up the EKS cluster module

1. Go to the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture).

   Verify the layout, and switch into the cluster module:

   ```bash
      cd ./aws/kubernetes/eks-single-region(-irsa)/terraform/

      ls
      # Example output:
      # cluster  vpn

      cd cluster
   ```

1. Review `cluster.tf`. It references the local Terraform module and contains a basic cluster setup that you can adjust to your needs. The file is available here:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
