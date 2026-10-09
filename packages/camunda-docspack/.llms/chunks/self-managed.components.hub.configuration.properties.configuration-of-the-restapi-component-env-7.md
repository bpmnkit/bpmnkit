# Property reference — Configuration of the `restapi` component — env

| Environment variable        | Description                                                                | Example value         | Default value |
| --------------------------- | -------------------------------------------------------------------------- | --------------------- | ------------- |
| `RESTAPI_MAIL_HOST`         | SMTP server host name                                                      | `smtp.example.com`    | -             |
| `RESTAPI_MAIL_PORT`         | SMTP server port                                                           | `587`                 | -             |
| `RESTAPI_MAIL_USER`         | [optional]SMTP user name                                              | `hub-user`            | -             |
| `RESTAPI_MAIL_PASSWORD`     | [optional]SMTP user password                                          | \*\*\*                | -             |
| `RESTAPI_MAIL_ENABLE_TLS`   | Enforce TLS encryption for SMTP connections (using STARTTLS).              | `true`                | `true`        |
| `RESTAPI_MAIL_FROM_ADDRESS` | Email address used as the sender of emails sent by Camunda Hub.            | `noreply@example.com` | -             |
| `RESTAPI_MAIL_FROM_NAME`    | [optional]Name displayed as the sender of emails sent by Camunda Hub. | `Camunda`             | `Camunda`     |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
