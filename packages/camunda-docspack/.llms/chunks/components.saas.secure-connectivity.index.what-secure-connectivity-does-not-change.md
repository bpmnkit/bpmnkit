# Secure connectivity (AWS PrivateLink) — What secure connectivity does not change

Secure connectivity:

- Does not change data location or backup regions.
- Does not affect encryption at rest or key management.
- Does not provide outbound private connectivity from Camunda to your services.
- Does not replace IP allowlists or other access control features. If an IP allowlist is configured, it continues to apply to connections made through private connectivity. For more information, see [Manage IP allowlists](https://docs.camunda.io/docs/next/components/saas/clusters/manage-ip-allowlists).

Secure connectivity changes only the network path used for inbound connections from your AWS VPC to the Orchestration Cluster.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
