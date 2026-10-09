# Camunda Exporter — Configuration — connect

Helm property path prefix for these options:
`camunda.data.secondary-storage.{elasticsearch|opensearch}.`

Use `url` or `urls` to define the Elasticsearch or OpenSearch endpoint. The `connect` options in this section only fine-tune how Camunda connects to the secondary storage cluster after you configure the endpoint.

**Note**
Please refer to [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#camunda-8-self-managed) to find out which
versions of Elasticsearch and/or OpenSearch are supported in a Camunda 8 Self-Managed setup.

| Option         | Description                                                                                                                   | Default                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| dateFormat     | Defines a custom date format that should be used for fetching date data from the engine (should be the same as in the engine) | yyyy-MM-dd'T'HH:mm:ss.SSSZZ |
| socketTimeout  | Defines the socket timeout in milliseconds, which is the timeout for waiting for data.                                        |                             |
| connectTimeout | Determines the timeout in milliseconds until a connection is established.                                                     |                             |

**Note**
If you are using `opensearch` on AWS, the AWS SDK's [DefaultCredentialsProvider](https://sdk.amazonaws.com/java/api/latest/software/amazon/awssdk/auth/credentials/DefaultCredentialsProvider.html) is used for authentication. For more details on configuring credentials, refer to the [AWS SDK documentation](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html#credentials-default).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
