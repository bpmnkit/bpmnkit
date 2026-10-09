# Slack connector — Make your Slack connector executable — Invite user to channel

**Info**
This API uses the Slack [`conversations.invite`](https://api.slack.com/methods/conversations.invite) method.
You need to ensure that your Slack application has related permissions enabled.

To invite users to a channel, take the following steps:

1. Set **Method** to `Invite to Channel`.
2. Set the `Invite by` method:
   - Invite by **Channel Name**:
     - The channel name can be up to 80 characters, and can contain lowercase letters, digits, and symbols `-` and `_`.
     - This can be provided as a FEEL expression.
   - Invite by **Channel ID**:
     - The channel ID must be a valid Slack Channel ID.
     - This can be provided as a FEEL expression.
3. Set the **Users** as required:
   1. One single username or email or ID (for example: `@myUser` or `my.user@company.com` or `ABCDEF12345`).
   2. A comma separated list of users (for example: `@myUser, my.user@company.com, ABCDEF12345`).
   3. FEEL expression. In this case you can provide a valid list of strings (for example: `["@myUser", "my.user@company.com", "ABCDEF12345"]`).
   - Formats:
     - If a username starts with an `@` symbol, it will be handled as user name.
     - If a username is in an email format, it will be handled as an email.
     - If a username doesn't start with an `@`, and isn't an email, it will be handled as a user ID.
   - If a null input or an input which is not a type of String or a Collection provided, you will get an Exception.
   - If all username is provided as any other type than a String, you will get an Exception.
   - If one of the usernames is provided as any other type than a String, it will be omitted.
   - If you provide a channel name it will be omitted since it is not possible to invite a channel to another channel.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
