# Dual-region ROSA HCP Cluster with Terraform

Deploy Red Hat OpenShift in two regions on AWS using a Terraform module for a quick Camunda 8 setup.

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, as with ../amazon-eks/terraform-setup.md. The user should have a similar experience when reading both guides. -->

This guide provides a detailed tutorial for deploying two [Red Hat OpenShift on AWS (ROSA) cluster with Hosted Control Plane (HCP)](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html/architecture/index.html) in two different [regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/). It is specifically tailored for deploying Camunda 8 using Terraform, a widely-used Infrastructure as Code (IaC) tool, details of the High Level design are available in the generic [Red Hat OpenShift dual-region for Camunda 8 guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region).

We recommend this guide for building a robust and sustainable infrastructure that needs to survive a region lost.

This guide aims to help you leverage IaC to streamline and reproduce your cloud infrastructure setup. While it covers the essentials for deploying an ROSA HCP cluster, for more advanced use cases, please refer to the official [Red Hat OpenShift on AWS Documentation](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4).

**Tip**

If you are completely new to Terraform and the idea of IaC, read through the [Terraform IaC documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) and give their [interactive quick start](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code#quick-start) a try for a basic understanding.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
