# Amazon Comprehend connector — Appendix & FAQ

### How do I securely store AWS IAM credentials for my Comprehend connector?

Store your AWS IAM credentials as **secrets** to avoid exposing sensitive information. Follow our [managing secrets guide](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/components/hub/organization/manage-clusters/manage-secrets) to learn more.

### AWS authentication types

You can authenticate the **Amazon Comprehend connector** in two ways:

- **Credentials**: Select this option if you have an AWS **Access Key** and **Secret Key**. This method is applicable for both SaaS and Self-Managed users.
- **Default Credentials Chain (Hybrid/Self-Managed only)**: Select this option if your system uses implicit authentication methods like role-based access, environment variables, or files on the target host. This method is applicable only for Self-Managed or Hybrid environments. It uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve credentials.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend
