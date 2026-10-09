# OpenSearch exporter — Configuration — aws

When running OpenSearch in AWS, you may require requests to be signed. By enabling AWS in the configuration, a request interceptor will be added to the exporter. This interceptor will take care of signing the requests.

Signing requests requires credentials. These credentials are not directly configurable in the exporter. Instead, they are resolved by following the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html).

| Option       | Description                                                                             | Default                                            |
| ------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| enabled      | Enables AWS request signing                                                             | `false`                                            |
| service-name | AWS' name of the service to where requests are made. For OpenSearch this should be `es` | `es`                                               |
| region       | The region this exporter is running in                                                  | The value of the `AWS_REGION` environment variable |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
