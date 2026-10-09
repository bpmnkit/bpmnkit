# Cross-region cold recovery

Recover an Orchestration Cluster in a secondary region from replicated backups.


## About

Cross-region cold recovery creates a new Orchestration Cluster in a secondary region and restores selected backup data after a primary-region outage. A warm standby cluster is not running before the outage.

Cross-region cold recovery is generally available starting from Camunda 8.7 or later. It is supported for AWS and GCP clusters, including AWS clusters that use a customer-managed [Bring Your Own Key (BYOK)](https://docs.camunda.io/docs/next/components/saas/byok/index) configuration.


## Supported region pairs

Cross-region cold recovery is available only for specific region pairs marked **Failover supported** when you select your region and backup location in Console. Each pair supports failover in both directions.

| Cloud provider | Region pair                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| AWS            | US East (Ohio) (us-east-2) and US East (N. Virginia) (us-east-1)                |
| AWS            | US East (Ohio) (us-east-2) and US West (Oregon) (us-west-2)                     |
| GCP            | Council Bluffs, Iowa (us-central1) and Moncks Corner, South Carolina (us-east1) |

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
