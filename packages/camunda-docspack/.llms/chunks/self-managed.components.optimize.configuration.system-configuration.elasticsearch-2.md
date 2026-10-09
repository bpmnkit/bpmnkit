# Overview — Elasticsearch (2)

#### Elasticsearch Security

Define a secured connection to be able to communicate with a secured Elasticsearch instance.

| YAML path                               | Environment variable                                                | Default value | Description                                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| es.security.username                    | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SECURITY_USERNAME                    |               | The Basic authentication (x-pack) username.                                                                                                                                                                                                           |
| es.security.password                    | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SECURITY_PASSWORD                    |               | The Basic authentication (x-pack) password.                                                                                                                                                                                                           |
| es.security.ssl.enabled                 | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SSL_ENABLED                          | false         | Used to enable or disable TLS/SSL for the HTTP connection.                                                                                                                                                                                            |
| es.security.ssl.certificate             | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SECURITY_SSL_CERTIFICATE             |               | The path to a PEM encoded file containing the certificate (or certificate chain) that will be presented to clients when they connect.                                                                                                                 |
| es.security.ssl.certificate_authorities | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SECURITY_SSL_CERTIFICATE_AUTHORITIES | [ ]           | A list of paths to PEM encoded CA certificate files that should be trusted, e.g. ['/path/to/ca.crt']. Note: if you are using a public CA that is already trusted by the Java runtime, you do not need to set the certificate_authorities. |
| es.security.ssl.selfSigned              | CAMUNDA_OPTIMIZE_ELASTICSEARCH_SECURITY_SSL_SELF_SIGNED             | false         | Used to specify that the certificate was self-signed.                                                                                                                                                                                                 |

#### Elasticsearch backup settings

| YAML path                | Environment variable                    | Default value | Description                                                              |
| ------------------------ | --------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| es.backup.repositoryName | CAMUNDA_OPTIMIZE_BACKUP_REPOSITORY_NAME | ""            | The name of the snapshot repository to be used to back up Optimize data. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
