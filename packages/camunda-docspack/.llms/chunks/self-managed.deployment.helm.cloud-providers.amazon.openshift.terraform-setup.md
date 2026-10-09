# Deploy a ROSA HCP Cluster with Terraform

Deploy Red Hat OpenShift on AWS using a Terraform module for a quick Camunda 8 setup.

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, as with ../amazon-eks/terraform-setup.md. The user should have a similar experience when reading both guides. -->

This guide provides a detailed tutorial for deploying a [Red Hat OpenShift on AWS (ROSA) cluster with Hosted Control Plane (HCP)](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html/architecture/index.html) capabilities. It is specifically tailored for deploying Camunda 8 using Terraform, a widely-used Infrastructure as Code (IaC) tool.

We recommend this guide for building a robust and sustainable infrastructure. However, if you are looking for a quicker trial or proof of concept, or if your needs aren't fully met by our module, consider following the official [ROSA Quickstart Guide](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html/getting_started/rosa-quickstart-guide-ui.html).

This guide aims to help you leverage IaC to streamline and reproduce your cloud infrastructure setup. While it covers the essentials for deploying an ROSA HCP cluster, for more advanced use cases, please refer to the official [Red Hat OpenShift on AWS Documentation](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4).

**Tip**

If you are completely new to Terraform and the idea of IaC, read through the [Terraform IaC documentation](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) and give their [interactive quick start](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code#quick-start) a try for a basic understanding.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
