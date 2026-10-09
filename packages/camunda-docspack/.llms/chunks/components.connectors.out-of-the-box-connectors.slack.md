# Slack connector

Send messages to channels or users in your Slack workspace from your BPMN process.

The **Slack connector** is an outbound connector that allows you to send messages to channels or users in your [Slack](https://slack.com) workspace from your BPMN process.

**Note**
If your organization uses [Camunda app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations), the [App Integrations connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations) sends through the app your users already have connected, and carries no credentials in the process model.


## Prerequisites

To use the Slack connector, a Slack app must be registered with the Slack workspace you would like to send messages to. A respective OAuth token needs to be configured as a secret in your cluster. Follow [these steps in the appendix](#appendix) to learn how to set this up.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
