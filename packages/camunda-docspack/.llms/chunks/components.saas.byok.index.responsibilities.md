# Encryption — Responsibilities

| Owner    | Responsibility                                           |
| -------- | -------------------------------------------------------- |
| Customer | Create and manage the AWS KMS key                        |
| Customer | Ensure the key and cluster are in the same AWS Region    |
| Customer | Configure key policies granting Camunda access           |
| Camunda  | Encrypt and decrypt customer data using the provided key |
| Camunda  | Surface any key-related errors in Camunda Hub            |

**Warning: Key management**
If your AWS KMS key is disabled, deleted, or permissions are revoked, your cluster and its data become inaccessible. For details on how Camunda responds when an external AWS KMS key becomes disabled, deleted, or misconfigured, see [key state behavior](https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior).

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/index
