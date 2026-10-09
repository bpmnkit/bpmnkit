# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Export values for the Helm chart

After configuring and deploying your infrastructure with Terraform, follow these instructions to export key values for use in Helm charts to deploy [Camunda 8 on Kubernetes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

The following commands will export the required outputs as environment variables. You may need to omit some if you have chosen not to use certain modules. These values will be necessary for deploying Camunda 8 with Helm charts:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
