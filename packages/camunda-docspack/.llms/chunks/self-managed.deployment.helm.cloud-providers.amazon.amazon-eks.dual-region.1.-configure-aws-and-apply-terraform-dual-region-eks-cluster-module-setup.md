# Dual-region setup (EKS) — 1. Configure AWS and apply Terraform — Dual-region EKS cluster module setup

This module provides the foundational configuration for AWS access and Terraform usage.

We use [Terraform modules](https://developer.hashicorp.com/terraform/language/modules) to abstract resources into reusable components and simplify infrastructure management.

The [Camunda AWS EKS cluster module](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/eks-cluster/) is publicly available and serves as a robust starting point for deploying Amazon EKS clusters. Review the module before implementation to understand its structure and capabilities.

The module is locally sourced in your clone. Any changes you make to the module in your repository take effect immediately in your setup.

#### Terraform files overview

From your cloned repository, navigate to `aws/kubernetes/eks-dual-region/terraform/clusters`. This contains the Terraform base configuration for the dual-region setup.

##### config.tf

This file contains the [backend](https://developer.hashicorp.com/terraform/language/backend) and [provider](https://developer.hashicorp.com/terraform/language/providers/configuration) configuration, meaning where to store the [Terraform state](https://developer.hashicorp.com/terraform/language/state) and which providers to use, their versions, and potential credentials.

The important part of `config.tf` is the initialization of two AWS providers, as you need one per region and this is a limitation by AWS given everything is scoped to a region.

##### clusters.tf

This file is using [Terraform modules](https://developer.hashicorp.com/terraform/language/modules), which allows abstracting resources into reusable components.

The Terraform modules of [AWS EKS](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/eks-cluster) are an example implementation and can be used for development purposes or as a starting reference.

This contains the declaration of the two clusters. One of them has an explicit provider declaration, as otherwise everything is deployed to the default AWS provider, which is limited to a single region.

##### vpc-peering.tf

For a multi-region setup, you need to have the [virtual private cloud (VPC)](https://aws.amazon.com/vpc/) peered to route traffic between regions using private IPv4 addresses and not publicly route the traffic and expose it. For more information, review the [AWS documentation on VPC peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html).

For dual- or tri-region setups, VPC peering is preferred over [transit gateways](https://aws.amazon.com/transit-gateway/) as it is simpler to manage and has fewer AWS limitations. Other AWS networking options remain valid - choose what best fits your environment. For a complete comparison, review the [AWS documentation](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/transit-vpc-solution.html#peering-vs).

The previously mentioned [Camunda module](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/eks-cluster) will automatically create a VPC per cluster.

This file covers the VPC peering between the two VPCs and allow any traffic between those two by adjusting each cluster's security groups.

##### s3.tf

For Elasticsearch, an S3 bucket is required to allow [creating and restoring snapshots](https://www.elastic.co/guide/en/elasticsearch/reference/current/repository-s3.html). There are [alternative ways](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html), but since this is focused on AWS, it makes sense to remain within the same cloud environment.

This file covers the declaration of an S3 bucket to use for the backups. Additionally, a service account with access to use within the Kubernetes cluster to configure Elasticsearch to access the S3 bucket.

##### output.tf

[Terraform outputs](https://developer.hashicorp.com/terraform/language/values/outputs) allow you to reuse generated values in future steps. For example, the access keys of the service account with S3 access.

##### variables.tf

This file contains various variable definitions for both [local](https://developer.hashicorp.com/terraform/language/values/locals) and [input](https://developer.hashicorp.com/terraform/language/values/variables) types. The difference is that input variables require you to define the value on execution. While local variables are permanently defined, they are namely for code duplication purposes and readability.

#### Preparation

1. Adjust any values in the [variables.tf](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/terraform/clusters/variables.tf) file to your liking. For example, the target regions and their name or CIDR blocks of each cluster.
2. Make sure that any adjustments are reflected in your [environment variables](#export-environment-variables) to ease the [cluster configuration](#2-preparation-for-camunda-8-installation).
3. Set up the authentication for the `AWS` provider.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
