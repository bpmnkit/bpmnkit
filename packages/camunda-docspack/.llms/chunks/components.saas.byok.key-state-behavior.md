# Key state behavior

Understand how Camunda 8 SaaS behaves when an external Amazon KMS key used for BYOK is disabled, scheduled for deletion, deleted, or misconfigured.

Learn how Camunda 8 SaaS responds when your external Amazon KMS encryption key (BYOK) becomes unavailable during cluster startup or runtime.

This page applies only to **external customer-managed keys** (AWS KMS). For encryption fundamentals, see the [encryption overview](https://docs.camunda.io/docs/next/components/saas/byok/index).

**Warning**
If your external encryption key is disabled, deleted, or its permissions are revoked, your cluster becomes inaccessible and may enter a frozen state. Camunda cannot recover encrypted data if the key is permanently deleted.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
