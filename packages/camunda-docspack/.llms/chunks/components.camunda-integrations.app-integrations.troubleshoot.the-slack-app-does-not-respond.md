# Troubleshoot app integrations — The Slack app does not respond

| Symptom                                          | Cause                                              | Fix                                                           |
| :----------------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------ |
| `/api/slack/events` returns `503 slack_disabled` | `slack.botToken` or `slack.signingSecret` is blank | Set `SLACK_BOT_TOKEN` and `SLACK_BOT_SIGNING_SECRET`, restart |
| The slash command does nothing                   | `slack.command` does not match the manifest        | Align the two                                                 |
| Slack cannot reach the backend                   | The backend is on `http`                           | Slack calls `https` only, and there is no socket mode         |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/troubleshoot
