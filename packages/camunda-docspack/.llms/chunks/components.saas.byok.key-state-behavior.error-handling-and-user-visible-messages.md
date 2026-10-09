# Key state behavior — Error handling and user-visible messages

Currently, Camunda displays a single unified message:

```yaml
External encryption key is not ready
```

More granular messaging is planned for future iterations.


## Operator responsibilities and best practices

### Customer responsibilities (BYOK model)

- Maintain and monitor the key lifecycle in AWS.
- Monitor for disable/delete events (CloudWatch & EventBridge).
- Ensure policies remain correct.
- Understand that deleting or disabling the key freezes the cluster.

### Recommended monitoring

Activate:

- **CloudWatch alerts** for key disabled, scheduled deletion, access denied
- **EventBridge** for policy changes
- **CloudTrail** for Encrypt/Decrypt failures and audit logs

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior
