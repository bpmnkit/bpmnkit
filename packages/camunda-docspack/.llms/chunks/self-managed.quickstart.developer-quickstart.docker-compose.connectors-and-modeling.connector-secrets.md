# Use connectors and deploy processes with Docker Compose — Connector secrets

When you run Camunda locally with Docker Compose, some [connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) require credentials or API keys to connect with external services such as Slack, SendGrid, or AWS. Store those values as secrets instead of hardcoding them in your process models.

#### Use centralized secrets

In Camunda 8.10, you can use centralized secrets from local files in both the lightweight and full Docker Compose setups.

1. In the extracted distribution, open the included `secrets/` directory and create a file named `OPENAI_API_KEY`.
1. Enter only the secret value, not `KEY=value`, and save the file as UTF-8 without a byte-order mark.
1. Start the lightweight setup with `docker compose up -d`, or the full setup with `docker compose -f docker-compose-full.yaml up -d`.
1. Reference the secret in a service-task or connector input mapping:

   ```feel
   =camunda.secrets.OPENAI_API_KEY
   ```

You don't need to edit Compose or application YAML. Both setups mount `secrets/` read-only into Orchestration at `/etc/camunda/secrets` and configure `camunda.secrets.stores.file.default.path` through `CAMUNDA_SECRETS_STORES_FILE_DEFAULT_PATH`. The directory isn't mounted into Connectors.

Each filename is a secret name, and the file contents are its value. Use letters, numbers, underscores, or dashes in names. One trailing newline is ignored; other whitespace is part of the value. For names containing dashes, use FEEL backticks:

```feel
=camunda.secrets.`openai-api-key`
```

You can add files while the stack is running. Changes and deletions can take up to 20 minutes to affect resolved values because Orchestration caches secrets. To clear the cache immediately, run `docker compose restart orchestration`, or `docker compose -f docker-compose-full.yaml restart orchestration` for the full setup.

If a missing secret causes a `SECRET_RESOLUTION_ERROR` incident, create the file and resolve the incident in Operate. Creating the file alone doesn't resolve an existing incident.

In this Docker Compose setup, the files are plaintext and intended only for local development. The included `.gitignore` excludes secret files from ordinary commits. Don't force-add secret files, include them in shared archives, or copy their values into BPMN. For production, use a secret store and deployment mechanism that meets your security requirements, such as AWS Secrets Manager or Google Secret Manager.

On native Linux, make sure the container user (UID 1001) can traverse the directory and read the files. Host-user-only permissions can prevent access.

#### Use legacy connector secrets

The existing `connector-secrets.txt` file supplies only the Connectors runtime environment for `{{secrets.NAME}}` references. The file isn't imported into the centralized store, so the two workflows remain independent.

You can add secrets to the connector runtime with the included `connector-secrets.txt` file:

1. Open `connector-secrets.txt` in the extracted directory.
1. Add secrets in the format `NAME=VALUE`, one per line:

   ```text
   SLACK_TOKEN=xoxb-your-token-here
   SENDGRID_API_KEY=SG.your-api-key
   ```

1. Save the file. The secrets become available in connector configurations with the syntax `{{secrets.NAME}}`. For example, `{{secrets.SLACK_TOKEN}}`.

**Warning**
Do not commit `connector-secrets.txt` to version control with real credentials. Use placeholder values in the repository and configure actual secrets in each environment.

For more details, see [configure connector secrets](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/connectors-and-modeling
