# Amazon S3 connector — Authentication

Select an authentication type from the **Authentication** dropdown.

- **Credentials** (SaaS/Self-Managed): Select this option if you have a valid pair of access and secret keys provided by
  your AWS account administrator. This option is supported for both SaaS and Self-Managed users.

- **Default Credentials Chain** (Hybrid/Self-Managed only): Select this option if your system is
  configured as an implicit authentication mechanism, such as role-based authentication, credentials supplied via
  environment variables, or files on target host. This option is only supported for Self-Managed or hybrid
  distributions. This approach uses
  the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html)
  to resolve required credentials.

If you select **Credentials**, you must supply the appropriate
credentials:

- **Access key**: Provide an access key of a user with permissions to the Amazon S3 actions.
- **Secret key**: Provide the secret key of the user with the access key provided above.

**Note**
The **Access key** and the **Secret key** are required properties and must be provided to use the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3
