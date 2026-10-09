# Encryption at rest using external encryption keys

Learn how to configure encryption at rest for a Camunda 8 SaaS Orchestration cluster using external AWS KMS encryption keys.

Learn how to configure encryption at rest for your Camunda 8 SaaS Orchestration cluster using AWS KMS.


## Prerequisites

| Requirement           | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| AWS account           | Access to an AWS account with AWS KMS permissions.                          |
| AWS KMS permissions   | Ability to create and manage AWS KMS keys and attach key policies.          |
| Cluster region        | The AWS KMS key must reside in the same AWS Region as your Camunda cluster. |
| Technical familiarity | Some experience with the AWS Management Console, IAM roles, and AWS KMS.    |

**Warning: Important**

- Deleting or disabling your AWS KMS key will make your cluster and data inaccessible. To understand how Camunda behaves if a key is disabled, deleted, or its policy is changed, see [key state behavior](https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior).
- Key management is fully customer-side in AWS KMS. Camunda cannot rotate keys.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
