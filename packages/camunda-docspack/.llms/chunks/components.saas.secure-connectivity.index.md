# Secure connectivity (AWS PrivateLink)

Connect to Camunda 8 SaaS Orchestration Clusters from your AWS VPC using AWS PrivateLink.

Secure connectivity allows you to connect to Camunda 8 SaaS Orchestration Clusters from your AWS Virtual Private Cloud (VPC) using AWS PrivateLink.

When enabled, traffic from your AWS VPC to an Orchestration Cluster is routed over private AWS networking rather than the public internet.

Secure connectivity:

- Applies per cluster.
- Is available only for AWS-hosted Orchestration Clusters.
- Supports inbound connectivity only — it enables private access from your AWS VPC to Camunda, but does not provide outbound private connectivity from Camunda to your services.
- Adds a private connectivity path. Public endpoints remain enabled.
- Is available to Enterprise customers.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
