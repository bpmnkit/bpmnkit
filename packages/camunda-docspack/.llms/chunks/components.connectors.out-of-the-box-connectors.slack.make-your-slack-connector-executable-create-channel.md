# Slack connector — Make your Slack connector executable — Create channel

**Info**
This API uses the Slack [`conversations.create`](https://api.slack.com/methods/conversations.create) method.
You need to ensure that your Slack application has related permissions enabled.

To create a channel, take the following steps:

1. Set **Method** to `Create Channel`.
2. Set the **New Channel Name**:
   - The channel name can be up to 80 characters, and can contain lowercase letters, digits, and symbols `-` and `_`.
   - This can be provided as a FEEL expression.
3. Set channel **Visibility** as required:
   - **Public** channels are visible to every workspace member.
   - **Private** channels are visible to explicitly invited people only.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
