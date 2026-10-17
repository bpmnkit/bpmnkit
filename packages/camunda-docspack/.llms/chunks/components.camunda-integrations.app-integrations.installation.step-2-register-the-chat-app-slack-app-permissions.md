# Install app integrations — Step 2: Register the chat app — Slack app permissions

The manifest the CLI deploys requests these bot scopes:

| Scope               | Used for                                                    |
| :------------------ | :---------------------------------------------------------- |
| `app_mentions:read` | Channel mentions reaching a process                         |
| `assistant:write`   | Thread status in the Camunda direct message                 |
| `channels:join`     | Joining a channel after subscribe or `/camunda chat`        |
| `channels:manage`   | Creating a public channel from the connector                |
| `channels:read`     | Reading channel metadata                                    |
| `chat:write`        | Posting messages                                            |
| `commands`          | The slash command                                           |
| `groups:read`       | Reading private channel metadata                            |
| `groups:write`      | Creating a private channel from the connector               |
| `im:history`        | Reading the Camunda direct message                          |
| `im:write`          | Opening a direct message to deliver a personal notification |

And these bot events: `app_home_opened`, `app_mention`, `app_uninstalled`, `channel_archive`, `channel_deleted`, `channel_left`, `group_left`, and `message.im`.

The slash command, event subscriptions, interactivity, and options load all point at the same request URL: `<backend>/api/slack/events`. There is no OAuth redirect URL and no Slack OAuth callback in the backend.

**Warning**
Slack does not grant a new permission to an already installed app. If a release adds a scope, an event, or a request URL, every workspace must reinstall the app before the new behavior works. The app does not fail. It silently does less.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
