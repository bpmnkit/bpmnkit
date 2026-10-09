# Amazon Bedrock AgentCore Long-Term Memory connector — Authentication

To authenticate, choose one of the methods from the **Authentication** dropdown. The supported options are:

- **Credentials**: Select this option if you have a valid pair of access and secret keys provided by your AWS account administrator.

**Note**
This option is applicable for both SaaS and Self-Managed users.

- **Default Credentials Chain**: Select this option if your system is configured as an implicit authentication mechanism, such as role-based authentication, credentials supplied via environment variables, or files on target host. This approach uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve required credentials.

**Note**
This option is applicable only for Self-Managed or hybrid distributions.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-long-term-memory
