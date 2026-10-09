# AI Agent Task connector — Memory (3)

To authenticate, choose one of the methods from the **Authentication** dropdown:

- Use **Credentials** if you have a valid pair of access and secret keys. The IAM user requires permissions for the `bedrock-agentcore:CreateEvent` and `bedrock-agentcore:ListEvents` actions.

**Note**
This option is applicable for both SaaS and Self-Managed users.

- Use **Default Credentials Chain** if your system is configured with an implicit authentication mechanism, such as role-based authentication, credentials supplied via environment variables, or files on target host. This approach uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve required credentials.

**Note**
This option is applicable only for Self-Managed or hybrid distributions.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
