# Encryption at rest — Provider encryption key

Default option, managed by Google. Uses FIPS 140-2 validated module.

**Info**
Learn more about [Google default encryption](https://cloud.google.com/docs/security/encryption/default-encryption)


## Camunda-managed keys

### Software key

- Managed by Camunda using Google KMS
- FIPS 140-2 Level 1
- Operations in software
- Zero downtime rotation

### Hardware key

- Managed by Camunda using Google KMS
- FIPS 140-2 Level 3
- Operations in HSM
- Zero downtime rotation


## Bring Your Own Key (BYOK)

Enterprise customers on AWS can use their own AWS KMS key.

- You manage the key lifecycle, including rotation and revocation
- Camunda never stores the key; access occurs via standard AWS KMS integrations
- Zero downtime rotation supported

See the [BYOK setup guide](https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup) for configuration.

---
Source: https://docs.camunda.io/docs/next/components/saas/encryption-at-rest
