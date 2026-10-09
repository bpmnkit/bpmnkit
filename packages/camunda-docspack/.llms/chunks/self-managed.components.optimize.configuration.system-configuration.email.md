# Overview — Email

Settings for the email server to send email notifications, e.g. when an alert is triggered.

| YAML path                             | Environment variable                                    | Default value | Description                                                                                                     |
| ------------------------------------- | ------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| email.enabled                         | CAMUNDA_OPTIMIZE_EMAIL_ENABLED                          | false         | A switch to enable the email sending functionality.                                                             |
| email.address                         | CAMUNDA_OPTIMIZE_EMAIL_ADDRESS                          |               | Email address that can be used to send notifications.                                                           |
| email.hostname                        | CAMUNDA_OPTIMIZE_EMAIL_HOSTNAME                         |               | The smtp server name.                                                                                           |
| email.port                            | CAMUNDA_OPTIMIZE_EMAIL_PORT                             | 587           | The smtp server port. This one is also used as SSL port for the security connection.                            |
| email.checkServerIdentity             | CAMUNDA_OPTIMIZE_EMAIL_CHECK_SERVER_IDENTITY            | false         | A switch to control checking the identity of the email server.                                                  |
| email.authentication.enabled          | CAMUNDA_OPTIMIZE_EMAIL_AUTHENTICATION_ENABLED           |               | A switch to enable email server authentication.                                                                 |
| email.authentication.username         | CAMUNDA_OPTIMIZE_EMAIL_AUTHENTICATION_USERNAME          |               | Username of your smtp server.                                                                                   |
| email.authentication.password         | CAMUNDA_OPTIMIZE_EMAIL_AUTHENTICATION_PASSWORD          |               | Corresponding password to the given user of your smtp server.                                                   |
| email.authentication.securityProtocol | CAMUNDA_OPTIMIZE_EMAIL_AUTHENTICATION_SECURITY_PROTOCOL |               | States how the connection to the server should be secured. Possible values are 'NONE', 'STARTTLS' or 'SSL/TLS'. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
