# Secure connectivity (AWS PrivateLink) — Security and isolation

Secure connectivity restricts private access to your cluster using AWS PrivateLink and an allowlist of AWS principals.

When enabling secure connectivity, you define one or more allowed AWS principals (AWS account IDs or ARNs). Only those principals can create VPC endpoints that connect to your cluster’s endpoint service.

Requests from AWS accounts that are not explicitly allowed cannot establish a PrivateLink connection.

For each cluster:

- A separate VPC endpoint service is provisioned.
- Cluster-specific networking components are provisioned. Private connectivity does not share entry components across clusters.
- Access to the Orchestration Cluster is handled through the cluster's API gateway layer.

Traffic between your VPC and the cluster’s API gateway layer is encrypted in transit using TLS. TLS terminates at the cluster’s API gateway layer.

Traffic within the cluster follows the same model as public connectivity.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
