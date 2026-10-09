# Overview — OpenSearch (2)

#### OpenSearch security

Define a secured connection to be able to communicate with a secured OpenSearch instance.

| YAML path                                       | Environment variable                                             | Default value | Description                                                                                                                                                                                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| opensearch.security.username                    | CAMUNDA_OPTIMIZE_OPENSEARCH_SECURITY_USERNAME                    |               | The Basic authentication username.                                                                                                                                                                                                                           |
| opensearch.security.password                    | CAMUNDA_OPTIMIZE_OPENSEARCH_SECURITY_PASSWORD                    |               | The Basic authentication password.                                                                                                                                                                                                                           |
| opensearch.security.ssl.enabled                 | CAMUNDA_OPTIMIZE_OPENSEARCH_SSL_ENABLED                          | false         | Used to enable or disable TLS/SSL for the HTTP connection.                                                                                                                                                                                                   |
| opensearch.security.ssl.certificate             | CAMUNDA_OPTIMIZE_OPENSEARCH_SECURITY_SSL_CERTIFICATE             |               | The path to a PEM encoded file containing the certificate (or certificate chain) that will be presented to clients when they connect.                                                                                                                        |
| opensearch.security.ssl.certificate_authorities | CAMUNDA_OPTIMIZE_OPENSEARCH_SECURITY_SSL_CERTIFICATE_AUTHORITIES | [ ]           | A list of paths to PEM encoded CA certificate files that should be trusted, for example ['/path/to/ca.crt']. NOTE: if you are using a public CA that is already trusted by the Java runtime, you do not need to set the certificate_authorities. |
| opensearch.security.ssl.selfSigned              | CAMUNDA_OPTIMIZE_OPENSEARCH_SECURITY_SSL_SELF_SIGNED             | false         | Used to specify that the certificate was self-signed.                                                                                                                                                                                                        |

#### OpenSearch backup settings

| YAML path                        | Environment variable                    | Default value | Description                                                              |
| -------------------------------- | --------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| opensearch.backup.repositoryName | CAMUNDA_OPTIMIZE_BACKUP_REPOSITORY_NAME | ""            | The name of the snapshot repository to be used to back up Optimize data. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
