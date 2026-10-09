# Email connector — POP3

The Post Office Protocol version 3 (POP3) is an Internet standard protocol used by local email clients to retrieve
emails from a remote server over a TCP/IP connection. POP3 allows users to download messages from their email server to
their local computer, where they can be read, managed, or archived even without an internet connection. It operates on a
simple download-and-delete model, meaning emails are typically removed from the server once they are retrieved.

| Field                    | Description                                                                                            |
| :----------------------- | :----------------------------------------------------------------------------------------------------- |
| `POP3 host`              | The host URL of the POP3 server.                                                                       |
| `POP3 port`              | The host port of the POP3 server.                                                                      |
| `Cryptographic protocol` | Defines how the connection to the server is secured, `TLS`, `SSL` or `None`. Default is typically TLS. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
