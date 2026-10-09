# Email connector — IMAP

The Internet Message Access Protocol (IMAP) is a protocol used by email clients to access messages stored on a mail
server, allowing users to view and manage their emails from multiple devices. Unlike POP3, IMAP supports both online and
offline modes, synchronizes email across devices, and allows manipulation of mailboxes (create, delete, and rename) as
well as messages (read, delete, or flag) directly on the server.

| Field                    | Description                                                                                            |
| :----------------------- | :----------------------------------------------------------------------------------------------------- |
| `IMAP host`              | The host URL of the IMAP server.                                                                       |
| `IMAP port`              | The host port of the IMAP server.                                                                      |
| `Cryptographic protocol` | Defines how the connection to the server is secured, `TLS`, `SSL` or `None`. Default is typically TLS. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
