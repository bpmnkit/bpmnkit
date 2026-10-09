# Deploy an EKS cluster with eksctl

Deploy an Amazon Kubernetes cluster (EKS) with eksctl with step-by-step guidance.

This guide explores the streamlined process of deploying Camunda 8 Self-Managed on Amazon Elastic Kubernetes Service (EKS) using the `eksctl` command-line tool.

[Eksctl](https://eksctl.io/) is a common CLI tool for quickly creating and managing your Amazon EKS clusters and is [officially endorsed](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html) by Amazon.

While this guide is suitable for testing purposes, building a robust, scalable, and reproducible infrastructure is better achieved using Infrastructure as Code (IaC) tools like those described in the [Terraform guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), which offers more flexibility and control over your cloud environment.

This guide provides a user-friendly approach for setting up and managing Amazon EKS clusters. It covers everything from the prerequisites, such as AWS IAM role configuration, to creating a fully functional Amazon EKS cluster and a managed Aurora PostgreSQL instance. Ideal for those seeking a practical and efficient method to deploy Camunda 8 on AWS, this guide provides detailed instructions for setting up the necessary environment and AWS IAM configurations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
