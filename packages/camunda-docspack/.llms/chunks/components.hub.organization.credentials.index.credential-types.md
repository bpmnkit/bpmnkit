# Manage credentials — Credential types

Camunda provides a credential type for each family of connectors that supports credentials. The following types are available:

| Credential type               | Bound to the connector's input | Example connectors                                                                                                                                                                      |
| ----------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS Credential                | `awsCredential`                | Amazon SQS, Amazon S3, Amazon Bedrock, and other Amazon Web Services connectors                                                                                                         |
| REST Authentication           | `authenticationConfiguration`  | HTTP Polling, HTTP REST, GraphQL, Azure OpenAI, and Microsoft Office 365 Mail connectors                                                                                                |
| JDBC Connection               | `configuration`                | Execute SQL Statement on Database                                                                                                                                                       |
| Email Account (Inbound)       | `emailAccountConfiguration`    | Email Boundary Event, Email Intermediate Catch Event, Email Receive Task, and Email Message Start Event connectors                                                                      |
| Email Account (Outbound)      | `emailAccountConfiguration`    | Email Connector                                                                                                                                                                         |
| Kafka Connection              | `kafkaConnectionConfiguration` | Publish Message to Kafka, and the Kafka Boundary Event, Kafka Intermediate Catch Event, Kafka Receive Task, and Kafka Message Start Event connectors                                    |
| Slack Signing Secret          | `inbound.slackCredential`      | Slack Webhook Boundary Event, Slack Webhook Intermediate Catch Event, Slack Webhook Receive Task, and Slack Webhook Message Start Event connectors                                      |
| Slack Token                   | `slackCredential`              | Slack Outbound Connector                                                                                                                                                                |
| Azure Blob Storage Credential | `authenticationConfiguration`  | Azure Blob Storage Outbound Connector                                                                                                                                                   |
| Microsoft Entra ID            | `authenticationConfiguration`  | Microsoft Teams Outbound Connector, and the Microsoft O365 Email Boundary Event, Microsoft O365 Email Intermediate Catch Event, and Microsoft O365 Email Message Start Event connectors |

More connectors gain credential support over time, so this list grows. Each credential type card in the **Create a credential** wizard lists the connectors that currently use that type under **Used by**.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
