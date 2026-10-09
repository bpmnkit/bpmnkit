# Enable secure connectivity

Configure AWS PrivateLink connectivity for a Camunda 8 SaaS Orchestration Cluster in Camunda Hub.

This guide explains how to enable secure connectivity (AWS PrivateLink) for an AWS-hosted Camunda 8 SaaS Orchestration Cluster.

Secure connectivity must be enabled per cluster.

For a conceptual overview, see [secure connectivity (AWS PrivateLink)](https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index).


## Prerequisites

Before enabling secure connectivity:

- The cluster must be hosted in AWS.
- The cluster must be version 8.8.0+.
- You must have [sufficient permissions](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index#roles-and-permissions) to manage clusters in Camunda Hub.
- You must know the AWS account IDs or ARNs that should be allowed to connect.
- Your organization must be on an Enterprise plan.

On the AWS side, you must have:

- An existing AWS VPC.
- Permission to create VPC interface endpoints.
- Appropriate security group configuration.

For instructions on creating a VPC interface endpoint, see the [AWS documentation on configuring an interface VPC endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html).

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
