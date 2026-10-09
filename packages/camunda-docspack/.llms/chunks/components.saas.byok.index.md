# Encryption

Learn how to configure AWS BYOK (Bring Your Own Key) for Camunda 8 SaaS clusters.

Camunda 8 SaaS encrypts all cluster data at rest. By default, encryption uses cloud provider–managed keys. For stricter compliance or control, you can configure **Bring Your Own Key (BYOK)** with **AWS KMS**, available for clusters hosted in AWS Regions.


## Encryption overview

With BYOK, Camunda 8 SaaS uses your customer-managed key stored in your AWS account.  
You control the key’s lifecycle—creation, access, rotation, and logging—while Camunda handles encryption and decryption operations.

| Category          | Details                                          |
| ----------------- | ------------------------------------------------ |
| Availability      | AWS-hosted clusters only                         |
| Encrypted storage | Document, backup, Zeebe, and Elasticsearch disks |
| Setup             | Configure the key during cluster creation        |
| Rotation          | Managed in AWS KMS (not through Camunda)         |
| Logging           | Key usage visible in AWS CloudTrail              |

Encryption details for beginners

**Encryption at rest** protects stored data from unauthorized access.  
Camunda 8 SaaS supports three encryption models:

| Type                    | Managed by | Description                                                |
| ----------------------- | ---------- | ---------------------------------------------------------- |
| Camunda-managed         | Camunda    | Default encryption, handled automatically                  |
| AWS managed             | AWS        | Encryption in your account, but AWS controls key lifecycle |
| Customer-managed (BYOK) | You        | You create, own, and manage the key in your AWS account    |

Industries such as finance, healthcare, and government often require this level of control for compliance reasons.  
With BYOK, you maintain visibility through **AWS CloudTrail** and **Amazon CloudWatch**, apply your own rotation policies, and centralize audit logs in your AWS account.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/index
