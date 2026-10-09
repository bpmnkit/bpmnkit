# Configure Camunda 8 Run — Manage local secrets (2)

For example, set the cache duration to one minute:

```bash
C8RUN_SECRETS_CACHE_TTL=1m ./c8run start
```

To use another local directory for secret commands and startup, set the same path for both commands:

```bash
C8RUN_SECRETS_DIR=./temporary-secrets ./c8run secrets set API_KEY
C8RUN_SECRETS_DIR=./temporary-secrets ./c8run start
```

The default directory is shared across projects and c8run versions for the current operating-system user. Set a stable absolute `C8RUN_SECRETS_DIR` per project when the same secret name needs different values. c8run warns when the platform-default directory and the configured directory both contain entries. Run `./c8run secrets path` to confirm the active local directory.

After rotating, importing, or deleting a value, existing cached resolutions can use the previous value until the cache entry expires. Restart Camunda 8 Run to clear the cache immediately.

On Windows, use PowerShell or Command Prompt for hidden interactive entry. In Git Bash, prefix the command with `winpty`, or use `--stdin`.

Local secret commands manage only the c8run file store. Set `C8RUN_SECRETS_MODE=external` whenever you configure another file path, AWS Secrets Manager, or Google Secret Manager through `--config`, `application.yaml`, or Spring environment settings. c8run doesn't detect explicit store configuration and otherwise configures its local default store. Use the external store's management tools instead of `c8run secrets`.

The local secrets directory is for development only. For production, configure a supported managed secret store instead of reusing Camunda 8 Run secrets.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
