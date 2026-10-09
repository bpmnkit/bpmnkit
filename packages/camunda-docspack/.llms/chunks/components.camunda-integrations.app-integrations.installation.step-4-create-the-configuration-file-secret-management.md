# Install app integrations — Step 4: Create the configuration file — Secret management

The configuration file supports referencing environment variables for any value.

**Note**
This is strongly recommended for sensitive fields such as passwords, client secrets, and encryption keys.

Instead of hardcoding a secret in `config.yaml`, use the `${{ ENV_VAR_NAME }}` syntax:

```yaml
auth:
  m2m:
    clientId: ${{ AUTH_M2M_CLIENT_ID }}
    clientSecret: ${{ AUTH_M2M_CLIENT_SECRET }}
db:
  password: ${{ DB_PASSWORD }}
  encryptionKey: ${{ DB_ENCRYPTION_KEY }}
teams:
  appPassword: ${{ TEAMS_APP_PASSWORD }}
slack:
  botToken: ${{ SLACK_BOT_TOKEN }}
  signingSecret: ${{ SLACK_BOT_SIGNING_SECRET }}
session:
  secret: ${{ SESSION_SECRET }}
```

You can also use the shorthand `$ENV_VAR_NAME` without braces.

In your deployment, mount the secrets as environment variables on the container (for example, via Kubernetes Secrets, Docker `--env-file`, or your CI/CD pipeline's secret store) rather than storing them in plain text in the config file.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
