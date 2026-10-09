# Deploy an EKS cluster with Terraform

Deploy an Amazon Kubernetes Cluster (EKS) with a Terraform module for a quick Camunda 8 setup.

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, similar to the ROSA HCP Terraform setup. The user should have a similar experience when reading both guides. -->

This guide explains how to provision an [Amazon Web Services (AWS) Elastic Kubernetes Service (EKS) cluster](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html) using Terraform, a widely used Infrastructure as Code (IaC) tool.  
The EKS cluster serves as the infrastructure foundation for running Camunda 8.

Camunda recommends this approach for a robust, sustainable setup. For a quicker trial or proof of concept, or if the Terraform module doesn’t meet your needs, see [Deploy an EKS cluster with eksctl](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl).

For advanced EKS scenarios, see the [Amazon EKS documentation](https://docs.aws.amazon.com/eks/latest/userguide/).

**Tip**

New to Terraform or Infrastructure as Code? Start with the [Terraform IaC documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) and try the [interactive quick start](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code#quick-start).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
