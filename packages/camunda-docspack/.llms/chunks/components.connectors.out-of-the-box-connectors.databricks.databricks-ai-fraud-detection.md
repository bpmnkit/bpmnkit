# Trigger a process from Databricks with a webhook

Trigger a Camunda process from a Databricks notebook with a webhook, route high-risk transactions for manual review, and draft a follow-up email with the OpenAI and SendGrid connectors.

Trigger a Camunda process directly from a Databricks notebook with the [HTTP Webhook connector](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook), using fraud detection as the example scenario.


## Scenario

A Databricks job scores a transaction and sends the result to Camunda through a webhook. Camunda starts a process instance, drafts a review email with the OpenAI connector, and routes the transaction based on its risk score:

- A risk score of 0.75 or higher triggers an AI-drafted email that a fraud analyst reviews and approves before it's sent.
- A risk score below 0.75 ends the process automatically, with no email sent.

This scenario fits a webhook integration well because Databricks controls when the process starts, and the payload maps directly onto a small set of process variables.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
