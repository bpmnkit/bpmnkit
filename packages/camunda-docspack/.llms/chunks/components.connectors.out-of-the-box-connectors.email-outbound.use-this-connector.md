# Email connector — Use this connector

New to using an outbound connector? Learn how to add and use this type of connector, apply element templates, use connector secrets, handle results and errors, and more.

Use an outbound connector


## Authentication

You can authenticate to a mail server as follows.

### Simple authentication

This method allows the user to connect to any SMTP, POP3 or IMAP server using an email address and password.

| Parameter  | Description                                                                                                                                                                |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `username` | Enter your full email address (for example, user@example.com) or the username provided by your email service. This is used to authenticate your access to the mail server. |
| `password` | Enter the password for your email account. Keep your password secure and do not share it with others.                                                                      |

### No authentication

For SMTP servers that do not require authentication, select this option to connect without providing
credentials.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
