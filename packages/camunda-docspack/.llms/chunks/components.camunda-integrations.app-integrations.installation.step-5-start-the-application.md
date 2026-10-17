# Install app integrations — Step 5: Start the application

### Configure your PostgreSQL connection

Ensure your `config.yaml` has the correct PostgreSQL database settings. The `host` should be the hostname or IP address of your PostgreSQL server as reachable from within the Docker container.

### Configure your Camunda Self-Managed host

Update your `config.yaml` to point to your Camunda Self-Managed distribution:

- Set `auth.kind` and the corresponding auth fields for your identity provider (see [Auth configuration](#auth-configuration)).
- Set each entry in `clusters[].urls` to the correct Camunda service URLs.
- Set `frontendUrl` and `backendUrl` to your public deployment URL.

### Start the backend

Run the App Integrations backend container with the configuration file mounted:

```bash
docker run -d \
  --name app-integrations \
  -p 8080:8080 \
  -e CONFIG=config/app-integrations.yaml \
  -e NODE_ENV=production \
  -v ./config.yaml:/app/apps/backend/config/app-integrations.yaml \
  --restart unless-stopped \
  camunda/app-integrations:SNAPSHOT
```

**Note**

- **`CONFIG` environment variable**: Must be set to `config/app-integrations.yaml` to point to the mounted configuration file.
- **`NODE_ENV` environment variable**: Set to `production` for deployed environments.
- **Volume mount**: The `config.yaml` file is mounted to `/app/apps/backend/config/app-integrations.yaml` inside the container.

A healthy start logs "Slack integration initialized" if the `slack` block is configured. A blank `slack.botToken` or `slack.signingSecret` disables Slack: every request to `/api/slack/*` then answers `503` with `{"error": "slack_disabled"}`, and the backend logs "Slack integration disabled (no Slack bot token / signing secret configured)".

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
