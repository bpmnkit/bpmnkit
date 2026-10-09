# Slack connector — Appendix

To use the **Slack connector**, the following prerequisites need to be set up.

1. [Slack workspace](#use-a-well-known-slack-workspace) - The workspace the **Slack connector** will communicate with.
2. [Slack basic app with bot token configured](#configure-a-basic-slack-app) - The **Slack connector** will communicate through this Slack app with the workspace. You can consider the Slack app as _Slack bot representing the Camunda platform_.
3. [Slack bot token stored as secret](#store-slack-bot-token-as-secret) - The secret will store the Slack bot token and can be used to reference it from BPMN processes without revealing it in the BPMN `xml`.

### Use a well-known Slack workspace

A Slack workspace consists of channels in which workspace members can communicate and collaborate. A workspace is identified by a unique name, for example `https://myWorkspace.slack.com/`. In most cases you will know which workspace you want to connect with already. If you want to set up a new workspace, refer to the [official Slack documentation](https://slack.com/help/articles/115001344007-Create-a-workspace-on-Enterprise-Grid).

### Configure a basic Slack app

**Caution**
You can only install a Slack app to a workspace in which you are a member or that you own. It is not possible if you have guest-only permissions. See the [guide to apps in Slack](https://slack.com/help/articles/360001537467-Guide-to-apps-in-Slack) for more details.

The **Slack connector** communicates through a Slack app with a concrete Slack workspace. For example, when sending a Slack message, the message will be posted by the Slack app. For the **Slack connector** to work, you need to perform the following steps:

1. [Create a Slack app](https://api.slack.com/apps).
2. [Request required scopes](https://api.slack.com/scopes) - The scopes represent what your app can and cannot do (for example, posting messages).
   1. For the **Create Channel** method to work, you need to grant at least the [`channels:manage`](https://api.slack.com/scopes/channels:manage) scope.
   2. For the **Post Message** method to work, you need to grant at least the [`chat:write`](https://api.slack.com/scopes/chat:write) scope.
3. [Install the Slack app to your workspace](https://api.slack.com/authentication/basics#installing).
4. [Invite the Slack app to your workspace via /invite](https://slack.com/help/articles/201259356-Slash-commands-in-Slack#h_01EPZ2Z81EJ67RA2BGDKZ9M1AN).

Once the app is set up, copy the [bot token](https://api.slack.com/authentication/token-types) of the app. It is represented as a string and begins with `xoxb-`. This is the OAuth Bearer token, which the **Slack connector** will use to authenticate with the Slack API.

### Store Slack bot token as secret

The **Slack connector** uses an OAuth bearer token (for example, the Slack app bot token) to authenticate with the Slack API.

We advise you to keep your Slack bot token safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret `SLACK_OAUTH_TOKEN` so you can reference it later in the connector.

The **Slack inbound connector** is a connector that allows you to start or continue
a BPMN process triggered by a [Slack](https://slack.com/) message.

**Note**
If your organization uses [Camunda app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations), the [App Integrations connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations#receive-a-chat-message) receives chat messages through the app your users already have connected.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
