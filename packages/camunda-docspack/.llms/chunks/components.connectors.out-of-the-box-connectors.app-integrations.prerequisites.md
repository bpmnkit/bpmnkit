# App Integrations connector — Prerequisites

---
---


## Use this connector

New to using an outbound connector? Learn how to add and use this type of connector, apply element templates, use connector secrets, handle results and errors, and more.

Use an outbound connector

App integrations must be set up before this connector can be used. This is an administrator task, done once per environment. There is nothing to configure on the task itself.

### saas

An organization administrator must turn on **Enable app integrations extensions** in the [cluster settings](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings#enable-app-integrations-extensions) of every cluster that uses the connector.

### self-managed

An administrator must install app integrations and configure the connector runtime to reach it:

1. Install and configure app integrations, as described in [Install app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation). The same installation serves this connector, and the Microsoft Teams and Slack apps.
1. Point the connector runtime at that installation, as described in [configure the App Integrations connection](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#configure-the-app-integrations-connection).

When the runtime authenticates with OAuth 2.0, it also needs the cluster's ID. This is the most common reason a fully installed environment still fails: without it, every job fails with `APP_INTEGRATIONS_NOT_CONFIGURED`. Runtimes that authenticate with an API key do not need it, and SaaS needs no equivalent setting.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
