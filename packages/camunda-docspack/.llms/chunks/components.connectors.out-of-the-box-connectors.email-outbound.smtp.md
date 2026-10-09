# Email connector — SMTP

Simple Mail Transfer Protocol (SMTP) is the standard communication protocol for sending emails across the Internet. It
facilitates mail transfer from a client's email application to the outgoing mail server and between servers for relaying
email messages to their final destination. SMTP operates on a push model, where the sending server pushes the message to
the receiving server for delivery to the appropriate mailbox.

| Field                    | Description                                                                                            |
| :----------------------- | :----------------------------------------------------------------------------------------------------- |
| `SMTP host`              | The host URL of the SMTP server.                                                                       |
| `SMTP port`              | The host port of the SMTP server.                                                                      |
| `Cryptographic protocol` | Defines how the connection to the server is secured, `TLS`, `SSL` or `None`. Default is typically TLS. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
