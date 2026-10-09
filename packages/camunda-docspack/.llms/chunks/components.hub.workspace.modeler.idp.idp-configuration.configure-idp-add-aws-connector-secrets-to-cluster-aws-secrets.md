# Configure IDP — Configure IDP — Add AWS connector secrets to cluster {#aws-secrets}

If you are using AWS as your cloud provider, add the following AWS connector secrets required for IDP.

- **SaaS:** Create and configure as [connector secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
- **Self-Managed:** Connector secrets are generally provided as environment variables, set via `values.yaml` or the command line. Add these connector secrets as environment variables for the Tasklist and Zeebe components. To learn more about using connector secrets in Self-Managed, see [managing secrets in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management) and [secrets in manual installations](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secrets).

| Connector secret Key  | Required | Description                                                                                                                                                                                               |
| :-------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IDP_AWS_ACCESSKEY`   | Yes      | The AWS access key ID used to interact with the Amazon S3 bucket.                                                                                                                                         |
| `IDP_AWS_SECRETKEY`   | Yes      | The AWS secret access key associated with the `IDP_AWS_ACCESSKEY`.                                                                                                                                        |
| `IDP_AWS_REGION`      | Yes      | The AWS region where documents can be temporarily stored during Amazon Textract analysis. This should match the region where the Amazon S3 bucket is located.Example: `us-east-1` (default) |
| `IDP_AWS_BUCKET_NAME` | Yes      | The name of the Amazon S3 bucket you want to use for document storage during extraction.Example: `idp-extraction-connector`                                                                 |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
