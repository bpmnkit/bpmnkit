# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                             | Description                                                                                    | Example value         | Default value |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- | ------------- |
| `spring.mail.host`                                   | SMTP server host name                                                                          | `smtp.example.com`    | -             |
| `spring.mail.port`                                   | SMTP server port                                                                               | `587`                 | -             |
| `spring.mail.username`                               | [optional]SMTP user name                                                                  | `hub-user`            | -             |
| `spring.mail.password`                               | [optional]SMTP user password                                                              | \*\*\*                | -             |
| `spring.mail.properties.mail.smtp.auth`              | [optional]Set to `true` if you provide a user name and password.                          | `true`                | `true`        |
| `spring.mail.properties.mail.smtp.starttls.enable`   | [optional]Enable TLS encryption for SMTP connections (using STARTTLS).                    | `true`                | `true`        |
| `spring.mail.properties.mail.smtp.starttls.required` | [optional]Enforce the use of STARTTLS (to prevent fallback to non-protected connections). | `true`                | `true`        |
| `camunda.hub.mail.from-address`                      | Email address used as the sender of emails sent by Camunda Hub.                                | `noreply@example.com` | -             |
| `camunda.hub.mail.from-name`                         | [optional]Name displayed as the sender of emails sent by Camunda Hub.                     | `Camunda`             | `Camunda`     |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
