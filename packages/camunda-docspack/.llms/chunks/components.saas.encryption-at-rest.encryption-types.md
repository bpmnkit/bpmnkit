# Encryption at rest — Encryption types

| Type               | Managed by | Notes                                                                                                                          |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Provider (default) | Google     | FIPS 140-2 validated encryption module (certificate 4407)                                                                      |
| Software key       | Camunda    | Google KMS software protection; operations in software; FIPS 140-2 Level 1; zero downtime rotation                             |
| Hardware key       | Camunda    | Google KMS hardware (HSM) protection; FIPS 140-2 Level 3; operations in HSM; zero downtime rotation                            |
| BYOK               | Customer   | AWS KMS key; FIPS 140-3 Security Level 3 certification; full control over lifecycle, rotation, and revocation; enterprise only |

---
Source: https://docs.camunda.io/docs/next/components/saas/encryption-at-rest
