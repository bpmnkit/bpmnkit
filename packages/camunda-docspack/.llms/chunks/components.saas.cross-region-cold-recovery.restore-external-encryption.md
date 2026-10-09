# Cross-region cold recovery — Restore external encryption

This section applies only to AWS clusters that use a customer-managed [Bring Your Own Key (BYOK)](https://docs.camunda.io/docs/next/components/saas/byok/index) configuration. If you don't use BYOK, or your cluster is on GCP, skip this section.

You are responsible for configuring the KMS key policies for the recovered cluster.

### Configure the failover cluster's key

1. Open the failover cluster's **Encryption at rest** tab in Console.
2. Follow the instructions shown there to update the AWS KMS key policy for the failover region.

The failover cluster remains in a waiting state until this configuration is complete.

### Restore replication to the original region

If the original region is still unavailable, Console shows a warning that backup replication to that region isn't working. Update the KMS key policy for the original region once it's reachable to restore replication.

Camunda does not create, manage, or modify your AWS KMS keys or policies.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
