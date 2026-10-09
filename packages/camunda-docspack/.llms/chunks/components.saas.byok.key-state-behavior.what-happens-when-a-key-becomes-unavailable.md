# Key state behavior — What happens when a key becomes unavailable?

When a cluster loses access to its KMS key:

- All encryption/decryption requests fail immediately.
- Zeebe, Elasticsearch, and backup operations **freeze**.
- Camunda Hub may still show the cluster as **Healthy**, even though no work can proceed.
- Within ~15 minutes, the **Encryption at rest** panel displays:
  > **External encryption key is not ready**

### Timeline of effects

1. **Immediate (0–1s):** Key becomes inaccessible.
2. **Seconds:** Storage reads/writes hang.
3. **Backup jobs:** Become stuck “In progress” indefinitely.
4. **Suspend/Resume:** Requests appear accepted but never execute.
5. **Console status:** May incorrectly continue to show “Healthy.”
6. **After re-enabling:** Automatic recovery occurs, but timing depends on reconciliation and exponential backoff.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
