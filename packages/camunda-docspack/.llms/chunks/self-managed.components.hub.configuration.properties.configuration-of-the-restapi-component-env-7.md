# Property reference — Configuration of the `restapi` component — env

| Environment variable                                 | Description                                                                                    | Example value         | Default value |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- | ------------- |
| `SPRING_MAIL_HOST`                                   | SMTP server host name                                                                          | `smtp.example.com`    | -             |
| `SPRING_MAIL_PORT`                                   | SMTP server port                                                                               | `587`                 | -             |
| `SPRING_MAIL_USERNAME`                               | [optional]SMTP user name                                                                  | `hub-user`            | -             |
| `SPRING_MAIL_PASSWORD`                               | [optional]SMTP user password                                                              | \*\*\*                | -             |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`              | [optional]Set to `true` if you provide a user name and password.                          | `true`                | `true`        |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`   | [optional]Enable TLS encryption for SMTP connections (using STARTTLS).                    | `true`                | `true`        |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED` | [optional]Enforce the use of STARTTLS (to prevent fallback to non-protected connections). | `true`                | `true`        |
| `CAMUNDA_HUB_MAIL_FROMADDRESS`                       | Email address used as the sender of emails sent by Camunda Hub.                                | `noreply@example.com` | -             |
| `CAMUNDA_HUB_MAIL_FROMNAME`                          | [optional]Name displayed as the sender of emails sent by Camunda Hub.                     | `Camunda`             | `Camunda`     |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
