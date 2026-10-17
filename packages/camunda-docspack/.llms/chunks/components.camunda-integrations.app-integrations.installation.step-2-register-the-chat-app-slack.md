# Install app integrations — Step 2: Register the chat app — slack

Skip this tab if you are not registering Slack.

Install the CLI:

```bash
npm install -g @camunda/app-integration-cli
```

Create a new Slack app project:

```bash
c8-slack create my-slack-app
```

The CLI prompts you for:

| Question          | Default                                 | Constraint                                                   |
| :---------------- | :-------------------------------------- | :----------------------------------------------------------- |
| App name          | `Camunda`                               | 1 to 35 characters                                           |
| Bot display name  | The app name                            | 1 to 80 characters                                           |
| Short description | `Your perfect integration with Camunda` | 140 characters or fewer                                      |
| Background color  | `#000000`                               | `#rgb` or `#rrggbb`                                          |
| Slash command     | `/camunda`                              | 32 characters or fewer, no spaces or slashes after the first |
| Slack app         | Create a new one                        | Or supply an existing Slack app ID and workspace ID          |
| Backend URL       | None                                    | **Must be `https`.** The CLI rejects `http`                  |

You are not asked for any Slack request URLs. All of them are derived as `<backend>/api/slack/events`.

Build and deploy:

```bash
cd my-slack-app
pnpm install
c8-slack build
c8-slack deploy
```

`c8-slack deploy` publishes the manifest, installs the app, uploads the icon, stores the credentials, and prints the config. Keep these points in mind, since each one otherwise costs an administrator an afternoon:

1. The backend URL must be `https`. The CLI rejects `http` at the prompt.
2. `deploy` needs a Slack app configuration token, resolved in this order: `--token`, then the `SLACK_CONFIG_TOKEN` environment variable, then an interactive sign-in. A non-interactive run with neither fails with "No Slack configuration token available. Set SLACK_CONFIG_TOKEN or pass --token."
3. `show-config` prints secret values only to a terminal. Redirected output withholds them.

If the workspace requires admin approval, deployment stops and points at `https://api.slack.com/apps/<appId>/install-on-team`.

**Tip**
If you need to retrieve the configuration snippet again later, run:

```bash
c8-slack show-config
```

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
