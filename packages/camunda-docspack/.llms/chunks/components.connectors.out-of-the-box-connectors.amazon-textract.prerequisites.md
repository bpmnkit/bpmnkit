# Amazon Textract connector — Prerequisites

The following prerequisites are required to use this connector:

| Prerequisite                                                                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Amazon Web Services (AWS) IAM user and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) | A valid AWS Identity and Access Management (IAM) user with permissions configured to allow access to Amazon Textract (and Amazon S3 if used), such as:`AmazonTextractFullAccess`: Required`AmazonS3ReadOnlyAccess`: Required if using Amazon S3 as the document source`AmazonS3FullAccess`: Optional if using Amazon S3 as the output location for asynchronous executionThe [access key pair](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) (_access key_ and _secret access key_) for this IAM user. This is required for connector authentication. |

**Info**
For Amazon Textract setup instructions, refer to the [Amazon Textract Developer Guide](https://docs.aws.amazon.com/textract/latest/dg/getting-started.html).

---
---

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract
