# Dual-region setup (EKS)

Deploy two Amazon Kubernetes (EKS) clusters with Terraform for a peered setup allowing dual-region communication.

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, similar to the single-region Terraform setup. The user should have a similar experience when reading both guides. -->

<!-- Image source: https://docs.google.com/presentation/d/1w1KUsvx4r6RS7DAozx6X65BtLJcIxU6ve_y3bYFcfYk/edit?usp=sharing -->

**Caution**
Review our [dual-region concept documentation](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) before continuing to understand the current limitations and restrictions of this blueprint setup.

This guide explains how to deploy two [Amazon Web Services (AWS) Elastic Kubernetes Service (EKS) clusters](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html) in a dual-region setup using Terraform, a widely used Infrastructure as Code (IaC) tool.
The dual-region EKS clusters serve as the infrastructure foundation for running Camunda 8 with disaster recovery capabilities.

For advanced EKS scenarios, see the [Amazon EKS documentation](https://docs.aws.amazon.com/eks/latest/userguide/).

**Tip**

New to Terraform or Infrastructure as Code? Start with the [Terraform IaC documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) and try the [interactive quick start](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code#quick-start). Additionally, review the [single-region EKS Terraform setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup) for the essentials of setting up an Amazon EKS cluster and configuring AWS IAM permissions.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
