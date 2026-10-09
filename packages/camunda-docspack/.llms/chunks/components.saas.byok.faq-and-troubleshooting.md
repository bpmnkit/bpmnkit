# FAQ & troubleshooting

Frequently asked questions and troubleshooting guidance for encryption at rest, encryption key types, and external AWS KMS encryption keys in Camunda 8 SaaS.

Frequently asked questions and troubleshooting guidance for encryption at rest, encryption key types, and external AWS KMS encryption keys in Camunda 8 SaaS.


## General questions

### What is encryption at rest?

Encryption at rest protects data on storage media (disks or backups) from unauthorized access.

**Note**
Applies to both Orchestration clusters and Camunda Hub in Camunda 8 SaaS.

### Which encryption options are available?

- Provider-managed (default): Cloud provider keys.
- Camunda-managed software key: Uses Google KMS at software protection level (FIPS 140-2 Level 1).
- Camunda-managed hardware key: Uses Google KMS HSM (FIPS 140-2 Level 3).
- External key: Customer-supplied AWS KMS key (AWS only currently).

Full comparison: [encryption at rest](https://docs.camunda.io/docs/next/components/saas/encryption-at-rest)

### When can I choose the encryption type?

Only during cluster creation. It cannot be changed later.

### Is encryption at rest enabled by default?

Yes. All clusters use provider-managed encryption by default.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/faq-and-troubleshooting
