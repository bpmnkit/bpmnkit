# FAQ & troubleshooting — Camunda-managed keys

- Software vs. hardware: Software uses FIPS 140-2 Level 1, hardware uses FIPS 140-2 Level 3. Both support zero downtime rotation.
- Backups always use provider-managed keys.


## External encryption keys

- Use your own AWS KMS key to encrypt cluster data. You control rotation and revocation and are responsible for monitoring via AWS CloudTrail and Amazon CloudWatch.
- Supported on enterprise plans only.
- Revoking access immediately blocks cluster access; a new key or restored access is required.
- Camunda does not store your key.

Setup instructions: [external encryption setup guide](https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup)

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/faq-and-troubleshooting
