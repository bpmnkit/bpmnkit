# Install Camunda 8 on an EKS cluster

Set up the Camunda 8 environment with Helm and an optional Ingress setup on Amazon EKS.

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, as with docs/self-managed/deployment/helm/cloud-providers/openshift/terraform-setup.md. The user should have a similar experience when reading both guides. -->

This guide provides a comprehensive walkthrough for installing the Camunda 8 Helm chart on your existing AWS Kubernetes EKS cluster. It also includes instructions for setting up optional DNS configurations and other optional AWS-managed services, such as OpenSearch and PostgreSQL.

Lastly you'll verify that the connection to your Self-Managed Camunda 8 environment is working.

**Note: Using Amazon Aurora PostgreSQL as secondary storage**
This page covers both backends. Follow it end to end and pick the **RDBMS** tabs wherever a step offers them, which configures Amazon Aurora PostgreSQL as the secondary storage for the Orchestration Cluster. Keep the default tabs to use Amazon OpenSearch Service instead.

For the chart-level reference behind those tabs, see [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms) and [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
